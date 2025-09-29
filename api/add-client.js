import { google } from 'googleapis';

export default async function handler(req, res) {
  // SECURITY: Rate limiting check
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`API request from IP: ${clientIP}`);
  
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { uid, email, displayName, role = 'public', lastLogin } = req.body;

  // SECURITY: Input validation and sanitization
  if (!uid || !email) {
    return res.status(400).json({ error: "Missing uid or email" });
  }

  // SECURITY: Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // SECURITY: Validate role
  const validRoles = ['public', 'pro', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  // SECURITY: Validate input lengths
  if (uid.length > 128 || email.length > 255 || (displayName && displayName.length > 100)) {
    return res.status(400).json({ error: "Input too long" });
  }

  try {
    // Konfiguracja Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEETS_CLIENTS_ID;

    // Najpierw sprawdź czy użytkownik już istnieje
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:E',
    });

    const rows = getResponse.data.values || [];
    const headers = rows[0] || ['uid', 'email', 'displayName', 'role', 'lastLogin'];
    
    // Znajdź istniejącego użytkownika
    const existingRowIndex = rows.findIndex((row, index) => {
      if (index === 0) return false; // Skip header row
      return row[0] === uid || row[1] === email;
    });

    const currentTime = lastLogin || new Date().toISOString();

    if (existingRowIndex > 0) {
      // Aktualizuj istniejącego użytkownika
      const updateRange = `E${existingRowIndex + 1}:E${existingRowIndex + 1}`; // lastLogin column
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[currentTime]]
        }
      });

      console.log(`Updated existing client: ${email}`);
      return res.status(200).json({ 
        message: "Client updated successfully", 
        action: "updated",
        email 
      });
    } else {
      // Dodaj nowego użytkownika
      const newRow = [
        uid,
        email,
        displayName || '',
        role,
        currentTime
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [newRow]
        }
      });

      console.log(`Added new client: ${email}`);
      return res.status(201).json({ 
        message: "Client added successfully", 
        action: "created",
        email 
      });
    }

  } catch (error) {
    console.error('Error adding/updating client in Google Sheets:', error);
    res.status(500).json({ 
      error: 'Failed to add/update client', 
      details: error.message 
    });
  }
}

