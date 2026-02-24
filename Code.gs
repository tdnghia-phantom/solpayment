// ID của Google Sheet Payment-SOL
const SPREADSHEET_ID = '1A2bDMWdTP9HI5ZPnpXIh8dl5Rv5qAadRndzqKQfsv28';
const SHEET_STUDENT = 'Student-List';
const SHEET_PARAMS = 'Parameters';
const SHEET_BANK_INFO = 'BankInfo';

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
  
  // 2. Bank Info
  const bankSheet = ss.getSheetByName(SHEET_BANK_INFO);
  let bankMap = {};
  
  if (bankSheet) {
    const bankLastRow = bankSheet.getLastRow();
    if (bankLastRow >= 2) {
      // A:IDBK, B:BankName, C:BankAccNber, D:QRLink, E:WhoseBank, F:VirtualBankAcc
      const bankData = bankSheet.getRange(2, 1, bankLastRow - 1, 6).getValues();
      bankData.forEach(row => {
        bankMap[String(row[0])] = {
          bankName: String(row[1]),
          bankAcc: String(row[2]),
          qrLink: String(row[3]),
          ownerName: String(row[4]),
          virtualBankAcc: String(row[5])
        };
      });
    }
  }
  
  // 3. Students
  const stdSheet = ss.getSheetByName(SHEET_STUDENT);
  if (!stdSheet) return { paymentPeriod: paymentPeriod, students: [] };
  
  const lastRow = stdSheet.getLastRow();
  if (lastRow < 2) return { paymentPeriod: paymentPeriod, students: [] };
  
  // 0: ID | 1: Eng | 2: VN | 3: Class 
  // 4: PayFromToDate | 5: StartDateInform | 6: LinkGroupZaloInform
  // 7: Money | 8: IDBK | 9: PaymentStatus | 10: MoneyKHTransfered | 11: Note
  const data = stdSheet.getRange(2, 1, lastRow - 1, 12).getValues();
  
  const students = data
    .filter(row => row[2]) // Filter by VN Name
    .map(row => {
      const idbk = String(row[8]);
      const bankInfo = bankMap[idbk] || {};
      
      return {
        id: String(row[0]),
        engName: String(row[1]),
        vnName: String(row[2]),
        className: String(row[3]),
        payPeriod: String(row[4]),
        startDateInform: String(row[5]),
        zaloLink: String(row[6]),
        amount: Number(row[7]),
        bankName: bankInfo.bankName || "",
        bankAcc: bankInfo.bankAcc || "",
        qrLink: bankInfo.qrLink || "",
        ownerName: bankInfo.ownerName || "",
        virtualBankAcc: bankInfo.virtualBankAcc || "",
        status: String(row[9])
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
      // Index 9: PaymentStatus, Index 10: MoneyKHTransfered
      // Return money as String to handle text/formatted values
      let moneyVal = data[i][10];
      return {
        status: String(data[i][9]),
        money: String(moneyVal === undefined || moneyVal === null ? "" : moneyVal)
      }; 
    }
  }
  return { status: "UnPAID", money: "" };
}