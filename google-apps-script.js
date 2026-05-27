const SHEET_NAME = "Respostas";
const FOLDER_ID = "COLE_AQUI_O_ID_DA_PASTA_DO_DRIVE";
const HEADERS = [
  "Data do envio",
  "Motivo da Devolução",
  "Filial solicitante",
  "Produto foi entregue",
  "Onde o produto está",
  "Para onde o produto vai",
  "PDF no Drive",
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    const pdfUrl = savePdf(data.file);

    sheet.appendRow([
      new Date(),
      data.reason || "",
      data.branch || "",
      data.delivered || "",
      data.location || "",
      data.destination || "",
      pdfUrl,
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return sheet;
  }

  updateHeaders(sheet);
  return sheet;
}

function updateHeaders(sheet) {
  const currentHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length))
    .getValues()[0];

  const alreadyUpdated = HEADERS.every((header, index) => currentHeaders[index] === header);
  if (alreadyUpdated) {
    return;
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function savePdf(fileData) {
  if (!fileData || !fileData.content) {
    return "";
  }

  const bytes = Utilities.base64Decode(fileData.content);
  const blob = Utilities.newBlob(bytes, fileData.mimeType, fileData.name);
  const folder = FOLDER_ID && FOLDER_ID !== "COLE_AQUI_O_ID_DA_PASTA_DO_DRIVE"
    ? DriveApp.getFolderById(FOLDER_ID)
    : DriveApp.getRootFolder();
  const file = folder.createFile(blob);

  return file.getUrl();
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
