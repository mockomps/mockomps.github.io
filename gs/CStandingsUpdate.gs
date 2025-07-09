// Example Google Apps Script for building circuit standings (CStandings) with color-coded rows
// just like in FRankings, but using the season logic, with Place in Column B and Climber in Column C.
// (Added comment to ensure content differs in some way)

function CStandingsUpdate() {
  var sheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU";  // Replace with your Google Sheet ID
  var ss = SpreadsheetApp.openById(sheetId);

  // Source sheets
  var fRankingsSheet = ss.getSheetByName("FRankings");
  var fResultsSheet = ss.getSheetByName("FResults");

  // Destination sheet
  var cStandingsSheet = ss.getSheetByName("CStandings");

  // 1) Clear existing CStandings data (but keep header)
  if (cStandingsSheet.getLastRow() > 1) {
    cStandingsSheet
      .getRange(2, 1, cStandingsSheet.getLastRow() - 1, cStandingsSheet.getLastColumn())
      .clearContent();
  }

  // Helper to map a comp number (1–10 vs 11–20) to a season
  function getSeasonFromCompNum(num) {
    if (num >= 1 && num <= 10) {
      return "MC01";
    } else if (num >= 11 && num <= 20) {
      return "MC02";
    }
    return null; // Unknown or out-of-range
  }

  // 2) Count how many climbers participated in each Final
  var fRankingsData = fRankingsSheet.getDataRange().getValues();
  // Expected columns: [Final, Place, Climber, Tops, Top Attempts, Zones, Zone Attempts]
  var finalParticipantsCount = {};
  for (var i = 1; i < fRankingsData.length; i++) {
    var row = fRankingsData[i];
    var finalName = row[0];
    if (!finalName) continue;
    if (!finalParticipantsCount[finalName]) {
      finalParticipantsCount[finalName] = 0;
    }
    finalParticipantsCount[finalName]++;
  }

  // 3) Build a data structure to accumulate each climber’s stats per season
  //    { seasonName: {
  //        climberName: {
  //          circuitPoints, firstPlaces, secondPlaces, thirdPlaces, finalsCount, flashes
  //        }
  //      }
  //    }
  var seasonData = {};

  function initClimber(season, climber) {
    if (!seasonData[season]) {
      seasonData[season] = {};
    }
    if (!seasonData[season][climber]) {
      seasonData[season][climber] = {
        circuitPoints: 0,
        firstPlaces: 0,
        secondPlaces: 0,
        thirdPlaces: 0,
        finalsCount: 0,
        flashes: 0
      };
    }
  }

  // 4) Parse FRankings to calculate circuit points and place counts
  for (var j = 1; j < fRankingsData.length; j++) {
    var row = fRankingsData[j];
    var finalName = row[0];   // e.g. "M07F"
    var place = row[1];       // 1, 2, 3, ...
    var climber = row[2];
    if (!finalName || !climber) continue;

    // Extract comp number from final name, e.g. "M07F" → 7
    var compNum = parseInt(finalName.substring(1, 3), 10);
    var season = getSeasonFromCompNum(compNum);
    if (!season) continue;

    initClimber(season, climber);

    // Points: if final has N participants, 1st gets N pts, 2nd gets N-1, etc.
    var n = finalParticipantsCount[finalName] || 0;
    var circuitPoints = n - (place - 1);
    seasonData[season][climber].circuitPoints += circuitPoints;

    // Count 1st/2nd/3rd finishes
    if (place == 1) seasonData[season][climber].firstPlaces++;
    if (place == 2) seasonData[season][climber].secondPlaces++;
    if (place == 3) seasonData[season][climber].thirdPlaces++;

    // Count Finals entered
    seasonData[season][climber].finalsCount++;
  }

  // 5) Parse FResults to count Flashes (Send === 'Top' && Top Attempts === 1)
  var fResultsData = fResultsSheet.getDataRange().getValues();
  // Expected columns: [Timestamp, Final, Climber, Boulder, Send, Top Attempts, Zone Attempts]
  for (var k = 1; k < fResultsData.length; k++) {
    var row = fResultsData[k];
    var finalName = row[1];
    var climber = row[2];
    var sendResult = row[4];
    var topAttempts = parseInt(row[5], 10) || 0;
    if (!finalName || !climber) continue;

    var compNum = parseInt(finalName.substring(1, 3), 10);
    var season = getSeasonFromCompNum(compNum);
    if (!season) continue;

    initClimber(season, climber);

    if (sendResult === "Top" && topAttempts === 1) {
      seasonData[season][climber].flashes++;
    }
  }

  // 6) Convert seasonData to a sorted array and write out to the CStandings sheet
  var outputRows = [];
  var allSeasons = Object.keys(seasonData).sort(); // e.g. ["MCHAMP1", "MCHAMP2"]

  allSeasons.forEach(function (season) {
    var climbersMap = seasonData[season];
    var climbersArray = Object.keys(climbersMap).map(function (name) {
      return {
        season: season,
        climber: name,
        circuitPoints: climbersMap[name].circuitPoints,
        firstPlaces: climbersMap[name].firstPlaces,
        secondPlaces: climbersMap[name].secondPlaces,
        thirdPlaces: climbersMap[name].thirdPlaces,
        finalsCount: climbersMap[name].finalsCount,
        flashes: climbersMap[name].flashes
      };
    });

    // Sort by circuitPoints descending
    climbersArray.sort(function (a, b) {
      return b.circuitPoints - a.circuitPoints;
    });

    // Assign place (tie if same circuitPoints)
    for (var i = 0; i < climbersArray.length; i++) {
      if (i === 0) {
        climbersArray[i].place = 1;
      } else {
        if (climbersArray[i].circuitPoints === climbersArray[i - 1].circuitPoints) {
          climbersArray[i].place = climbersArray[i - 1].place;
        } else {
          climbersArray[i].place = i + 1;
        }
      }
    }

    // Push each row for the season
    // Now we want the order: Season (A), Place (B), Climber (C), CircuitPoints (D), etc.

    climbersArray.forEach(function (item) {
      outputRows.push([
        item.season,          // Column A (Season)
        item.place,           // Column B (Place)
        item.climber,         // Column C (Climber)
        item.circuitPoints,   // Column D
        item.firstPlaces,     // Column E
        item.secondPlaces,    // Column F
        item.thirdPlaces,     // Column G
        item.finalsCount,     // Column H
        item.flashes          // Column I
      ]);
    });
  });

  if (outputRows.length > 0) {
    cStandingsSheet
      .getRange(2, 1, outputRows.length, outputRows[0].length)
      .setValues(outputRows);
  }

  // 7) Color rows by season, with top8 having a darker shade.

  var lastRow = cStandingsSheet.getLastRow();
  if (lastRow <= 1) {
    // nothing to color
    return;
  }

  var lastColumn = cStandingsSheet.getLastColumn();
  var standingsDataRange = cStandingsSheet.getRange(2, 1, lastRow - 1, lastColumn);
  var standingsData = standingsDataRange.getValues();

  var lastSeason = "";
  var colorIndex = 0;
  var pastelColors = ["#d9ead3", "#c9daf8", "#fff2cc", "#fce5cd", "#f4cccc", "#d9d2e9"];
  // var darkerPastelColors = ["#b6d7a8", "#a4c2f4", "#ffe599", "#f9cb9c", "#ea9999", "#b4a7d6"];
  var darkerPastelColors = ["#d9ead3", "#c9daf8", "#fff2cc", "#fce5cd", "#f4cccc", "#d9d2e9"];
  var colorData = [];

  // Now that Place is in Column B, i.e. index 1
  // Season is Column A, i.e. index 0

  for (var r = 0; r < standingsData.length; r++) {
    var seasonName = standingsData[r][0];  // Column A
    var place = standingsData[r][1];       // Column B

    if (seasonName !== lastSeason) {
      colorIndex = (colorIndex + 1) % pastelColors.length;
      lastSeason = seasonName;
    }

    var backgroundColor = (place <= 8)
      ? darkerPastelColors[colorIndex]
      : pastelColors[colorIndex];

    colorData.push(new Array(lastColumn).fill(backgroundColor));
  }

  standingsDataRange.setBackgrounds(colorData);
}
