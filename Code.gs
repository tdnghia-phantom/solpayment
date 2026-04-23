// ID của Google Sheet Payment-SOL
const SPREADSHEET_ID = '1A2bDMWdTP9HI5ZPnpXIh8dl5Rv5qAadRndzqKQfsv28';
const SHEET_STUDENT = 'Student-List';
const SHEET_PARAMS = 'Parameters';

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : null;
  
  if (!action) {
    return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('Thanh toán Học phí')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
  
  try {
    let result;
    if (action === 'getInitialData') {
      result = getInitialData();
    } else if (action === 'checkPaymentStatus') {
      // Direct return of object { status, money }
      result = checkPaymentStatus(e.parameter.id);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Params
  const paramSheet = ss.getSheetByName(SHEET_PARAMS);
  const paymentPeriod = paramSheet ? paramSheet.getRange('A2').getValue() : "N/A";
  
  // 2. Students
  const stdSheet = ss.getSheetByName(SHEET_STUDENT);
  if (!stdSheet) return { paymentPeriod: paymentPeriod, students: [] };
  
  const lastRow = stdSheet.getLastRow();
  if (lastRow < 2) return { paymentPeriod: paymentPeriod, students: [] };
  
  // 0: ID | 1: Eng | 2: VN | 3: Class | 4: PayFromToDate | 5: Money
  // 6: WhoseBank | 7: BankName | 8: BankAccNber | 9: QRLink | 10: VirtualBankAcc
  // 11: PaymentStatus | 12: MoneyKHTransfered | 13: Note | 14: PayTimeStamp
  const data = stdSheet.getRange(2, 1, lastRow - 1, 15).getValues();
  
  const students = data
    .filter(row => row[2]) // Filter by VN Name
    .map(row => {
      return {
        id: String(row[0]),
        engName: String(row[1]),
        vnName: String(row[2]),
        className: String(row[3]),
        payPeriod: String(row[4]),
        amount: Number(row[5]),
        ownerName: String(row[6]),
        bankName: String(row[7]),
        bankAcc: String(row[8]),
        qrLink: String(row[9]),
        virtualBankAcc: String(row[10]),
        status: String(row[11])
      };
    });
    
  return { paymentPeriod: paymentPeriod, students: students };
}

function checkPaymentStatus(studentId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_STUDENT);
  if (!sheet) return { status: "UnPAID", money: "" };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(studentId)) {
      // 0: ID | 1: Eng | 2: VN | 3: Class | 4: PayFromToDate | 5: Money
      // 6: WhoseBank | 7: BankName | 8: BankAccNber | 9: QRLink | 10: VirtualBankAcc
      // 11: PaymentStatus | 12: MoneyKHTransfered | 13: Note | 14: PayTimeStamp
      let moneyVal = data[i][12];
      return {
        status: String(data[i][11]),
        money: String(moneyVal === undefined || moneyVal === null ? "" : moneyVal)
      }; 
    }
  }
  return { status: "UnPAID", money: "" };
}