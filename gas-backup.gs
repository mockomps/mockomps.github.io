/**
 * The main entry point for handling all POST requests from the web app.
 * Acts as a router to delegate tasks to specific handler functions based on 'formType'.
 * @param {Object} e The event parameter for a POST request.
 * @returns {ContentService.TextOutput} A JSON object indicating success or failure.
 */
function doPost(e) {
  let response;
  try {
    // Parse the JSON payload from the request
    const data = JSON.parse(e.postData.contents);

    // Use a switch to route to the correct handler based on the formType
    switch (data.formType) {
      case 'climberRegistration':
        response = handleClimberRegistration(data);
        break;
      
      case 'addBoulders':
        response = handleAddBoulders(data);
        break;

      // You can add more cases here for future forms
      // case 'anotherFormType':
      //   response = handleAnotherForm(data);
      //   break;

      default:
        response = { 
          result: 'error', 
          message: 'Unknown form type specified.' 
        };
        break;
    }
  } catch (error) {
    // Catch any errors (e.g., JSON parsing, script errors) and return a helpful message
    response = {
      result: 'error',
      message: 'Script error: ' + error.message,
      stack: error.stack // Useful for debugging
    };
  }

  // Return the response as a JSON string, which is standard practice for web apps.
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Handles the submission of the climber registration form.
 * Appends a new row to the 'Climbers' sheet.
 * @param {Object} data The parsed JSON data from the form.
 * @returns {Object} A success or error object.
 */
function handleClimberRegistration(data) {
  try {
    const sheetName = 'Climbers';
    // Get the active spreadsheet and the specific sheet by its name.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found. Please check the sheet name.`);
    }

    // Append the data as a new row. The order here must exactly match your sheet's column order.
    sheet.appendRow([
      new Date(), // Timestamp for when the registration occurred
      data.Name,
      data['Date of Birth'], // Use bracket notation for keys with spaces
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
 * Handles adding or updating qualification boulders for a specific round.
 * This function first deletes all existing boulders for the given quali round
 * and then adds the new set of boulders. This prevents duplicate entries.
 * @param {Object} data The parsed JSON data from the form, containing 'quali' and 'boulders' array.
 * @returns {Object} A success or error object.
 */
function handleAddBoulders(data) {
  try {
    const sheetName = 'qBoulders';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found. Please check the sheet name.`);
    }
    
    const qualiName = data.quali;
    const newBoulders = data.boulders;

    if (!qualiName) {
      throw new Error('Quali name is missing from the submission data.');
    }

    // --- Deletion Step: Remove old boulders for this quali round ---
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const qualiColumnIndex = 0; // The 'Quali' column is the first column (index 0)

    // Loop backwards when deleting rows to avoid issues with shifting row indices.
    for (let i = values.length - 1; i >= 1; i--) { // Start from the last row and skip the header (row 0)
      if (values[i][qualiColumnIndex] === qualiName) {
        sheet.deleteRow(i + 1); // Row numbers are 1-based, not 0-based
      }
    }

    // --- Insertion Step: Add the new boulders ---
    if (newBoulders && newBoulders.length > 0) {
      // Prepare an array of rows to be inserted. This is more efficient than appending one by one.
      const rowsToAdd = newBoulders.map(boulder => [
        qualiName,      // Column A: Quali
        boulder.Name,     // Column B: Name
        boulder.Grade,    // Column C: Grade
        boulder.Color,    // Column D: Color
        '',               // Column E: Setter (Placeholder, since form doesn't collect this)
        boulder.A         // Column F: A (Room)
      ]);

      // Add all new boulders in a single operation for better performance.
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
