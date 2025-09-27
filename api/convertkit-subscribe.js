// Vercel Serverless Function for ConvertKit subscription
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, tags, fields } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const API_KEY = process.env.CONVERTKIT_API_KEY;
  const SEQUENCE_ID = process.env.CONVERTKIT_SEQUENCE_ID;
  const FORM_ID = process.env.CONVERTKIT_FORM_ID;

  if (!API_KEY) {
    console.error('ConvertKit API key not configured');
    return res.status(500).json({ error: 'ConvertKit not configured' });
  }

  try {
    let endpoint, payload;

    // ConvertKit API v4 uses different endpoints and authentication
    if (SEQUENCE_ID) {
      endpoint = `https://api.convertkit.com/v4/sequences/${SEQUENCE_ID}/subscriptions`;
    } else if (FORM_ID) {
      endpoint = `https://api.convertkit.com/v4/forms/${FORM_ID}/subscriptions`;
    } else {
      console.error('No ConvertKit Sequence ID or Form ID configured');
      return res.status(500).json({ error: 'ConvertKit not properly configured' });
    }

    // API v4 uses different payload structure
    payload = {
      email_address: email,
      first_name: firstName || '',
      tags: tags || ['Energy Playbook User'],
      custom_fields: fields || {}
    };

    console.log('ConvertKit API call:', { endpoint, email, firstName });

    // API v4 uses Authorization header instead of api_key in body
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('ConvertKit API error:', data);
      return res.status(response.status).json({ 
        error: data.message || 'ConvertKit API error',
        details: data
      });
    }

    console.log('ConvertKit success:', data);
    return res.status(200).json({ 
      success: true, 
      data: data,
      message: 'Successfully subscribed to email list'
    });

  } catch (error) {
    console.error('ConvertKit request failed:', error);
    return res.status(500).json({ 
      error: 'Failed to subscribe to email list',
      details: error.message
    });
  }
}
