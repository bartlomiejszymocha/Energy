/**
 * Google Apps Script - Automatyczne wywoływanie Cloud Function
 * gdy dane w Google Sheets się zmienią
 */

// Konfiguracja
const CLOUD_FUNCTION_URL = 'https://your-region-your-project.cloudfunctions.net/sheets-to-actions';
const SHEET_NAME = 'Actions'; // Nazwa arkusza do monitorowania

/**
 * Główna funkcja wywoływana przy każdej zmianie w arkuszu
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  
  // Sprawdź czy zmiana jest w odpowiednim arkuszu
  if (sheet.getName() !== SHEET_NAME) return;
  
  // Sprawdź czy zmiana jest w obszarze danych (pomijając nagłówki)
  const row = range.getRow();
  const col = range.getColumn();
  
  if (row <= 1) return; // Pomijaj nagłówki
  
  // Wywołaj Cloud Function z opóźnieniem (debounce)
  debouncedTriggerWebhook();
}

/**
 * Debounced webhook trigger - wywołuje funkcję tylko raz w ciągu 5 sekund
 */
let webhookTimeout;
function debouncedTriggerWebhook() {
  // Anuluj poprzedni timeout
  if (webhookTimeout) {
    clearTimeout(webhookTimeout);
  }
  
  // Ustaw nowy timeout
  webhookTimeout = setTimeout(() => {
    triggerCloudFunction();
  }, 5000); // 5 sekund opóźnienia
}

/**
 * Wywołuje Cloud Function
 */
function triggerCloudFunction() {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      sheetName: SHEET_NAME,
      trigger: 'onEdit'
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(CLOUD_FUNCTION_URL, options);
    
    console.log('Cloud Function triggered successfully:', response.getResponseCode());
    
    // Opcjonalnie: wyślij powiadomienie
    sendNotification('Dane zaktualizowane', 'Treningi zostały zsynchronizowane z aplikacją.');
    
  } catch (error) {
    console.error('Error triggering Cloud Function:', error);
    sendNotification('Błąd synchronizacji', 'Nie udało się zsynchronizować danych: ' + error.toString());
  }
}

/**
 * Wysyła powiadomienie email
 */
function sendNotification(subject, body) {
  try {
    MailApp.sendEmail({
      to: 'bartlomiej.szymocha@gmail.com',
      subject: `Energy Playbook - ${subject}`,
      body: body
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Funkcja do ręcznego wywołania (do testowania)
 */
function manualTrigger() {
  triggerCloudFunction();
}

/**
 * Funkcja do konfiguracji triggerów
 */
function setupTriggers() {
  // Usuń istniejące triggery
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onEdit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Utwórz nowy trigger
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
    
  console.log('Triggers setup completed');
}

/**
 * Funkcja do testowania
 */
function testWebhook() {
  console.log('Testing webhook...');
  triggerCloudFunction();
}



