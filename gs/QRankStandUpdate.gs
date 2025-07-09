function QRankStandUpdate() {
  QRankUpdate();
  QStandUpdate();
}

function QRankUpdate() {
  var formSheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Form Submissions Sheet ID
  var boulderSheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Boulder Grades Sheet ID

  // Open Google Sheets
  var formSheet = SpreadsheetApp.openById(formSheetId);
  var mockompsSheet = SpreadsheetApp.openById(boulderSheetId);

  // Sheets for Form Submissions, Boulder Grades, and Rankings
  var formSubmissionsSheet = formSheet.getSheetByName("QResults");
  var bouldersSheet = mockompsSheet.getSheetByName("QBoulders");
  var leaderboardSheet = mockompsSheet.getSheetByName("QRankings");
  var qualiSheet = mockompsSheet.getSheetByName("Qualis"); // Reference to Qualis sheet for date lookup

  // Clear Leaderboard Sheet data without affecting formatting
  if (leaderboardSheet.getLastRow() > 1) {
    leaderboardSheet.getRange(2, 1, leaderboardSheet.getLastRow() - 1, leaderboardSheet.getLastColumn()).clearContent();
  }

  // Get Form Submissions Data
  var formSubmissionsData = formSubmissionsSheet.getDataRange().getValues();
  var headerRow = formSubmissionsData[0]; // Assumes first row is header
  
  // Get Boulder Grades Data
  var bouldersData = bouldersSheet.getDataRange().getValues();

  // Create a map of Boulder Grades by Quali and Boulder name
  var boulderGrades = {};
  bouldersData.forEach(function (row) {
    var quali = row[0];
    var boulder = row[1];
    var grade = parseInt(row[2]); // Assuming grade is in column C
    if (quali && boulder && grade) {
      boulderGrades[quali + "_" + boulder] = grade;
    }
  });

  // Calculate Points for Each Climber
  var climberScores = {};
  for (var i = 1; i < formSubmissionsData.length; i++) {
    var row = formSubmissionsData[i];
    if (row.every(cell => cell === "")) continue; // Skip empty rows

    var quali = row[1];
    var climber = row[2];

    if (!quali || !climber) continue;

    var totalPoints = 0;
    var flashes = 0;
    var tops = 0;
    var zones = 0;

    // Iterate over boulder results (columns C to whatever)
    for (var j = 3; j < row.length; j++) {
      var boulder = headerRow[j]; // Boulder name from the header row
      var result = row[j];
      var grade = boulderGrades[quali + "_" + boulder] || 0;

      if (result === "Flash") {
        totalPoints += grade + 1;
        flashes++;
        tops++;
        zones++;
      } else if (result === "Top") {
        totalPoints += grade;
        tops++;
        zones++;
      } else if (result === "Zone") {
        totalPoints += grade / 2;
        zones++;
      }
    }

    // Accumulate scores for each climber
    var climberKey = quali + "_" + climber;
    if (!climberScores[climberKey]) {
      climberScores[climberKey] = {
        quali: quali,
        climber: climber,
        totalPoints: 0,
        flashes: 0,
        tops: 0,
        zones: 0
      };
    }
    climberScores[climberKey].totalPoints += totalPoints;
    climberScores[climberKey].flashes += flashes;
    climberScores[climberKey].tops += tops;
    climberScores[climberKey].zones += zones;
  }

  // Convert climberScores to an array for easier sorting
  var scoresArray = Object.values(climberScores);

  // Get Quali Date Data from "Qualis" Sheet
  var qualiDateData = qualiSheet.getRange(2, 1, qualiSheet.getLastRow() - 1, 3).getValues(); // Assumes Qualis data starts at row 2
  var qualiDates = {};
  qualiDateData.forEach(function (row) {
    var quali = row[1]; // Column B (index 1) contains the Quali identifier
    var date = new Date(row[2]); // Column C (index 2) contains the date
    if (quali && !isNaN(date)) {
      qualiDates[quali] = date; // Map Quali to its date
    }
  });

  // Add corresponding dates to the leaderboard data for sorting purposes
  var dataWithDates = scoresArray.map(function(row) {
    return [qualiDates[row.quali] || new Date(0), row.quali, row.climber, row.totalPoints, row.flashes, row.tops, row.zones];
  });

  // Sort by date (most recent to least recent) and then by points in descending order
  dataWithDates.sort(function(a, b) {
    return b[0] - a[0] || b[3] - a[3]; // Sort by date (descending), then by totalPoints (descending)
  });

  // Remove date column before writing sorted data back
  var sortedData = dataWithDates.map(function(row) {
    return row.slice(1);
  });

  // Write sorted leaderboard data in one go without changing formatting
  if (sortedData.length > 0) {
    leaderboardSheet.getRange(2, 1, sortedData.length, sortedData[0].length).setValues(sortedData);
  }

  // Apply Colors to Rows Based on Quali in One Batch
  var leaderboardData = leaderboardSheet.getRange(2, 1, leaderboardSheet.getLastRow() - 1, leaderboardSheet.getLastColumn()).getValues();
  var lastQuali = "";
  var colorIndex = 0;
  var pastelColors = ["#d9ead3", "#c9daf8", "#fff2cc", "#fce5cd", "#f4cccc", "#d9d2e9"];
  var colorData = [];

  for (var i = 0; i < leaderboardData.length; i++) {
    var quali = leaderboardData[i][0];
    if (quali !== lastQuali) {
      colorIndex = (colorIndex + 1) % pastelColors.length;
      lastQuali = quali;
    }
    colorData.push(new Array(leaderboardSheet.getLastColumn()).fill(pastelColors[colorIndex]));
  }

  // Apply Colors in One Batch without changing other formatting
  if (colorData.length > 0) {
    leaderboardSheet.getRange(2, 1, colorData.length, leaderboardSheet.getLastColumn()).setBackgrounds(colorData);
  }
}

