// Debug OAuth Configuration
console.log('🔍 Debugging OAuth Configuration...');

// Test environment variables
const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

console.log('Client ID:', clientId);
console.log('Redirect URI:', redirectUri);

// Test OAuth URL construction
if (clientId) {
  const scope = 'https://www.googleapis.com/auth/calendar';
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://accounts.google.com/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent('http://localhost:8080/auth/google/callback')}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=token&` +
    `state=${state}&` +
    `access_type=online&` +
    `prompt=consent`;

  console.log('\n🔗 Test OAuth URL:');
  console.log(authUrl);
  
  console.log('\n✅ OAuth URL generated successfully');
  console.log('You can test this URL manually in your browser');
} else {
  console.log('❌ No Google Client ID found');
}