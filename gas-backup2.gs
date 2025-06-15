/**
 * The main entry point for handling all POST requests from the web app.
 * Acts as a router to delegate tasks to specific handler functions based on 'formType'.
 * @param {Object} e The event parameter for a POST request.
 * @returns {ContentService.TextOutput} A JSON object indicating success or failure.
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

      default:
        response = { 
          result: 'error', 
          message: 'Unknown form type specified.' 
        };
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


/**
 * Handles the submission of the climber registration form.
 * @param {Object} data The parsed JSON data from the form.
 * @returns {Object} A success or error object.
 */
function handleClimberRegistration(data) {
  try {
    const sheetName = 'Climbers';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found.`);
    }

    sheet.appendRow([
      new Date(),
      data.Name,
      data['Date of Birth'],
      data.Country,
      data.Instagram
    ]);

    return { 
      result: 'success', 
      message: `Climber "${data.Name}" registered successfully.` 
    };
  } catch (error) {
    return { 
      result: 'error', 
      message: 'Failed to register climber: ' + error.message 
    };
  }
}


/**
 * Handles adding/updating quali boulders for a specific round.
 * @param {Object} data The parsed JSON data from the form.
 * @returns {Object} A success or error object.
 */
function handleAddBoulders(data) {
  try {
    const sheetName = 'qBoulders';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found.`);
    }
    
    const qualiName = data.quali;
    const newBoulders = data.boulders;

    if (!qualiName) {
      throw new Error('Quali name is missing from the submission data.');
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const qualiColumnIndex = 0;

    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][qualiColumnIndex] === qualiName) {
        sheet.deleteRow(i + 1);
      }
    }

    if (newBoulders && newBoulders.length > 0) {
      const rowsToAdd = newBoulders.map(boulder => [
        qualiName,
        boulder.Name,
        boulder.Grade,
        boulder.Color,
        '', // Placeholder for Setter column
        boulder.A
      ]);
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    return { 
      result: 'success', 
      message: `Boulders for ${qualiName} have been successfully updated.` 
    };
  } catch (error) {
    return { 
      result: 'error', 
      message: 'Failed to add boulders: ' + error.message 
    };
  }
}

/**
 * Handles submission of quali results. Performs an "upsert":
 * updates the row if one exists for the climber/quali, otherwise inserts a new row.
 * @param {Object} data The parsed JSON data from the form.
 * @returns {Object} A success or error object.
 */
function handleSubmitQualiResults(data) {
  try {
    const sheetName = 'qResults';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found.`);
    }

    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const qualiColIndex = 1; 
    const climberColIndex = 2;

    let existingRowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][qualiColIndex] === data.quali && allData[i][climberColIndex] === data.climber) {
        existingRowIndex = i;
        break;
      }
    }

    // Build the new row based on headers to ensure correct column order
    const newRow = headers.map(header => {
      const h = header.toLowerCase();
      if (h === 'timestamp') return new Date();
      if (h === 'quali') return data.quali;
      if (h === 'climber') return data.climber;
      // For boulder columns 'a', 'b', etc., get the result from the data object
      return data.results[h] || ''; // Default to empty string if no result for a boulder
    });

    if (existingRowIndex !== -1) {
      // UPDATE: Overwrite the existing row. Row numbers are 1-based.
      const rowToUpdate = existingRowIndex + 1;
      sheet.getRange(rowToUpdate, 1, 1, newRow.length).setValues([newRow]);
      return { result: 'success', message: 'Results updated successfully.' };
    } else {
      // INSERT: Append a new row if no existing entry was found.
      sheet.appendRow(newRow);
      return { result: 'success', message: 'Results submitted successfully.' };
    }
  } catch (error) {
    return {
      result: 'error',
      message: 'Failed to submit results: ' + error.message,
      stack: error.stack
    };
  }
}
