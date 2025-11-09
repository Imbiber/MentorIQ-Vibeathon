// Production Google OAuth Service with Authorization Code Flow
export class GoogleAuthService {
  private clientId: string;
  
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }
  
  private ensureConfigured(): void {
    if (!this.clientId) {
      throw new Error('Google Client ID not configured');
    }
  }

  // Check if user has valid token
  isAuthenticated(): boolean {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (!token || !expiry) return false;
    
    return Date.now() < parseInt(expiry);
  }

  // Get current access token
  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return localStorage.getItem('google_access_token');
  }

  // Start OAuth flow - using authorization code flow with server exchange
  async authenticate(): Promise<boolean> {
    this.ensureConfigured();
    const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = this.generateState();
    
    // Store state and return URL for security
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_return_url', '/upload?calendar-connected=true');
    
    // Use authorization code flow with correct Google OAuth endpoint
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(this.clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Redirect to Google OAuth
    console.log('🔄 Redirecting to Google OAuth...');
    window.location.href = authUrl;
    
    // This will never resolve since we redirect
    return new Promise(() => {});
  }

  // Handle OAuth callback with authorization code
  async handleCallback(code: string, state: string): Promise<boolean> {
    this.ensureConfigured();
    try {
      // Verify state parameter
      const storedState = localStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }

      // Exchange authorization code for access token via backend
      const response = await fetch('/auth/google/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code,
          redirect_uri: `${window.location.origin}/auth/google/callback`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const tokens = await response.json();
      
      // Store tokens
      const expiry = Date.now() + (tokens.expires_in * 1000);
      localStorage.setItem('google_access_token', tokens.access_token);
      localStorage.setItem('google_token_expiry', expiry.toString());
      
      // Store refresh token if provided
      if (tokens.refresh_token) {
        localStorage.setItem('google_refresh_token', tokens.refresh_token);
      }

      // Clean up
      localStorage.removeItem('oauth_state');
      
      return true;

    } catch (error) {
      console.error('OAuth callback error:', error);
      localStorage.removeItem('oauth_state');
      return false;
    }
  }

  // Sign out
  signOut(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_return_url');
  }

  // Test calendar access
  async testCalendarAccess(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Calendar access test failed:', error);
      return false;
    }
  }

  // Get return URL after OAuth
  getReturnUrl(): string {
    return localStorage.getItem('oauth_return_url') || '/upload';
  }

  // Generate secure state parameter
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();