// This is the Google Apps Script code you need to paste into your Apps Script project

function doGet() {
  return HtmlService.createHtmlOutput("Invoice System API")
}

function doPost(e) {
  try {
    // Get the spreadsheet
    const spreadsheetId = "1ufyHCyQZLh2TB3zGnVCjW_s2ZSoSRVpmbqPq3Kh3t1Y" // Your spreadsheet ID
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    const sheet = spreadsheet.getSheetByName("Invoices") || spreadsheet.getSheets()[0]

    // Parse the data from the request
    const data = JSON.parse(e.parameter.data)

    // Clear existing data (except headers)
    const lastRow = Math.max(sheet.getLastRow(), 1)
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear()
    }

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Invoice No",
        "Date",
        "Client Name",
        "Client Address",
        "Client Phone",
        "Items",
        "Total Amount",
        "Discount (%)",
        "Final Amount",
        "Paid Amount",
        "Due Amount",
        "Payment Status",
        "Confirmed By",
      ]
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    }

    // Add the new data
    if (data && data.length > 0) {
      const values = data.map((item) => [
        item["Invoice No"],
        item["Date"],
        item["Client Name"],
        item["Client Address"],
        item["Client Phone"],
        item["Items"],
        item["Total Amount"],
        item["Discount (%)"],
        item["Final Amount"],
        item["Paid Amount"],
        item["Due Amount"],
        item["Payment Status"],
        item["Confirmed By"],
      ])

      sheet.getRange(2, 1, values.length, values[0].length).setValues(values)
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Data successfully saved to Google Sheets",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "Error: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}
