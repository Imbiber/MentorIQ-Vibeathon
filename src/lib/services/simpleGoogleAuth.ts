// Simple popup-based Google OAuth for calendar access
import { googleAuthService } from './googleAuth';

export class SimpleGoogleAuth {
  private clientId: string;
  
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!this.clientId) {
      throw new Error('Google Client ID not configured');
    }
  }

  // Simple popup-based OAuth that works reliably
  async authenticatePopup(): Promise<string | null> {
    try {
      const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';
      const redirectUri = `${window.location.origin}/auth/google/popup-callback`;
      const state = this.generateState();

      // Build OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(this.clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log('🔄 Opening Google OAuth popup...');

      // IMPORTANT: Open popup IMMEDIATELY in the event handler (not in async callback)
      // to avoid popup blocker. Open to about:blank first, then navigate
      const popup = window.open(
        'about:blank',
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes,noreferrer'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      // Navigate the popup to the OAuth URL
      popup.location.href = authUrl;

      // Wait for popup to complete
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkClosed);
              // Check if we got a token stored from the callback
              const token = localStorage.getItem('google_access_token');
              if (token) {
                console.log('✅ OAuth completed - token found in localStorage');
                resolve(token);
              } else {
                console.log('❌ OAuth completed but no token found');
                resolve(null);
              }
            }
          } catch (error) {
            console.log('Checking popup status...', error.message);
          }
        }, 1000);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth timeout - please try again'));
        }, 120000);
      });

    } catch (error) {
      console.error('OAuth popup error:', error);
      throw error;
    }
  }

  // Generate secure state parameter
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Check if user has valid token
  hasValidToken(): boolean {
    return googleAuthService.isAuthenticated();
  }

  // Get current access token
  getAccessToken(): string | null {
    return googleAuthService.getAccessToken();
  }
}

// Export singleton instance
export const simpleGoogleAuth = new SimpleGoogleAuth();