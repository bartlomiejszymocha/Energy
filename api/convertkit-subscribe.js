// Vercel Serverless Function for ConvertKit subscription
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, tags, fields, subscribeToNewsletter = false } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const API_KEY = process.env.CONVERTKIT_API_KEY;
  
  // App notifications list (confirmed immediately)
  const APP_FORM_ID = '2506447'; // Nowości o aplikacji
  
  // Newsletter list (requires confirmation) 
  const NEWSLETTER_FORM_ID = '2500809'; // Tips o produktywności

  if (!API_KEY) {
    console.error('ConvertKit API key not configured');
    return res.status(500).json({ error: 'ConvertKit not configured' });
  }

  try {
    const results = [];

    // 1. Always add to app notifications (confirmed immediately)
    const appPayload = {
      api_secret: API_KEY,
      email,
      first_name: firstName || '',
      tags: tags || ['Energy Playbook User', 'App Notifications'],
      fields: fields || {}
    };

    console.log('Adding to app notifications:', { email, firstName });

    const appResponse = await fetch(`https://api.convertkit.com/v3/forms/${APP_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appPayload),
    });

    const appData = await appResponse.json();
    results.push({ list: 'app_notifications', success: appResponse.ok, data: appData });

    if (!appResponse.ok) {
      console.error('App notifications subscription failed:', appData);
    } else {
      console.log('App notifications success:', appData);
    }

    // 2. Optionally add to newsletter (requires confirmation)
    if (subscribeToNewsletter) {
      const newsletterPayload = {
        api_secret: API_KEY,
        email,
        first_name: firstName || '',
        tags: tags || ['Energy Playbook User', 'Newsletter Subscriber'],
        fields: fields || {}
      };

      console.log('Adding to newsletter (with confirmation):', { email, firstName });

      const newsletterResponse = await fetch(`https://api.convertkit.com/v3/forms/${NEWSLETTER_FORM_ID}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterPayload),
      });

      const newsletterData = await newsletterResponse.json();
      results.push({ list: 'newsletter', success: newsletterResponse.ok, data: newsletterData });

      if (!newsletterResponse.ok) {
        console.error('Newsletter subscription failed:', newsletterData);
      } else {
        console.log('Newsletter success (confirmation required):', newsletterData);
      }
    }

    const allSuccessful = results.every(r => r.success);
    
    return res.status(allSuccessful ? 200 : 207).json({ 
      success: allSuccessful, 
      results,
      message: allSuccessful 
        ? 'Successfully subscribed to email lists'
        : 'Partial success - some subscriptions failed'
    });

  } catch (error) {
    console.error('ConvertKit request failed:', error);
    return res.status(500).json({ 
      error: 'Failed to subscribe to email lists',
      details: error.message
    });
  }
}
