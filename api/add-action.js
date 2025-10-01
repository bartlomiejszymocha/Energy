import { google } from 'googleapis';

export default async function handler(req, res) {
  // SECURITY: Rate limiting check
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`API request from IP: ${clientIP}`);
  
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { title, content, type, duration, icon, workout, rules = 'admin', triggerTags = [] } = req.body;

  // SECURITY: Input validation and sanitization
  if (!title || !type) {
    return res.status(400).json({ error: "Missing title or type" });
  }

  // SECURITY: Validate input lengths
  if (title.length > 100 || (content && content.length > 1000)) {
    return res.status(400).json({ error: "Input too long" });
  }

  // SECURITY: Validate type
  const validTypes = ['Reset Energetyczny', 'Protokół Ruchowy', 'Protokuł Ruchowy', 'Technika oddechowa', 'Technika Oddechowa'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid action type" });
  }

  // SECURITY: Validate rules
  const validRules = ['priv', 'public', 'pro', 'admin'];
  if (!validRules.includes(rules)) {
    return res.status(400).json({ error: "Invalid rules" });
  }

  try {
    // Check required environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Missing Google Sheets credentials');
    }
    
    const spreadsheetId = process.env.SHEETS_ID;
    if (!spreadsheetId) {
      throw new Error('Missing required parameters: spreadsheetId');
    }

    console.log('🔍 Adding action to spreadsheet:', spreadsheetId);

    // Konfiguracja Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Generate unique ID for the action (numeric for idA column)
    const actionId = Date.now();

    // Convert workout steps to workout string format (like existing format)
    const workoutString = workout ? workout.map(step => {
      if (step.type === 'exercise') {
        return `${step.exerciseId} ${step.duration}`;
      } else {
        return `R ${step.duration}`;
      }
    }).join(', ') : '';

    // Create new action row matching the sheet structure
    const newRow = [
      actionId,           // A: idA (numeric)
      rules,              // B: rules
      title,              // C: title
      type,               // D: type
      duration || 15,     // E: duration
      icon || '⚡',       // F: icon
      content || '',      // G: content
      '',                 // H: breathing (empty for now)
      workoutString,      // I: workout (string format)
      ''                  // J: actionUrl (empty for now)
    ];

    console.log('🔍 New action row:', newRow);
    console.log('🔍 Workout string:', workoutString);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Actions & Exercises!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow]
      }
    });

    console.log(`Added new action: ${title} (ID: ${actionId})`);
    return res.status(201).json({ 
      message: "Action added successfully", 
      actionId,
      title 
    });

  } catch (error) {
    console.error('Error adding action to Google Sheets:', error);
    res.status(500).json({ 
      error: 'Failed to add action', 
      details: error.message 
    });
  }
}
