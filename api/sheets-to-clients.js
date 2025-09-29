import { google } from 'googleapis';

// Cache dla danych klientów
let cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minut TTL
};

export default async function handler(req, res) {
  try {
    // Sprawdź cache
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp) < cache.ttl) {
      console.log('Returning cached client data');
      return res.status(200).json(cache.data);
    }

    // Konfiguracja Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Pobierz dane z arkusza klientów
    const spreadsheetId = process.env.SHEETS_CLIENTS_ID;
    const range = 'Clients!A:E'; // uid, email, displayName, role, lastLogin

    console.log('🔍 Fetching clients from spreadsheet:', spreadsheetId, 'range:', range);
    console.log('🔍 Environment check - SHEETS_CLIENTS_ID exists:', !!spreadsheetId);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    console.log('📊 Raw response rows:', rows ? rows.length : 0);
    
    if (!rows || rows.length === 0) {
      console.log('❌ No rows found in clients sheet');
      return res.status(200).json([]);
    }

    // Przetwórz dane (pierwszy wiersz to nagłówki)
    const headers = rows[0];
    console.log('📋 Headers found:', headers);
    
    const clients = rows.slice(1).map((row, index) => {
      console.log(`📋 Processing row ${index + 1}:`, row);
      const client = {};
      headers.forEach((header, colIndex) => {
        client[header] = row[colIndex] || '';
      });
      console.log(`📋 Parsed client ${index + 1}:`, client);
      return client;
    }).filter(client => {
      const hasData = client.uid || client.email;
      console.log(`📋 Client ${client.email || client.uid} has data:`, hasData);
      return hasData;
    }); // Filtruj puste wiersze

    // Aktualizuj cache
    cache.data = clients;
    cache.timestamp = Date.now();

    // Log dla monitorowania
    console.log(`Fetched ${clients.length} clients from Google Sheets`);

    res.status(200).json(clients);

  } catch (error) {
    console.error('Error fetching client data from Google Sheets:', error);
    
    // Jeśli mamy cached data, zwróć je
    if (cache.data) {
      console.log('Returning stale cached client data due to error');
      return res.status(200).json(cache.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch client data',
      details: error.message 
    });
  }
}

