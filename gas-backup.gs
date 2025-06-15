/**
 * Main entry point for all POST requests from the web app. Routes to the correct handler.
 */
function doPost(e) {
  let response;
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.formType) {
      case 'climberRegistration':
        response = handleClimberRegistration(data);
        break;
      
      case 'addBoulders':
        response = handleAddBoulders(data);
        break;

      case 'submitQualiResults':
        response = handleSubmitQualiResults(data);
        break;

      case 'manageFinalists':
        response = handleManageFinalists(data);
        break;

      case 'submitFinalsResult': // New case for judging
        response = handleSubmitFinalsResult(data);
        break;

      default:
        response = { result: 'error', message: 'Unknown form type specified.' };
        break;
    }
  } catch (error) {
    response = {
      result: 'error',
      message: 'Script error: ' + error.message,
      stack: error.stack
    };
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Handler Functions ---

/**
 * Handles climber registration submissions.
 */
function handleClimberRegistration(data) {
  try {
    const sheetName = 'Climbers';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);

    sheet.appendRow([
      new Date(), data.Name, data['Date of Birth'], data.Country, data.Instagram
    ]);

    return { result: 'success', message: `Climber "${data.Name}" registered successfully.` };
  } catch (error) {
    return { result: 'error', message: 'Failed to register climber: ' + error.message };
  }
}

/**
 * Handles adding/updating boulders for a quali round.
 */
function handleAddBoulders(data) {
  try {
    const sheetName = 'qBoulders';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);
    
    const qualiName = data.quali;
    if (!qualiName) throw new Error('Quali name is missing from the submission data.');

    const values = sheet.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][0] === qualiName) {
        sheet.deleteRow(i + 1);
      }
    }

    if (data.boulders && data.boulders.length > 0) {
      const rowsToAdd = data.boulders.map(boulder => [
        qualiName, boulder.Name, boulder.Grade, boulder.Color, '', boulder.A
      ]);
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    return { result: 'success', message: `Boulders for ${qualiName} have been successfully updated.` };
  } catch (error) {
    return { result: 'error', message: 'Failed to add boulders: ' + error.message };
  }
}

/**
 * Handles quali results submission. Saves the data quickly and then
 * creates a trigger to run the quali-specific update functions.
 */
function handleSubmitQualiResults(data) {
  try {
    const sheetName = 'qResults';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);

    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const qualiColIndex = headers.indexOf('Quali');
    const climberColIndex = headers.indexOf('Climber');

    let existingRowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][qualiColIndex] === data.quali && allData[i][climberColIndex] === data.climber) {
        existingRowIndex = i;
        break;
      }
    }

    const newRow = headers.map(header => {
      const h = header.toLowerCase();
      if (h === 'timestamp') return new Date();
      if (h === 'quali') return data.quali;
      if (h === 'climber') return data.climber;
      return data.results[h] || '';
    });

    let successMessage;
    if (existingRowIndex !== -1) {
      sheet.getRange(existingRowIndex + 1, 1, 1, newRow.length).setValues([newRow]);
      successMessage = 'Results updated successfully. Leaderboards will update shortly.';
    } else {
      sheet.appendRow(newRow);
      successMessage = 'Results submitted successfully. Leaderboards will update shortly.';
    }

    // Schedule the quali update functions to run in the background.
    createOneTimeTrigger('runQualiUpdates');

    return { result: 'success', message: successMessage };

  } catch (error) {
    return {
      result: 'error',
      message: 'Failed to submit results: ' + error.message,
      stack: error.stack
    };
  }
}

/**
 * Handles managing the list of finalists for a given final.
 */
function handleManageFinalists(data) {
  try {
    const sheetName = 'FClimbers';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);
    
    const finalName = data.final;
    if (!finalName) throw new Error('Final name is missing from the submission data.');

    const values = sheet.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][0] === finalName) {
        sheet.deleteRow(i + 1);
      }
    }
    
    if (data.climbers && data.climbers.length > 0) {
      const rowsToAdd = data.climbers.map(climber => [finalName, climber]);
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    return { result: 'success', message: `Finalist roster for ${finalName} has been updated.` };
  } catch (error) {
    return { 
      result: 'error', 
      message: 'Failed to manage finalists: ' + error.message,
      stack: error.stack
    };
  }
}

/**
 * Handles submission of a single final boulder result from the Judges App.
 * This version is more robust and builds the row based on sheet headers.
 */
function handleSubmitFinalsResult(data) {
  try {
    const sheetName = 'fResults'; 
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found. Please create it.`);

    const allData = sheet.getDataRange().getValues();
    const headers = allData[0].map(h => h.trim()); // Trim headers to be safe
    
    // Define the mapping from the data object keys to the expected header names
    const dataMap = {
        'Final': data.final,
        'Climber': data.climber,
        'Boulder': data.boulder,
        'Send': data.send,
        'Top Attempts': data.topAttempts,
        'Zone Attempts': data.zoneAttempts
    };

    // Build the row dynamically based on the header order
    const newRow = headers.map(header => {
        return dataMap[header] !== undefined ? dataMap[header] : ''; // Use the mapped value or an empty string
    });
    
    const finalColIndex = headers.indexOf('Final');
    const climberColIndex = headers.indexOf('Climber');
    const boulderColIndex = headers.indexOf('Boulder');

    if (finalColIndex === -1 || climberColIndex === -1 || boulderColIndex === -1) {
        throw new Error('One or more required columns (Final, Climber, Boulder) are missing from the fResults sheet.');
    }

    let existingRowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][finalColIndex] === data.final && allData[i][climberColIndex] === data.climber && allData[i][boulderColIndex] === data.boulder) {
        existingRowIndex = i;
        break;
      }
    }

    if (existingRowIndex !== -1) {
      sheet.getRange(existingRowIndex + 1, 1, 1, newRow.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
    }
    
    // Schedule the finals update functions to run in the background.
    createOneTimeTrigger('runFinalsUpdates');

    return { result: 'success', message: `Result for ${data.climber} on Boulder ${data.boulder} saved.` };

  } catch (error) {
    return { 
      result: 'error', 
      message: 'Failed to submit final result: ' + error.message,
      stack: error.stack
    };
  }
}


// --- Trigger and Background Functions ---

/**
 * Creates a one-time trigger to run a specified function after a short delay.
 * @param {string} functionName The name of the function to trigger.
 */
function createOneTimeTrigger(functionName) {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of allTriggers) {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .after(30 * 1000) 
    .create();
}

/**
 * Contains all the long-running QUALI update processes.
 */
function runQualiUpdates() {
  try {
    QRankStandUpdate();
    ClimberStatsUpdate();
    QLeaderboardUpdate();
    perCompGradeStatsUpdate();
  } catch (e) {
    console.error("Error during triggered quali update: " + e.toString());
  }
}

/**
 * Contains all the long-running FINALS update processes.
 */
function runFinalsUpdates() {
    try {
        FRankUpdate();
        CStandingsUpdate();
    } catch(e) {
        console.error("Error during triggered finals update: " + e.toString());
    }
}
