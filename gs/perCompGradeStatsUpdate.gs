/**
 * Generates climber statistics per competition and per boulder grade.
 * It calculates the percentage of tops, zones, and flashes a climber achieves
 * on boulders of a specific grade within each competition's qualification rounds.
 *
 * Data is sourced from the QBoulders and QResults sheets.
 * The final analysis is written to the perCompGradeStats sheet.
 */
function perCompGradeStatsUpdate() {
  var sheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Google Sheet ID if it's different
  var ss = SpreadsheetApp.openById(sheetId);

  // Source sheets
  var qBouldersSheet = ss.getSheetByName("QBoulders");
  var qResultsSheet = ss.getSheetByName("QResults");

  // Destination sheet
  var statsSheet = ss.getSheetByName("perCompGradeStats");

  // --- 1) Clear existing stats data (but keep header) ---
  if (statsSheet.getLastRow() > 1) {
    statsSheet
      .getRange(2, 1, statsSheet.getLastRow() - 1, statsSheet.getLastColumn())
      .clearContent()
      .clearFormat();
  }

  // --- 2) Build a Boulder-to-Grade Map from QBoulders ---
  // The map key will be 'QualiName_BoulderName', e.g., 'M01Q1_A'
  var boulderGradeMap = {};
  var qBouldersData = qBouldersSheet.getDataRange().getValues();
  // Expected columns: [Quali, Name, Grade, ...]
  for (var i = 1; i < qBouldersData.length; i++) {
    var row = qBouldersData[i];
    var qualiName = row[0];
    var boulderName = row[1];
    var grade = row[2];
    if (qualiName && boulderName) {
      var key = qualiName + "_" + boulderName;
      boulderGradeMap[key] = grade;
    }
  }

  // --- 3) Process QResults to Tally Attempts and Successes ---
  // The master stats object will be structured as: { Comp: { Climber: { Grade: { stats } } } }
  var climberStats = {};
  var qResultsData = qResultsSheet.getDataRange().getValues();
  var qResultsHeader = qResultsData[0]; // This is the row with boulder names (A, B, C...)

  // Start from the first data row
  for (var j = 1; j < qResultsData.length; j++) {
    var climberRow = qResultsData[j];
    var qualiName = climberRow[1]; // Column B is 'Quali'
    var climberName = climberRow[2]; // Column C is 'Climber'
    
    if (!qualiName || !climberName) continue;
    
    // Derive Comp name by splitting the Quali name at 'Q'. Handles all formats.
    var compName = qualiName.split('Q')[0]; 

    // Iterate horizontally across the climber's results for each boulder
    // Start from Column D (index 3), where boulder results begin
    for (var k = 3; k < climberRow.length; k++) {
      var result = climberRow[k];
      
      // An empty cell means the boulder was not in this quali set; skip it.
      if (result === "") continue;
      
      var boulderName = qResultsHeader[k];
      var mapKey = qualiName + "_" + boulderName;
      var grade = boulderGradeMap[mapKey];
      
      // If we can't find the boulder in our map, we can't process it.
      if (grade === undefined) continue;

      // Initialize data structure if it's the first time seeing this combination
      if (!climberStats[compName]) climberStats[compName] = {};
      if (!climberStats[compName][climberName]) climberStats[compName][climberName] = {};
      if (!climberStats[compName][climberName][grade]) {
        climberStats[compName][climberName][grade] = {
          attempts: 0,
          tops: 0,
          zones: 0,
          flashes: 0
        };
      }

      // Tally attempts and successes
      var stats = climberStats[compName][climberName][grade];
      stats.attempts++;

      if (result === "Flash") {
        stats.flashes++;
        stats.tops++;
        stats.zones++;
      } else if (result === "Top") {
        stats.tops++;
        stats.zones++;
      } else if (result === "Zone") {
        stats.zones++;
      }
    }
  }

  // --- 4) Calculate Percentages and Prepare Output ---
  var outputRows = [];
  for (var comp in climberStats) {
    for (var climber in climberStats[comp]) {
      for (var grade in climberStats[comp][climber]) {
        var s = climberStats[comp][climber][grade];
        if (s.attempts > 0) {
          var topPercent = s.tops / s.attempts;
          var zonePercent = s.zones / s.attempts;
          var flashPercent = s.flashes / s.attempts;
          
          outputRows.push([
            comp,
            climber,
            parseInt(grade), // Ensure grade is treated as a number
            topPercent,
            zonePercent,
            flashPercent
          ]);
        }
      }
    }
  }

  // --- 5) Sort and Write Data to the Sheet ---
  // Sort by Comp, then Climber, then Grade for consistent ordering
  outputRows.sort(function(a, b) {
    if (a[0] !== b[0]) return a[0].localeCompare(b[0]); // Comp
    if (a[1] !== b[1]) return a[1].localeCompare(b[1]); // Climber
    return a[2] - b[2]; // Grade
  });
  
  if (outputRows.length > 0) {
    // Write all the data first
    statsSheet
      .getRange(2, 1, outputRows.length, outputRows[0].length)
      .setValues(outputRows);
      
    // --- CORRECTED FORMATTING ---
    // Apply percentage format ONLY to the percentage columns (D, E, F)
    statsSheet
      .getRange(2, 4, outputRows.length, 3) // Starting from column D, for 3 columns
      .setNumberFormat("0.0%");
      
    // Ensure the Grade column (C) is formatted as a plain number
    statsSheet
      .getRange(2, 3, outputRows.length, 1) // Column C
      .setNumberFormat("0");
  }
}
