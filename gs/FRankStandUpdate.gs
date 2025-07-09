// This script processes the 'FResults' sheet and populates the 'FRankings' sheet
// with rankings based on the number of tops, zones, and their respective attempts.
function FRankUpdate() {
  var sheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Sheet ID

  // Open Google Sheets
  var sheet = SpreadsheetApp.openById(sheetId);
  var finalResultsSheet = sheet.getSheetByName("FResults");
  var rankingsSheet = sheet.getSheetByName("FRankings");

  // Clear Rankings Sheet data without affecting formatting, keep the header row
  if (rankingsSheet.getLastRow() > 1) {
    rankingsSheet.getRange(2, 1, rankingsSheet.getLastRow() - 1, rankingsSheet.getLastColumn()).clearContent();
  }

  // Get Final Results Data
  var resultsData = finalResultsSheet.getDataRange().getValues();
  var headerRow = resultsData[0]; // Assumes first row is header

  // Create a map to store climber stats by final
  var climberStats = {};

  for (var i = 1; i < resultsData.length; i++) {
    var row = resultsData[i];
    if (row.every(cell => cell === "")) continue; // Skip empty rows

    var finalName = row[1]; // Assuming final identifier is in column B
    var climberName = row[2]; // Climber name in column C
    var boulderName = row[3]; // Boulder name in column D
    var sendResult = row[4]; // Send result in column E
    var topAttempts = parseInt(row[5]) || 0; // Top attempts in column F
    var zoneAttempts = parseInt(row[6]) || 0; // Zone attempts in column G

    if (!finalName || !climberName || !boulderName) continue;

    // Initialize climberStats entry for a specific final if it doesn't exist
    if (!climberStats[finalName]) {
      climberStats[finalName] = {};
    }

    if (!climberStats[finalName][climberName]) {
      climberStats[finalName][climberName] = {
        final: finalName,
        climber: climberName,
        tops: 0,
        topAttempts: 0,
        zones: 0,
        zoneAttempts: 0
      };
    }

    // Update the climber stats based on the send result
    if (sendResult === "Top") {
      climberStats[finalName][climberName].tops++;
      climberStats[finalName][climberName].topAttempts += topAttempts;
      climberStats[finalName][climberName].zones++; // Zone is always achieved if Top is achieved
      climberStats[finalName][climberName].zoneAttempts += zoneAttempts; // Use the actual recorded zone attempts
    } else if (sendResult === "Zone") {
      climberStats[finalName][climberName].zones++;
      climberStats[finalName][climberName].zoneAttempts += zoneAttempts;
    }
  }

  // Convert climberStats to an array for easier sorting and processing per final
  var statsArray = [];
  for (var final in climberStats) {
    var climbersArray = Object.values(climberStats[final]);
    // Sort climbers within each final by number of tops, then by number of zones, then by attempts (ascending)
    climbersArray.sort(function (a, b) {
      if (b.tops !== a.tops) {
        return b.tops - a.tops;
      } else if (b.zones !== a.zones) {
        return b.zones - a.zones;
      } else if (a.topAttempts !== b.topAttempts) {
        return a.topAttempts - b.topAttempts;
      } else {
        return a.zoneAttempts - b.zoneAttempts;
      }
    });
    // Assign places after sorting, considering ties
    for (var i = 0; i < climbersArray.length; i++) {
      if (i > 0 && climbersArray[i].tops === climbersArray[i - 1].tops && 
          climbersArray[i].zones === climbersArray[i - 1].zones &&
          climbersArray[i].topAttempts === climbersArray[i - 1].topAttempts &&
          climbersArray[i].zoneAttempts === climbersArray[i - 1].zoneAttempts) {
        climbersArray[i].place = climbersArray[i - 1].place; // Tie with previous climber
      } else {
        climbersArray[i].place = i + 1;
      }
    }
    statsArray = statsArray.concat(climbersArray);
  }

  // Write sorted data back to the Rankings sheet
  var sortedData = statsArray.map(function (climber) {
    return [
      climber.final,
      climber.place, // Place
      climber.climber,
      climber.tops,
      climber.topAttempts,
      climber.zones,
      climber.zoneAttempts
    ];
  });

  // Write data to the sheet in one go
  if (sortedData.length > 0) {
    rankingsSheet.getRange(2, 1, sortedData.length, sortedData[0].length).setValues(sortedData);
  }

  // Apply Colors to Rows Based on Final in One Batch
  var rankingsData = rankingsSheet.getRange(2, 1, rankingsSheet.getLastRow() - 1, rankingsSheet.getLastColumn()).getValues();
  var lastFinal = "";
  var colorIndex = 0;
  var pastelColors = ["#d9ead3", "#c9daf8", "#fff2cc", "#fce5cd", "#f4cccc", "#d9d2e9"];
  var darkerPastelColors = ["#b6d7a8", "#a4c2f4", "#ffe599", "#f9cb9c", "#ea9999", "#b4a7d6"]; // Darker pastel colors for top 3
  var colorData = [];

  for (var i = 0; i < rankingsData.length; i++) {
    var finalName = rankingsData[i][0];
    var place = rankingsData[i][1];

    if (finalName !== lastFinal) {
      colorIndex = (colorIndex + 1) % pastelColors.length;
      lastFinal = finalName;
    }

    var backgroundColor = place <= 3 ? darkerPastelColors[colorIndex] : pastelColors[colorIndex];
    colorData.push(new Array(rankingsSheet.getLastColumn()).fill(backgroundColor));
  }

  // Apply Colors in One Batch without changing other formatting
  if (colorData.length > 0) {
    rankingsSheet.getRange(2, 1, colorData.length, rankingsSheet.getLastColumn()).setBackgrounds(colorData);
  }
}
