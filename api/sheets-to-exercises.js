import { google } from 'googleapis';

// Cache dla danych ćwiczeń
let cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minut TTL
};

export default async function handler(req, res) {
  try {
    // Sprawdź cache
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp) < cache.ttl) {
      console.log('Returning cached exercise data');
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

    // Pobierz dane z arkusza - Exercise Library (kolumny K-N)
    const spreadsheetId = process.env.SHEETS_ID;
    const range = 'Actions & Exercises!K:N'; // idE, name, videourl, note

    console.log('🔍 Fetching exercises from spreadsheet:', spreadsheetId, 'range:', range);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    console.log('📊 Raw exercise response rows:', rows ? rows.length : 0);
    
    if (!rows || rows.length === 0) {
      console.log('❌ No exercise rows found in sheet');
      return res.status(200).json({});
    }

    // Przetwórz dane ćwiczeń
    const headers = rows[0].map(header => header.trim()); // Usuń spacje z nagłówków
    console.log('📋 Exercise headers found:', headers);
    
    const exercises = {};
    
    rows.slice(1).forEach((row, index) => {
      console.log(`📋 Processing exercise row ${index + 1}:`, row);
      
      const exercise = {};
      headers.forEach((header, colIndex) => {
        exercise[header] = row[colIndex] || '';
      });
      
      console.log(`📋 Parsed exercise ${index + 1}:`, exercise);
      
      // Tylko dodaj ćwiczenie jeśli ma idE (id)
      if (exercise.idE && exercise.idE.trim()) {
        exercises[exercise.idE.trim()] = {
          id: exercise.idE.trim(),
          name: exercise.name || 'Nieznane ćwiczenie',
          videoUrl: exercise.videourl || '', // Map videourl to videoUrl
          videourl: exercise.videourl || '', // Keep both for compatibility
          note: exercise.note || ''
        };
        console.log(`✅ Added exercise: ${exercise.idE.trim()} = ${exercise.name}`);
      }
    });

    // Aktualizuj cache
    cache.data = exercises;
    cache.timestamp = Date.now();

    // Log dla monitorowania
    console.log(`Fetched ${Object.keys(exercises).length} exercises from Google Sheets:`, Object.keys(exercises));

    res.status(200).json(exercises);

  } catch (error) {
    console.error('Error fetching exercise data from Google Sheets:', error);
    
    // Jeśli mamy cached data, zwróć je
    if (cache.data) {
      console.log('Returning stale cached exercise data due to error');
      return res.status(200).json(cache.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch exercise data',
      details: error.message 
    });
  }
}
