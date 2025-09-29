#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importuj dane z constants/actions.ts
const { ACTION_LIBRARY } = await import('../constants/actions.ts');

// Konwertuj na CSV
function convertToCSV(actions) {
  const headers = [
    'id',
    'title', 
    'type',
    'duration',
    'icon',
    'content',
    'exercises',
    'triggerTags',
    'category',
    'difficulty',
    'equipment',
    'workout'
  ];

  const csvRows = [headers.join(',')];

  actions.forEach(action => {
    const row = headers.map(header => {
      let value = action[header] || '';
      
      // Konwertuj tablice i obiekty na JSON
      if (Array.isArray(value) || typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape wartości zawierające przecinki
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Eksportuj dane
const csv = convertToCSV(ACTION_LIBRARY);
const outputPath = path.join(__dirname, '../data/actions.csv');

// Stwórz folder jeśli nie istnieje
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Zapisz plik
fs.writeFileSync(outputPath, csv, 'utf8');

console.log(`✅ Eksportowano ${ACTION_LIBRARY.length} akcji do: ${outputPath}`);
console.log(`📊 Pierwsze 3 wiersze:`);
console.log(csv.split('\n').slice(0, 4).join('\n'));
