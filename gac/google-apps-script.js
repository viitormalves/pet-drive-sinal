/* ══════════════════════════════════════════════════════════════
   Google Apps Script — Pet Drive Sinal (GAC)
   
   SETUP:
   1. Crie uma planilha NOVA no Google Sheets
   2. Crie 4 abas com os nomes EXATOS:
      - "Alphaville"
      - "Indianópolis"
      - "São Caetano do Sul"
      - "Controle"
   3. Na aba "Controle", preencha a linha 1 (cabeçalho):
      Loja | 10:00 | 10:45 | 11:30 | 12:15 | 13:00 | 14:30 | 15:15 | 16:00 | 16:45 | 17:30
   4. Nas linhas 2, 3 e 4 da coluna A, escreva:
      alphaville
      indianopolis
      sao-caetano
   5. Nas abas das lojas, preencha a linha 1 (cabeçalho):
      Timestamp | Nome | Email | Telefone | CPF | Porte | Horário
   6. Vá em Extensões > Apps Script, cole este código
   7. Faça deploy: Implantar > Nova implantação > App da Web
      - Executar como: Eu
      - Quem pode acessar: Qualquer pessoa
   8. Copie a URL gerada e cole no SHEETS_URL do index.html
   ══════════════════════════════════════════════════════════════ */

var STORE_TABS = {
  "alphaville": "Alphaville",
  "indianopolis": "Indianópolis",
  "sao-caetano": "São Caetano do Sul"
};

var TIME_SLOTS = ["10:00","10:45","11:30","12:15","13:00","14:30","15:15","16:00","16:45","17:30"];

/* ── GET: retorna horários ocupados e CPFs registrados ── */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ctrl = ss.getSheetByName("Controle");
    
    var booked = {};
    var storeIds = ["alphaville", "indianopolis", "sao-caetano"];
    
    storeIds.forEach(function(storeId, rowIdx) {
      booked[storeId] = [];
      var row = rowIdx + 2;
      
      TIME_SLOTS.forEach(function(slot, colIdx) {
        var cell = ctrl.getRange(row, colIdx + 2).getValue();
        if (cell && String(cell).trim() !== "") {
          booked[storeId].push(slot);
        }
      });
    });
    
    var cpfs = {};
    Object.keys(STORE_TABS).forEach(function(storeId) {
      var sheet = ss.getSheetByName(STORE_TABS[storeId]);
      if (!sheet) return;
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) return;
      var cpfCol = sheet.getRange(2, 5, lastRow - 1, 1).getValues();
      cpfCol.forEach(function(row) {
        var cpf = String(row[0]).replace(/\D/g, "");
        if (cpf.length === 11) cpfs[cpf] = true;
      });
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      booked: booked,
      cpfs: cpfs
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ── POST: registra novo agendamento ── */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var storeId = data.concessionaria;
    var tabName = STORE_TABS[storeId];
    if (!tabName) throw new Error("Loja inválida: " + storeId);
    
    var horario = data.horario;
    var cpfClean = String(data.cpf).replace(/\D/g, "");
    
    // Verificar CPF duplicado
    var allTabs = Object.values(STORE_TABS);
    for (var t = 0; t < allTabs.length; t++) {
      var checkSheet = ss.getSheetByName(allTabs[t]);
      if (!checkSheet || checkSheet.getLastRow() < 2) continue;
      var cpfValues = checkSheet.getRange(2, 5, checkSheet.getLastRow() - 1, 1).getValues();
      for (var r = 0; r < cpfValues.length; r++) {
        if (String(cpfValues[r][0]).replace(/\D/g, "") === cpfClean) {
          return ContentService.createTextOutput(JSON.stringify({
            status: "error",
            message: "CPF já possui agendamento"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // Verificar horário
    var ctrl = ss.getSheetByName("Controle");
    var storeIds = ["alphaville", "indianopolis", "sao-caetano"];
    var storeRow = storeIds.indexOf(storeId) + 2;
    var slotCol = TIME_SLOTS.indexOf(horario) + 2;
    
    if (storeRow < 2 || slotCol < 2) throw new Error("Horário ou loja inválidos");
    
    var currentSlot = ctrl.getRange(storeRow, slotCol).getValue();
    if (currentSlot && String(currentSlot).trim() !== "") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Horário já ocupado"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Registrar na aba da loja
    var storeSheet = ss.getSheetByName(tabName);
    var timestamp = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");
    storeSheet.appendRow([
      timestamp,
      data.nome || "",
      data.email || "",
      data.telefone || "",
      data.cpf || "",
      data.porte || "",
      horario
    ]);
    
    // Marcar horário na aba Controle
    ctrl.getRange(storeRow, slotCol).setValue(cpfClean);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "Agendamento registrado com sucesso"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
