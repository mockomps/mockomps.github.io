function ClimberStatsUpdate() {
  var sheetId = "1qx-Fots7e-50dDnsKbMDjv-a4bS62D-sqawVLDhZUfU"; // Replace with your Sheet ID
  
  // Open Google Sheet
  var sheet = SpreadsheetApp.openById(sheetId);

  // Get the relevant sheets
  var climbersSheet = sheet.getSheetByName("Climbers");
  var bouldersSheet = sheet.getSheetByName("QBoulders");
  var resultsSheet = sheet.getSheetByName("QResults");
  var climberStatsSheet = sheet.getSheetByName("ClimberStats");

  // Clear ClimberStats Sheet data but keep the header rows (start clearing from row 3)
  if (climberStatsSheet.getLastRow() > 2) {
    climberStatsSheet.getRange(3, 1, climberStatsSheet.getLastRow() - 2, climberStatsSheet.getLastColumn()).clearContent();
  }

  // Get Climbers Data from column B (starting from row 2)
  var climbersData = climbersSheet.getRange(2, 2, climbersSheet.getLastRow() - 1, 1).getValues();
  var climbers = climbersData.flat();

  // Get Boulder Data and create a map of boulder grades by Quali and Boulder name
  var bouldersData = bouldersSheet.getDataRange().getValues();
  var boulderGrades = {};
  bouldersData.forEach(function(row) {
    var quali = row[0];
    var boulder = row[1];
    var grade = row[2];
    if (quali && boulder && grade) {
      boulderGrades[quali + "_" + boulder] = grade;
    }
  });

  // Get Results Data from QResults sheet
  var resultsData = resultsSheet.getDataRange().getValues();
  var headerRow = resultsData[0];

  // Create a map to store stats for each climber
  var climberStats = {};
  climbers.forEach(function(climber) {
    climberStats[climber] = {
      participations: 0,
      totalBoulders: 0,
      flashes: 0,
      tops: 0,
      zones: 0,
      grade3Boulders: 0,
      grade3Flashes: 0,
      grade3Tops: 0,
      grade3Zones: 0,
      grade4Boulders: 0,
      grade4Flashes: 0,
      grade4Tops: 0,
      grade4Zones: 0,
      grade5Boulders: 0,
      grade5Flashes: 0,
      grade5Tops: 0,
      grade5Zones: 0,
      grade6Boulders: 0,
      grade6Flashes: 0,
      grade6Tops: 0,
      grade6Zones: 0
    };
  });

  // Calculate Stats for Each Climber based on results
  for (var i = 1; i < resultsData.length; i++) {
    var row = resultsData[i];
    var quali = row[1];
    var climber = row[2];

    // Skip if climber is not found in the climbers list
    if (!climber || !climberStats[climber]) {
      continue;
    }

    // Update participation count for the climber
    climberStats[climber].participations++;

    // Count the number of boulders attempted in this quali
    var bouldersAttempted = 0;

    // Iterate over boulder results (starting from column C onwards)
    for (var j = 3; j < row.length; j++) {
      var boulder = headerRow[j];
      var result = row[j];
      var grade = boulderGrades[quali + "_" + boulder];

      if (result) {
        bouldersAttempted++;
      }

      // Update grade-specific boulder attempts
      if (grade == 3) climberStats[climber].grade3Boulders++;
      if (grade == 4) climberStats[climber].grade4Boulders++;
      if (grade == 5) climberStats[climber].grade5Boulders++;
      if (grade == 6) climberStats[climber].grade6Boulders++;

      // Update stats based on result type (Flash, Top, Zone)
      if (result === "Flash") {
        climberStats[climber].flashes++;
        climberStats[climber].tops++;
        climberStats[climber].zones++;
        if (grade == 3) { climberStats[climber].grade3Flashes++; climberStats[climber].grade3Tops++; climberStats[climber].grade3Zones++; }
        if (grade == 4) { climberStats[climber].grade4Flashes++; climberStats[climber].grade4Tops++; climberStats[climber].grade4Zones++; }
        if (grade == 5) { climberStats[climber].grade5Flashes++; climberStats[climber].grade5Tops++; climberStats[climber].grade5Zones++; }
        if (grade == 6) { climberStats[climber].grade6Flashes++; climberStats[climber].grade6Tops++; climberStats[climber].grade6Zones++; }
      } else if (result === "Top") {
        climberStats[climber].tops++;
        climberStats[climber].zones++;
        if (grade == 3) { climberStats[climber].grade3Tops++; climberStats[climber].grade3Zones++; }
        if (grade == 4) { climberStats[climber].grade4Tops++; climberStats[climber].grade4Zones++; }
        if (grade == 5) { climberStats[climber].grade5Tops++; climberStats[climber].grade5Zones++; }
        if (grade == 6) { climberStats[climber].grade6Tops++; climberStats[climber].grade6Zones++; }
      } else if (result === "Zone") {
        climberStats[climber].zones++;
        if (grade == 3) climberStats[climber].grade3Zones++;
        if (grade == 4) climberStats[climber].grade4Zones++;
        if (grade == 5) climberStats[climber].grade5Zones++;
        if (grade == 6) climberStats[climber].grade6Zones++;
      }
    }

    // Update total boulders attempted for the climber
    climberStats[climber].totalBoulders += bouldersAttempted;
  }

  // Prepare data to write to the ClimberStats Sheet (starting from row 3)
  var statsData = [];
  Object.keys(climberStats).forEach(function(climber) {
    var stats = climberStats[climber];

    // Calculate percentages for flashes, tops, and zones for each grade, rounded and formatted as a percentage
    var grade3FlashPercentage = stats.grade3Boulders > 0 ? Math.round((stats.grade3Flashes / stats.grade3Boulders) * 100) + "%" : "0%";
    var grade3TopPercentage = stats.grade3Boulders > 0 ? Math.round((stats.grade3Tops / stats.grade3Boulders) * 100) + "%" : "0%";
    var grade3ZonePercentage = stats.grade3Boulders > 0 ? Math.round((stats.grade3Zones / stats.grade3Boulders) * 100) + "%" : "0%";
    
    var grade4FlashPercentage = stats.grade4Boulders > 0 ? Math.round((stats.grade4Flashes / stats.grade4Boulders) * 100) + "%" : "0%";
    var grade4TopPercentage = stats.grade4Boulders > 0 ? Math.round((stats.grade4Tops / stats.grade4Boulders) * 100) + "%" : "0%";
    var grade4ZonePercentage = stats.grade4Boulders > 0 ? Math.round((stats.grade4Zones / stats.grade4Boulders) * 100) + "%" : "0%";

    var grade5FlashPercentage = stats.grade5Boulders > 0 ? Math.round((stats.grade5Flashes / stats.grade5Boulders) * 100) + "%" : "0%";
    var grade5TopPercentage = stats.grade5Boulders > 0 ? Math.round((stats.grade5Tops / stats.grade5Boulders) * 100) + "%" : "0%";
    var grade5ZonePercentage = stats.grade5Boulders > 0 ? Math.round((stats.grade5Zones / stats.grade5Boulders) * 100) + "%" : "0%";

    var grade6FlashPercentage = stats.grade6Boulders > 0 ? Math.round((stats.grade6Flashes / stats.grade6Boulders) * 100) + "%" : "0%";
    var grade6TopPercentage = stats.grade6Boulders > 0 ? Math.round((stats.grade6Tops / stats.grade6Boulders) * 100) + "%" : "0%";
    var grade6ZonePercentage = stats.grade6Boulders > 0 ? Math.round((stats.grade6Zones / stats.grade6Boulders) * 100) + "%" : "0%";

    statsData.push([
      climber,
      stats.participations,
      stats.totalBoulders,
      stats.flashes,
      stats.tops,
      stats.zones,
      stats.grade3Boulders,
      stats.grade3Flashes,
      grade3FlashPercentage,
      stats.grade3Tops,
      grade3TopPercentage,
      stats.grade3Zones,
      grade3ZonePercentage,
      stats.grade4Boulders,
      stats.grade4Flashes,
      grade4FlashPercentage,
      stats.grade4Tops,
      grade4TopPercentage,
      stats.grade4Zones,
      grade4ZonePercentage,
      stats.grade5Boulders,
      stats.grade5Flashes,
      grade5FlashPercentage,
      stats.grade5Tops,
      grade5TopPercentage,
      stats.grade5Zones,
      grade5ZonePercentage,
      stats.grade6Boulders,
      stats.grade6Flashes,
      grade6FlashPercentage,
      stats.grade6Tops,
      grade6TopPercentage,
      stats.grade6Zones,
      grade6ZonePercentage
    ]);
  });

  // Write stats data to the ClimberStats Sheet (starting from row 3)
  if (statsData.length > 0) {
    climberStatsSheet.getRange(3, 1, statsData.length, statsData[0].length).setValues(statsData);
  }
}
