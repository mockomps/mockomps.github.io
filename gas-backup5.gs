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

      case 'submitFinalsResult':
        response = handleSubmitFinalsResult(data);
        break;

      case 'uploadBoulderPhoto':
        response = handleUploadBoulderPhoto(data);
        break;

      case 'saveBoulderPhotoTags':
        response = handleSaveBoulderPhotoTags(data);
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

  // >>> THIS IS THE CORRECTED RETURN BLOCK FOR CORS <<<
  // It always returns JSON and includes the Access-Control-Allow-Origin header.
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setAccessControlAllowOrigin('*'); // <--- This line is now correctly in place!
                                       // It explicitly tells the browser that any origin can access this resource.
                                       // For production, you might want to replace '*' with your specific GitHub Pages URL
                                       // (e.g., 'https://yourusername.github.io').
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

    // Clear existing boulders for this quali
    const values = sheet.getDataRange().getValues();
    // Assuming 'Quali' is the first column (index 0)
    for (let i = values.length - 1; i >= 1; i--) { // Iterate backwards to safely delete rows
      if (values[i][0] === qualiName) {
        sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
      }
    }

    if (data.boulders && data.boulders.length > 0) {
      const rowsToAdd = data.boulders.map(boulder => [
        qualiName, boulder.Name, boulder.Grade, boulder.Color, '', boulder.A // Assuming the empty column is for some other data
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
      // Handle the dynamic boulder results
      // Assuming boulder names in `data.results` match column headers (e.g., A, B, C, etc.)
      const boulderResult = data.results[h];
      if (boulderResult !== undefined) {
        return boulderResult;
      }
      return ''; // Default for other columns not in results
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

    // Clear existing finalists for this final
    const values = sheet.getDataRange().getValues();
    // Assuming 'Final' is the first column (index 0)
    for (let i = values.length - 1; i >= 1; i--) { // Iterate backwards to safely delete rows
      if (values[i][0] === finalName) {
        sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
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
      // Return the mapped value or an empty string if not found.
      // Important: Ensure the order matches the sheet headers.
      return dataMap[header] !== undefined ? dataMap[header] : ''; 
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

/**
 * Handles the upload of a Base64 image, saves it to Google Drive, and returns the URL.
 * @param {object} data The incoming data object containing imageData, mimeType, and imageName.
 * @returns {object} A success or error object with relevant data.
 */
function handleUploadBoulderPhoto(data) {
  try {
    // IMPORTANT: Replace with the actual ID of your Google Drive folder for boulder photos.
    // Example: const folderId = "12345abcdefg_your_folder_id";
    const folderId = "14huA4oOrebxd3L0Ubgv9N9PGcfADP_-4"; 
    const folder = DriveApp.getFolderById(folderId);

    // Decode the Base64 string into a blob (binary data)
    const base64Data = data.imageData.split(',')[1];
    const decoded = Utilities.base64Decode(base64Data);
    // Ensure the filename is unique, perhaps by adding a timestamp
    const uniqueImageName = `${data.imageName.split('.')[0]}_${new Date().getTime()}.${data.imageName.split('.').pop()}`;
    const blob = Utilities.newBlob(decoded, data.mimeType, uniqueImageName);

    // Create the file in the specified Google Drive folder
    const file = folder.createFile(blob);
    // Make file publicly accessible if needed for direct display (be careful with sensitive data)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Return the direct link to the image for use in <img> tags.
    // A direct embed link is often: https://drive.google.com/uc?export=view&id=FILE_ID
    const directEmbedLink = `https://drive.google.com/uc?export=view&id=${file.getId()}`;


    return { 
      result: 'success', 
      imageName: uniqueImageName, // Return the unique name used
      fileId: file.getId(),
      driveLink: directEmbedLink, // Use the direct embed link
      message: `Image ${uniqueImageName} uploaded successfully.`
    };

  } catch (error) {
    return { result: 'error', message: 'Image upload failed: ' + error.message, stack: error.stack };
  }
}

/**
 * Saves the final links and tag data to the QBoulderPhotos sheet.
 * @param {object} data The incoming data object containing qualiName and an array of image data with tags.
 * @returns {object} A success or error object.
 */
function handleSaveBoulderPhotoTags(data) {
  try {
    const sheetName = 'QBoulderPhotos';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const qualiNameColIndex = headers.indexOf('Quali Name');
    const imageFilenameColIndex = headers.indexOf('Image Filename');
    const driveLinkColIndex = headers.indexOf('Drive Link');
    const taggedBoulderColIndex = headers.indexOf('Tagged Boulder');
    const tagXColIndex = headers.indexOf('Tag X');
    const tagYColIndex = headers.indexOf('Tag Y');
    const tagRadiusColIndex = headers.indexOf('Tag Radius');

    if (qualiNameColIndex === -1 || imageFilenameColIndex === -1 || driveLinkColIndex === -1 ||
        taggedBoulderColIndex === -1 || tagXColIndex === -1 || tagYColIndex === -1 || tagRadiusColIndex === -1) {
      throw new Error("Missing one or more required headers in QBoulderPhotos sheet: Quali Name, Image Filename, Drive Link, Tagged Boulder, Tag X, Tag Y, Tag Radius.");
    }

    const rowsToAdd = [];
    data.taggedImages.forEach(image => {
      image.tags.forEach(tag => {
        const row = [];
        row[qualiNameColIndex] = data.quali; // Quali name from the main payload
        row[imageFilenameColIndex] = image.name;
        row[driveLinkColIndex] = image.link;
        row[taggedBoulderColIndex] = tag.boulder;
        row[tagXColIndex] = tag.x;
        row[tagYColIndex] = tag.y;
        row[tagRadiusColIndex] = tag.radius;
        
        // Fill any gaps in the row array with empty strings based on the max header index
        const maxHeaderIndex = Math.max(qualiNameColIndex, imageFilenameColIndex, driveLinkColIndex, taggedBoulderColIndex, tagXColIndex, tagYColIndex, tagRadiusColIndex);
        for (let i = 0; i <= maxHeaderIndex; i++) {
          if (row[i] === undefined) {
            row[i] = '';
          }
        }
        rowsToAdd.push(row);
      });
    });

    if (rowsToAdd.length > 0) {
        // Append all rows in one go for efficiency
        sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    return { result: 'success', message: 'All boulder photo tags and links saved successfully.' };
  } catch (error) {
    return { result: 'error', message: 'Failed to save image links: ' + error.message, stack: error.stack };
  }
}

// --- Trigger and Background Functions (no changes needed here for this feature) ---

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

/**
 * Handles OPTIONS preflight requests for CORS.
 * This is required for browsers to allow cross-domain POST requests
 * with a JSON content type.
 */
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .addHttpHeader("Access-Control-Allow-Origin", "*") // Or your specific domain
    .addHttpHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .addHttpHeader("Access-Control-Allow-Headers", "Content-Type");
}
