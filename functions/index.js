/**
 * Firebase Cloud Functions for Energy Playbook
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const {google} = require("googleapis");

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// Cache dla danych
let cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minut TTL
};

/**
 * Sheets to Actions API
 * Pobiera dane z Google Sheets i konwertuje na format ActionItem
 */
exports.sheetsToActions = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Sprawdź cache
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp) < cache.ttl) {
      logger.info('Returning cached data');
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
    const range = process.env.SHEETS_RANGE || 'Actions!A:L';

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
      const action = { id: `action_${index}` };
      
      headers.forEach((header, colIndex) => {
        let value = row[colIndex];
        
        // Parsowanie specjalnych typów danych
        if (header === 'exercises' && value) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            logger.error(`Error parsing exercises JSON for row ${index}:`, e);
            value = [];
          }
        } else if (header === 'tags' && value) {
          value = value.split(',').map(tag => tag.trim());
        } else if (header === 'duration' && value) {
          value = parseFloat(value);
        } else if (header === 'workout' && value) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            logger.error(`Error parsing workout JSON for row ${index}:`, e);
            value = [];
          }
        }
        
        action[header] = value;
      });
      
      return action;
    });

    // Aktualizuj cache
    cache.data = actions;
    cache.timestamp = Date.now();

    // Log dla monitorowania
    logger.info(`Fetched ${actions.length} actions from Google Sheets`);

    res.status(200).json(actions);

  } catch (error) {
    logger.error('Error fetching data from Google Sheets API:', error);
    
    // Jeśli mamy cached data, zwróć je
    if (cache.data) {
      logger.info('Returning stale cached data due to error');
      return res.status(200).json(cache.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch data from Google Sheets',
      details: error.message 
    });
  }
});

/**
 * ConvertKit Subscribe API
 * Dodaje użytkownika do listy ConvertKit
 */
exports.convertkitSubscribe = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, tags } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // ConvertKit API configuration
    const apiKey = process.env.CONVERTKIT_API_KEY;
    const baseUrl = 'https://api.convertkit.com/v3';

    // Subscribe to main list (automatically confirmed)
    const mainListResponse = await fetch(`${baseUrl}/forms/2506447/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: email,
        first_name: firstName || '',
        tags: tags || []
      })
    });

    if (!mainListResponse.ok) {
      throw new Error(`ConvertKit API error: ${mainListResponse.status}`);
    }

    const mainResult = await mainListResponse.json();

    // Subscribe to newsletter list (requires email confirmation)
    const newsletterResponse = await fetch(`${baseUrl}/forms/2500809/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: email,
        first_name: firstName || '',
        tags: tags || []
      })
    });

    if (!newsletterResponse.ok) {
      logger.warn('Newsletter subscription failed:', newsletterResponse.status);
    }

    logger.info(`Successfully subscribed ${email} to ConvertKit`);

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed',
      subscriber: mainResult.subscription
    });

  } catch (error) {
    logger.error('ConvertKit subscription error:', error);
    res.status(500).json({
      error: 'Failed to subscribe to ConvertKit',
      details: error.message
    });
  }
});

/**
 * Cron job to refresh sheets data
 */
exports.refreshSheetsData = onRequest(async (req, res) => {
  try {
    logger.info('Cron job: Refreshing sheets data...');
    
    // Wymuś odświeżenie cache
    cache.timestamp = 0;
    
    // Wywołaj główną funkcję
    const mockReq = { method: 'GET' };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          logger.info(`Cron job completed: ${data.length} actions refreshed`);
          return res.status(200).json({ 
            success: true, 
            message: `Refreshed ${data.length} actions`,
            timestamp: new Date().toISOString()
          });
        }
      })
    };

    // Symuluj wywołanie sheetsToActions
    await exports.sheetsToActions(mockReq, mockRes);

  } catch (error) {
    logger.error('Cron job error:', error);
    res.status(500).json({ 
      error: 'Cron job failed',
      details: error.message 
    });
  }
});