/**
 * Populates the QLeaderboard sheet by aggregating qualification data for each climber across a circuit.
 * It calculates total quali points, tops, zones, flashes, and number of qualis participated in.
 * This simplified version reads all data directly from the QRankings sheet.
 *
 * Data is read from QRankings sheet ONLY.
 * The final ranked data is written to the QLeaderboard sheet.
 */
function QLeaderboardUpdate() {
  var sheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Google Sheet ID if it's different
  var ss = SpreadsheetApp.openById(sheetId);

  // Source sheet
  var qRankingsSheet = ss.getSheetByName("QRankings");

  // Destination sheet
  var qLeaderboardSheet = ss.getSheetByName("QLeaderboard");

  // --- 1) Clear existing QLeaderboard data (but keep header) ---
  if (qLeaderboardSheet.getLastRow() > 1) {
    qLeaderboardSheet
      .getRange(2, 1, qLeaderboardSheet.getLastRow() - 1, qLeaderboardSheet.getLastColumn())
      .clearContent()
      .clearFormat(); // Clear content, formats, and notes
  }

  // --- Helper function to map a comp number to a circuit/season ---
  function getCircuitFromQualiNum(num) {
    if (num >= 1 && num <= 10) {
      return "MC01";
    } else if (num >= 11 && num <= 20) {
      return "MC02";
    }
    // Add more circuits as needed
    // else if (num >= 21 && num <= 30) {
    //   return "MC03";
    // }
    return null; // Unknown or out-of-range
  }
  
  // --- Helper to normalize climber names to handle inconsistencies ---
  function normalizeClimberName(name) {
    if (typeof name !== 'string' || !name) {
      return '';
    }
    // Converts to lowercase and trims whitespace
    return name.trim().toLowerCase();
  }

  // --- 2) Build a data structure to accumulate each climber’s stats per circuit ---
  var circuitData = {};
  var climberNameMap = {}; // Stores { normalizedName: "Original Name" }

  // Helper to initialize the data structure for a new climber in a circuit
  function initClimber(circuit, normalizedClimber, originalClimber) {
    if (!circuitData[circuit]) {
      circuitData[circuit] = {};
    }
    if (!circuitData[circuit][normalizedClimber]) {
      circuitData[circuit][normalizedClimber] = {
        qualiPoints: 0,
        tops: 0,
        zones: 0,
        flashes: 0,
        qualisCount: 0
      };
      // Store the first-seen version of the name as the canonical one
      if (!climberNameMap[normalizedClimber]) {
        climberNameMap[normalizedClimber] = originalClimber;
      }
    }
  }

  // --- 3) Parse QRankings to get all climber stats ---
  // Expected columns: [Quali, Climber, Quali Points, Flashes, Tops, Zones]
  var qRankingsData = qRankingsSheet.getDataRange().getValues();
  for (var i = 1; i < qRankingsData.length; i++) {
    var row = qRankingsData[i];
    var qualiName = row[0];
    var originalClimberName = row[1];
    var points = parseFloat(row[2]) || 0;
    var flashes = parseInt(row[3], 10) || 0;
    var tops = parseInt(row[4], 10) || 0;
    var zones = parseInt(row[5], 10) || 0;
    
    if (!qualiName || !originalClimberName) continue;

    var normalizedClimber = normalizeClimberName(originalClimberName);
    if (!normalizedClimber) continue;

    // Extract comp number from quali name using regex for robustness
    var qualiNumMatch = String(qualiName).match(/\d+/);
    if (!qualiNumMatch) continue; // Skip if no number is found in the name
    var qualiNum = parseInt(qualiNumMatch[0], 10);
    var circuit = getCircuitFromQualiNum(qualiNum);
    if (!circuit) continue;

    initClimber(circuit, normalizedClimber, originalClimberName);

    // Aggregate all stats for the climber
    circuitData[circuit][normalizedClimber].qualiPoints += points;
    circuitData[circuit][normalizedClimber].tops += tops;
    circuitData[circuit][normalizedClimber].zones += zones;
    circuitData[circuit][normalizedClimber].flashes += flashes;
    circuitData[circuit][normalizedClimber].qualisCount++;
  }

  // --- 4) Convert data to a sorted array and write to the QLeaderboard sheet ---
  var outputRows = [];
  var allCircuits = Object.keys(circuitData).sort(); // e.g., ["MC01", "MC02"]

  allCircuits.forEach(function (circuit) {
    var climbersMap = circuitData[circuit];
    var climbersArray = Object.keys(climbersMap).map(function (normalizedName) {
      return {
        circuit: circuit,
        climber: climberNameMap[normalizedName] || normalizedName, // Use canonical name
        qualiPoints: climbersMap[normalizedName].qualiPoints,
        tops: climbersMap[normalizedName].tops,
        zones: climbersMap[normalizedName].zones,
        flashes: climbersMap[normalizedName].flashes,
        qualisCount: climbersMap[normalizedName].qualisCount
      };
    });

    // Sort by: 1. Quali Points (desc), 2. Tops (desc), 3. Zones (desc)
    climbersArray.sort(function (a, b) {
      if (b.qualiPoints !== a.qualiPoints) {
        return b.qualiPoints - a.qualiPoints;
      }
      if (b.tops !== a.tops) {
        return b.tops - a.tops;
      }
      return b.zones - a.zones;
    });

    // Assign place, handling ties
    for (var k = 0; k < climbersArray.length; k++) {
      if (k === 0) {
        climbersArray[k].place = 1;
      } else {
        var prev = climbersArray[k - 1];
        var curr = climbersArray[k];
        if (curr.qualiPoints === prev.qualiPoints && curr.tops === prev.tops && curr.zones === prev.zones) {
          curr.place = prev.place; // It's a tie
        } else {
          curr.place = k + 1; // Not a tie, place is the row number (plus one)
        }
      }
    }

    // Push each row for the circuit into the output array
    climbersArray.forEach(function (item) {
      outputRows.push([
        item.circuit,      // A: Circuit
        item.place,        // B: Place
        item.climber,      // C: Climber
        item.qualiPoints,  // D: Quali Points
        item.tops,         // E: Tops
        item.zones,        // F: Zones
        item.flashes,      // G: Flashes
        item.qualisCount   // H: Number of Qualis
      ]);
    });
  });

  // Write the data to the sheet if any rows were generated
  if (outputRows.length > 0) {
    qLeaderboardSheet
      .getRange(2, 1, outputRows.length, outputRows[0].length)
      .setValues(outputRows);
  }

  // --- 5) Color rows and set font weights ---
   var lastRow = qLeaderboardSheet.getLastRow();
   if (lastRow <= 1) return; // Nothing to format

   var lastColumn = qLeaderboardSheet.getLastColumn();
   var leaderboardRange = qLeaderboardSheet.getRange(2, 1, lastRow - 1, lastColumn);
   var leaderboardData = leaderboardRange.getValues();

   var backgroundColors = [];
   var fontWeights = [];

   var pastelColors = ["#d9ead3", "#c9daf8", "#fff2cc", "#fce5cd", "#f4cccc", "#d9d2e9"];
   var lastCircuit = "";
   var colorIndex = -1;

   for (var r = 0; r < leaderboardData.length; r++) {
     var rowData = leaderboardData[r];
     var circuitName = rowData[0]; // Column A: Circuit

     // Determine the color for the circuit
     if (circuitName !== lastCircuit) {
       colorIndex = (colorIndex + 1) % pastelColors.length;
       lastCircuit = circuitName;
     }

     // Assign background color based on the circuit
     var backgroundColor = pastelColors[colorIndex];
     backgroundColors.push(new Array(lastColumn).fill(backgroundColor));

     // Set font weights: Bold for Place and Climber columns
     var rowFontWeights = new Array(lastColumn).fill("normal");
     rowFontWeights[1] = "bold"; // Column B: Place
     rowFontWeights[2] = "bold"; // Column C: Climber
     fontWeights.push(rowFontWeights);
   }

   // Apply formatting in batch operations for efficiency
   leaderboardRange.setBackgrounds(backgroundColors);
   leaderboardRange.setFontWeights(fontWeights);
}
