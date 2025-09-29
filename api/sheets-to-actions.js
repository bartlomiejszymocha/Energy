import { google } from 'googleapis';

// Cache dla danych
let cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minut TTL
};

export default async function handler(req, res) {
  try {
    // Sprawdź cache
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp) < cache.ttl) {
      console.log('Returning cached data');
      return res.status(200).json(cache.data);
    }

    // Konfiguracja Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Pobierz dane z arkusza
    const spreadsheetId = process.env.SHEETS_ID;
    const range = process.env.SHEETS_RANGE || 'Actions!A:K';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    // Przetwórz dane
    const headers = rows[0];
    const actions = rows.slice(1).map((row, index) => {
      const action = { id: `action_${index}` }; // Dodaj ID
      
      headers.forEach((header, colIndex) => {
        let value = row[colIndex];
        
        // Parsowanie specjalnych typów danych
        if (header === 'exercises' && value) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.error(`Error parsing exercises JSON for row ${index}:`, e);
            value = [];
          }
        } else if (header === 'tags' && value) {
          value = value.split(',').map(tag => tag.trim());
        } else if (header === 'duration' && value) {
          value = parseFloat(value);
        } else if (header === 'workout' && value) {
          // Keep workout as simple string - no JSON parsing needed
          // Frontend will handle parsing "ex001 60, R 30, ex002 45" format
          value = value.toString().trim();
        }
        
        action[header] = value;
      });
      
      return action;
    });

    // Aktualizuj cache
    cache.data = actions;
    cache.timestamp = Date.now();

    // Log dla monitorowania
    console.log(`Fetched ${actions.length} actions from Google Sheets`);

    res.status(200).json(actions);

  } catch (error) {
    console.error('Error fetching data from Google Sheets API:', error);
    
    // Jeśli mamy cached data, zwróć je
    if (cache.data) {
      console.log('Returning stale cached data due to error');
      return res.status(200).json(cache.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch data from Google Sheets',
      details: error.message 
    });
  }
}

// Endpoint do ręcznego odświeżenia cache
export async function refreshCache(req, res) {
  cache.timestamp = 0; // Wymuś odświeżenie cache
  return handler(req, res);
}


