/**
 * GNAFOR Field Collector — Google Apps Script endpoint (TODO §8 / Response §5.1)
 *
 * Receives the JSON payload posted by the application and appends it to a
 * Google Sheet, creating the destination tab and its header row automatically
 * on the first run. Deploy this as a Web App (Execute as: Me; Who has access:
 * Anyone) and paste the resulting /exec URL into CONFIG.SHEETS_WEBHOOK_URL.
 *
 * Expected payload (sent by the app's buildPayload/flattenForSheets):
 *   {
 *     "sheet": "Morfogenese" | "Perfilhamento" | "Producao" | "AlturaDossel",
 *     "rows":  [ { "<column>": <value>, ... }, ... ]
 *   }
 *
 * Each object in "rows" becomes one spreadsheet row. Column headers are derived
 * from the object keys, so new traits added to the app appear as new columns
 * without any change to this script.
 */

/**
 * Main entry point: handle a POST from the app.
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput} JSON result
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Empty request body' });
    }

    var payload = JSON.parse(e.postData.contents);

    // --- Validate the payload schema -------------------------------------
    if (!payload.sheet || typeof payload.sheet !== 'string') {
      return jsonResponse({ status: 'error', message: 'Missing "sheet" field' });
    }
    if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
      return jsonResponse({ status: 'error', message: 'Missing or empty "rows" array' });
    }

    var sheet = getOrCreateSheet(payload.sheet);
    var inserted = appendRows(sheet, payload.rows);

    return jsonResponse({ status: 'ok', sheet: payload.sheet, inserted: inserted });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  }
}

/**
 * Optional health check so the deployment URL can be verified in a browser.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet() {
  return jsonResponse({ status: 'ok', service: 'GNAFOR Field Collector endpoint' });
}

/**
 * Return the named sheet/tab, creating it if it does not exist yet.
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Append rows, initializing/extending the header row from the row keys so the
 * column order stays stable and new keys are added as new columns.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object[]} rows
 * @returns {number} number of rows appended
 */
function appendRows(sheet, rows) {
  // Read the current header (row 1), or start a fresh one.
  var lastCol = sheet.getLastColumn();
  var header = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(String)
    : [];

  // Collect any new keys across the incoming rows, preserving first-seen order.
  rows.forEach(function (row) {
    Object.keys(row).forEach(function (key) {
      if (header.indexOf(key) === -1) header.push(key);
    });
  });

  // Write (or rewrite) the header row.
  sheet.getRange(1, 1, 1, header.length).setValues([header]);

  // Build the value matrix aligned to the header order.
  var matrix = rows.map(function (row) {
    return header.map(function (key) {
      return row[key] !== undefined && row[key] !== null ? row[key] : '';
    });
  });

  // Append below the existing data.
  var startRow = Math.max(sheet.getLastRow(), 1) + 1;
  sheet.getRange(startRow, 1, matrix.length, header.length).setValues(matrix);

  return matrix.length;
}

/**
 * Wrap an object as a JSON TextOutput response.
 * @param {Object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
