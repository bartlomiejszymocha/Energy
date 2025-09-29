// Google Apps Script dla automatyzacji arkusza

function onEdit(e) {
  // Automatycznie generuj ID na podstawie tytułu
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();
  
  // Jeśli edytowano kolumnę B (title), wygeneruj ID w kolumnie A
  if (col === 2 && row > 1) {
    const title = sheet.getRange(row, 2).getValue();
    if (title) {
      const id = generateId(title);
      sheet.getRange(row, 1).setValue(id);
    }
  }
  
  // Automatycznie formatuj JSON w kolumnie exercises
  if (col === 7 && row > 1) {
    const exercises = sheet.getRange(row, 7).getValue();
    if (exercises && typeof exercises === 'string') {
      try {
        const parsed = JSON.parse(exercises);
        const formatted = JSON.stringify(parsed, null, 2);
        sheet.getRange(row, 7).setValue(formatted);
      } catch (e) {
        console.log('Invalid JSON in exercises column');
      }
    }
  }
}

function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function validateData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const errors = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Sprawdź czy ID jest unikalne
    const id = row[0];
    const duplicates = data.slice(1).filter(r => r[0] === id);
    if (duplicates.length > 1) {
      errors.push(`Row ${i + 1}: Duplicate ID "${id}"`);
    }
    
    // Sprawdź czy exercises to poprawny JSON
    const exercises = row[6];
    if (exercises) {
      try {
        JSON.parse(exercises);
      } catch (e) {
        errors.push(`Row ${i + 1}: Invalid JSON in exercises column`);
      }
    }
  }
  
  if (errors.length > 0) {
    SpreadsheetApp.getUi().alert('Validation Errors:\n' + errors.join('\n'));
  } else {
    SpreadsheetApp.getUi().alert('All data is valid!');
  }
}



