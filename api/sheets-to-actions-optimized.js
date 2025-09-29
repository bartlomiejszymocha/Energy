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
    const range = process.env.SHEETS_RANGE || 'Actions!A:N';

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
        
        // Mapowanie nagłówków z Google Sheets na właściwości frontendu
        if (header === 'idA' && value) {
          action['id'] = value;
        } else if (header === 'rules' && value) {
          action['rules'] = value;
        } else if (header === 'title' && value) {
          action['name'] = value;
          action['title'] = value; // Keep both for compatibility
        } else if (header === 'type' && value) {
          action['type'] = value;
        } else if (header === 'duration' && value) {
          action['duration'] = parseFloat(value);
        } else if (header === 'icon' && value) {
          action['icon'] = value;
        } else if (header === 'content' && value) {
          action['description'] = value;
          action['content'] = value; // Keep both for compatibility
        } else if (header === 'breathing' && value) {
          action['breathingPattern'] = value;
        } else if (header === 'workout' && value) {
          action['workout'] = value.toString().trim();
        } else if (header === 'actionUrl' && value) {
          action['videoUrl'] = value;
        } else if (header === 'tags' && value) {
          action['tags'] = value.split(',').map(tag => tag.trim());
        } else if (header === 'exercises' && value) {
          try {
            action['exercises'] = JSON.parse(value);
          } catch (e) {
            console.error(`Error parsing exercises JSON for row ${index}:`, e);
            action['exercises'] = [];
          }
        }
        // Ignore Exercise Library columns (K-N: idE, name, videourl, note)
        // These are separate exercise definitions, not action properties
      });
      
      // Map title to name for frontend compatibility
      if (action.title && !action.name) {
        action.name = action.title;
      }
      
      return action;
    }).filter(action => action.name && action.name.trim() !== '' && action.id); // Filter out empty actions

    // Aktualizuj cache
    cache.data = actions;
    cache.timestamp = Date.now();

    // Log dla monitorowania
    console.log(`Fetched ${actions.length} actions from Google Sheets`);
    
    // Debug log - pokaż workout strings
    console.log('🔍 Workout strings from API:');
    actions.forEach((action, index) => {
      console.log(`Action ${index + 1}: "${action.name}" - Workout: "${action.workout}"`);
    });

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