function QStandUpdate() {
  var sheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Sheet ID

  // Open Google Sheet
  var sheet = SpreadsheetApp.openById(sheetId);

  // Sheets with Single Qualis Leaderboard, Cumulative Leaderboard, and Qualis Information
  var leaderboardSheet = sheet.getSheetByName("QRankings");
  var cumulativeLeaderboardSheet = sheet.getSheetByName("QStandings");
  var qualiSheet = sheet.getSheetByName("Qualis"); // Reference to Qualis sheet for date lookup

  // Clear Cumulative Leaderboard Sheet for fresh data but keep the header row
  if (cumulativeLeaderboardSheet.getLastRow() > 1) {
    cumulativeLeaderboardSheet.getRange(2, 1, cumulativeLeaderboardSheet.getLastRow() - 1, cumulativeLeaderboardSheet.getLastColumn()).clearContent();
  }

  // Get Leaderboard Data
  var leaderboardData = leaderboardSheet.getDataRange().getValues();
  if (leaderboardData.length < 2) {
    return; // Exit if no data is available
  }

  // Get Quali Date Data from "Qualis" Sheet
  var qualiDateData = qualiSheet.getRange(2, 1, qualiSheet.getLastRow() - 1, 3).getValues(); // Assumes Qualis data starts at row 2
  var qualiDates = {};
  qualiDateData.forEach(function (row) {
    var quali = row[1]; // Column B (index 1) contains the Quali identifier
    var date = new Date(row[2]); // Column C (index 2) contains the date
    if (quali && !isNaN(date)) {
      qualiDates[quali] = date; // Map Quali to its date
    }
  });

  // Create a map to store climber points by competition and climber name
  var climberPoints = {};

  for (var i = 1; i < leaderboardData.length; i++) {
    var row = leaderboardData[i];
    var qualiName = row[0]; // Column A: Quali name (e.g., "M06Q1")
    var climberName = row[1]; // Column B: Climber name
    var points = parseFloat(row[2]) || 0; // Column C: Quali Points
    var flashes = parseInt(row[3]) || 0; // Column D: Flashes
    var tops = parseInt(row[4]) || 0; // Column E: Tops
    var zones = parseInt(row[5]) || 0; // Column F: Zones

    // Extract the competition identifier from the quali name (e.g., "M06Q1" -> "M06")
    // var competition = qualiName.substring(0, 3);
    var competition = qualiName.slice(0, -2);

    // Initialize climberPoints entry for competition if it doesn't exist
    if (!climberPoints[competition]) {
      climberPoints[competition] = {};
    }

    // Initialize climber entry for a specific competition if it doesn't exist
    if (!climberPoints[competition][climberName]) {
      climberPoints[competition][climberName] = {
        climber: climberName,
        totalPoints: 0,
        flashes: 0,
        tops: 0,
        zones: 0,
        numOfQualis: 0
      };
    }

    // Accumulate the scores for each climber in the competition
    climberPoints[competition][climberName].totalPoints += points;
    climberPoints[competition][climberName].flashes += flashes;
    climberPoints[competition][climberName].tops += tops;
    climberPoints[competition][climberName].zones += zones;
    climberPoints[competition][climberName].numOfQualis++;
  }

  // Sort Competitions by Date in Descending Order (Most Recent to Least Recent)
  var sortedCompetitions = Object.keys(climberPoints).sort(function (a, b) {
    var dateA = qualiDates[a] || new Date(0); // Use early date if not found
    var dateB = qualiDates[b] || new Date(0);
    return dateB - dateA; // Sort in descending order by date
  });

  // Prepare all rows of cumulative scores
  var cumulativeData = [["Comp", "Place", "Climber", "Quali Points", "Flashes", "Tops", "Zones", "Number of Qualis"]];
  var colorData = []; // Will hold color information for each row to speed up coloring

  // Define color arrays
  var pastelColors = ["#d9ead3", "#c9daf8", "#fff2cc", "#fce5cd", "#f4cccc", "#d9d2e9"];
  var darkerPastelColors = ["#b6d7a8", "#a4c2f4", "#ffe599", "#f9cb9c", "#ea9999", "#b4a7d6"];

  sortedCompetitions.forEach(function (competition) {
    // Sort climbers by total points, then by flashes, tops, and zones in descending order
    var sortedClimbers = Object.values(climberPoints[competition]).sort(function (a, b) {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      } else if (b.flashes !== a.flashes) {
        return b.flashes - a.flashes;
      } else if (b.tops !== a.tops) {
        return b.tops - a.tops;
      } else {
        return b.zones - a.zones;
      }
    });

    var currentStanding = 1;
    sortedClimbers.forEach(function (climber, index) {
      if (index > 0 && sortedClimbers[index - 1].totalPoints !== climber.totalPoints) {
        currentStanding = index + 1;
      }
      cumulativeData.push([
        competition,
        currentStanding,
        climber.climber,
        climber.totalPoints,
        climber.flashes,
        climber.tops,
        climber.zones,
        climber.numOfQualis
      ]);

      // Prepare color data for the row
      var colorIndex = Math.floor(sortedCompetitions.indexOf(competition) % pastelColors.length);
      var backgroundColor = (currentStanding <= 8) ? darkerPastelColors[colorIndex] : pastelColors[colorIndex];
      colorData.push(new Array(8).fill(backgroundColor));
    });
  });

  // Write cumulative scores to the leaderboard in one batch
  if (cumulativeData.length > 1) {
    cumulativeLeaderboardSheet.getRange(1, 1, cumulativeData.length, cumulativeData[0].length).setValues(cumulativeData);
  }

  // Apply Colors to Rows in One Batch
  if (colorData.length > 0) {
    cumulativeLeaderboardSheet.getRange(2, 1, colorData.length, colorData[0].length).setBackgrounds(colorData);
  }
}
