import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { uid, email, displayName, role = 'public', lastLogin } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Missing uid or email" });
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

