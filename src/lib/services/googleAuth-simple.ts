// Simple Google Auth using Google Identity Services (no consent screen needed)
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export class SimpleGoogleAuthService {
  private clientId: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!this.clientId) {
      throw new Error('Google Client ID not configured');
    }
  }

  // Initialize Google APIs
  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        // Load Google API Client
        const script2 = document.createElement('script');
        script2.src = 'https://apis.google.com/js/api.js';
        script2.onload = () => {
          window.gapi.load('client', () => {
            window.gapi.client.init({
              apiKey: this.clientId, // We'll use Client ID as API key for now
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
            }).then(resolve);
          });
        };
        document.head.appendChild(script2);
      };
      document.head.appendChild(script);
    });
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken && localStorage.getItem('google_access_token') !== null;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('google_access_token');
  }

  // Authenticate using Google Identity Services popup
  async authenticate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            console.log('Google Identity response:', response);
            // This gives us an ID token, we need to exchange it
            this.handleIdToken(response.credential).then(resolve).catch(reject);
          }
        });

        // Alternative: Use OAuth 2.0 token client
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            this.accessToken = response.access_token;
            const expiry = Date.now() + (response.expires_in * 1000);
            
            localStorage.setItem('google_access_token', response.access_token);
            localStorage.setItem('google_token_expiry', expiry.toString());
            
            console.log('✅ Google OAuth successful!');
            resolve(true);
          },
        });

        // Request access token
        client.requestAccessToken();

      } catch (error) {
        console.error('Authentication error:', error);
        reject(error);
      }
    });
  }

  // Handle ID token (if needed)
  private async handleIdToken(idToken: string): Promise<boolean> {
    // For calendar access, we actually need an access token, not just ID token
    // This is a fallback, the OAuth 2.0 flow above is preferred
    console.log('ID Token received, but we need access token for Calendar API');
    return false;
  }

  // Sign out
  signOut(): void {
    this.accessToken = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
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

  // Popup-based OAuth authentication (returns the token directly)
  async authenticatePopup(): Promise<string | null> {
    try {
      await this.authenticate();
      return this.getAccessToken();
    } catch (error) {
      console.error('Popup authentication failed:', error);
      return null;
    }
  }
}

// Export singleton
export const simpleGoogleAuthService = new SimpleGoogleAuthService();