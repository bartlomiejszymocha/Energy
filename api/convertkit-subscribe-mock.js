// Mock ConvertKit API dla testów lokalnych
// Symuluje odpowiedzi bez wysyłania prawdziwych requestów

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, tags, fields, subscribeToNewsletter = false } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  console.log('🎭 MOCK MODE: ConvertKit simulation');
  console.log('📧 Email:', email);
  console.log('👤 Name:', firstName);
  console.log('🏷️  Tags:', tags);
  console.log('📝 Fields:', fields);
  console.log('📬 Newsletter:', subscribeToNewsletter);

  // Symulowane opóźnienie (jak prawdziwe API)
  await new Promise(resolve => setTimeout(resolve, 300));

  const results = [];

  // Symuluj odpowiedź app notifications
  results.push({
    list: 'app_notifications',
    success: true,
    data: {
      subscription: {
        id: Math.floor(Math.random() * 1000000),
        state: 'active',
        created_at: new Date().toISOString(),
        subscriber: {
          id: Math.floor(Math.random() * 1000000),
          email_address: email,
        },
      },
    },
  });

  console.log('✅ MOCK: Added to app notifications');

  // Symuluj odpowiedź newsletter (jeśli zaznaczone)
  if (subscribeToNewsletter) {
    results.push({
      list: 'newsletter',
      success: true,
      data: {
        subscription: {
          id: Math.floor(Math.random() * 1000000),
          state: 'pending', // Newsletter wymaga potwierdzenia
          created_at: new Date().toISOString(),
          subscriber: {
            id: Math.floor(Math.random() * 1000000),
            email_address: email,
          },
        },
      },
    });
    console.log('✅ MOCK: Added to newsletter (confirmation pending)');
  }

  return res.status(200).json({
    success: true,
    results,
    message: '✅ MOCK MODE: Successfully simulated ConvertKit subscription',
    mock: true, // Oznacz że to mock
  });
}
