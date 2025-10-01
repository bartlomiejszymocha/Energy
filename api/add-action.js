import { google } from 'googleapis';

export default async function handler(req, res) {
  // SECURITY: Rate limiting check
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`API request from IP: ${clientIP}`);
  
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { title, content, type, duration, icon, workout, rules = 'priv', triggerTags = [] } = req.body;

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
  const validRules = ['priv', 'public', 'pro'];
  if (!validRules.includes(rules)) {
    return res.status(400).json({ error: "Invalid rules" });
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
    const spreadsheetId = process.env.SHEETS_ACTIONS_ID;

    // Generate unique ID for the action
    const actionId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare workout data as JSON string
    const workoutData = workout ? JSON.stringify(workout) : '';

    // Prepare trigger tags as JSON string
    const triggerTagsData = triggerTags.length > 0 ? JSON.stringify(triggerTags) : '';

    // Create new action row
    const newRow = [
      actionId,           // A: id
      title,              // B: title
      content || '',      // C: content
      type,               // D: type
      duration || 15,     // E: duration
      icon || '⚡',       // F: icon
      '',                 // G: videoUrl (empty for now)
      '',                 // H: breathingPattern (empty for now)
      workoutData,        // I: workout (JSON string)
      rules,              // J: rules
      triggerTagsData,    // K: triggerTags (JSON string)
      'admin-created',    // L: createdBy
      new Date().toISOString() // M: createdAt
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:M',
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
