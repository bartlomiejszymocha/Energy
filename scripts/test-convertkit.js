#!/usr/bin/env node

/**
 * ConvertKit Integration Test Script
 * 
 * Tests the ConvertKit API integration by:
 * 1. Checking environment variables
 * 2. Testing API connectivity
 * 3. Attempting a test subscription
 * 
 * Usage:
 *   node scripts/test-convertkit.js
 *   node scripts/test-convertkit.js --email=test@example.com
 *   node scripts/test-convertkit.js --email=test@example.com --newsletter
 */

require('dotenv').config({ path: '.env.local' });

const TEST_EMAIL = process.argv.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'test@energyplaybook.com';
const SUBSCRIBE_TO_NEWSLETTER = process.argv.includes('--newsletter');
const TEST_FIRST_NAME = 'Test';

const APP_FORM_ID = '693f8d6049';
const NEWSLETTER_FORM_ID = '8eed27a04c';
const API_KEY = process.env.CONVERTKIT_API_KEY;

console.log('🚀 ConvertKit Integration Test\n');
console.log('Configuration:');
console.log(`  API Key: ${API_KEY ? '✅ Set (' + API_KEY.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`  App Form ID: ${APP_FORM_ID}`);
console.log(`  Newsletter Form ID: ${NEWSLETTER_FORM_ID}`);
console.log(`  Test Email: ${TEST_EMAIL}`);
console.log(`  Subscribe to Newsletter: ${SUBSCRIBE_TO_NEWSLETTER ? 'Yes' : 'No'}`);
console.log('');

if (!API_KEY) {
  console.error('❌ ERROR: CONVERTKIT_API_KEY not found in environment variables');
  console.log('\n📝 To fix this:');
  console.log('1. Copy .env.local.example to .env.local');
  console.log('2. Add your ConvertKit API key from: https://app.convertkit.com/account_settings/advanced_settings');
  console.log('3. Run this script again');
  process.exit(1);
}

async function testConvertKitAPI() {
  console.log('🔍 Testing ConvertKit API connectivity...\n');

  try {
    // Test 1: Subscribe to app notifications (required)
    console.log('📧 Test 1: Subscribing to App Notifications Form');
    const appPayload = {
      api_secret: API_KEY,
      email: TEST_EMAIL,
      first_name: TEST_FIRST_NAME,
      tags: ['Energy Playbook User', 'App Notifications', 'Test User'],
      fields: { 
        'login_method': 'Test Script', 
        'signup_date': new Date().toISOString() 
      }
    };

    const appResponse = await fetch(`https://api.convertkit.com/v3/forms/${APP_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appPayload),
    });

    const appData = await appResponse.json();

    if (appResponse.ok) {
      console.log('✅ Success! App notification subscription created');
      console.log('   Subscriber ID:', appData.subscription?.subscriber?.id);
      console.log('   Subscription State:', appData.subscription?.state);
      console.log('   Full Response:', JSON.stringify(appData, null, 2));
    } else {
      console.log('❌ Failed to subscribe to app notifications');
      console.log('   Status:', appResponse.status, appResponse.statusText);
      console.log('   Error:', JSON.stringify(appData, null, 2));
      return;
    }

    console.log('');

    // Test 2: Subscribe to newsletter (optional)
    if (SUBSCRIBE_TO_NEWSLETTER) {
      console.log('📧 Test 2: Subscribing to Newsletter Form');
      const newsletterPayload = {
        api_secret: API_KEY,
        email: TEST_EMAIL,
        first_name: TEST_FIRST_NAME,
        tags: ['Energy Playbook User', 'Newsletter Subscriber', 'Test User'],
        fields: { 
          'login_method': 'Test Script', 
          'signup_date': new Date().toISOString() 
        }
      };

      const newsletterResponse = await fetch(`https://api.convertkit.com/v3/forms/${NEWSLETTER_FORM_ID}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterPayload),
      });

      const newsletterData = await newsletterResponse.json();

      if (newsletterResponse.ok) {
        console.log('✅ Success! Newsletter subscription created (confirmation required)');
        console.log('   Subscriber ID:', newsletterData.subscription?.subscriber?.id);
        console.log('   Subscription State:', newsletterData.subscription?.state);
        console.log('   Full Response:', JSON.stringify(newsletterData, null, 2));
        console.log('   ⚠️ Note: User needs to confirm via email to activate newsletter');
      } else {
        console.log('❌ Failed to subscribe to newsletter');
        console.log('   Status:', newsletterResponse.status, newsletterResponse.statusText);
        console.log('   Error:', JSON.stringify(newsletterData, null, 2));
      }
    }

    console.log('\n✅ ConvertKit integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your ConvertKit dashboard: https://app.convertkit.com/subscribers');
    console.log(`2. Look for subscriber: ${TEST_EMAIL}`);
    console.log('3. Verify tags and form assignments');
    if (SUBSCRIBE_TO_NEWSLETTER) {
      console.log('4. Check email for newsletter confirmation (if testing with real email)');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Verify your API key is correct');
    console.log('- Check your internet connection');
    console.log('- Verify form IDs are correct in ConvertKit dashboard');
  }
}

// Run the test
testConvertKitAPI();
