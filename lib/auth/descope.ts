import DescopeClient from '@descope/web-js-sdk';

// Initialize Descope client
const descope = DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID! });

export { descope };

// Types for Descope authentication
export interface DescopeUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface DescopeTokens {
  google?: string;
  notion?: string;
  slack?: string;
  microsoft?: string;
}

// Auth utilities
export const authUtils = {
  // Get current user session (mock for demo)
  async getCurrentUser(): Promise<DescopeUser | null> {
    try {
      // For demo purposes, return a mock user
      // In production, this would use real Descope authentication
      return {
        id: 'demo-user-1',
        email: 'demo@mentoriq.com',
        name: 'Demo User',
        picture: undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get integration tokens for external APIs
  async getIntegrationTokens(userId: string): Promise<DescopeTokens> {
    try {
      // Try to get session tokens
      const refreshToken = localStorage.getItem('DSR');
      if (!refreshToken) {
        console.log('No active session, returning empty tokens');
        return {};
      }

      // Get user info to check for connected services
      const userResponse = await descope.me(refreshToken);
      if (!userResponse.ok || !userResponse.data) {
        console.log('Failed to get user info');
        return {};
      }

      const user = userResponse.data;
      const tokens: DescopeTokens = {};

      // Check for connected external accounts
      // This will depend on how Descope stores outbound app tokens
      // For now, we'll check local storage and user data
      
      // Try to get Google token from local storage (set during OAuth flow)
      const googleToken = localStorage.getItem('google_access_token');
      if (googleToken) {
        tokens.google = googleToken;
      }

      // Try to get Notion token
      const notionToken = localStorage.getItem('notion_access_token');
      if (notionToken) {
        tokens.notion = notionToken;
      }

      // Try to get Slack token
      const slackToken = localStorage.getItem('slack_access_token');
      if (slackToken) {
        tokens.slack = slackToken;
      }

      console.log('Retrieved integration tokens:', Object.keys(tokens));
      return tokens;
      
    } catch (error) {
      console.error('Error getting integration tokens:', error);
      return {};
    }
  },

  // Initiate OAuth flow for Google Calendar
  async connectGoogleCalendar(): Promise<boolean> {
    try {
      // For Theme 1 compliance, we need to use Descope OAuth flow
      // This is a simplified version - in production you'd configure this in Descope Console
      const googleAuthUrl = `https://accounts.google.com/oauth2/v2/auth?` +
        `client_id=YOUR_GOOGLE_CLIENT_ID&` +
        `response_type=token&` +
        `scope=https://www.googleapis.com/auth/calendar&` +
        `redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback`;

      // Open OAuth popup
      const popup = window.open(googleAuthUrl, 'google-oauth', 'width=500,height=600');
      
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if token was stored
            const token = localStorage.getItem('google_access_token');
            resolve(!!token);
          }
        }, 1000);

        // Listen for message from popup
        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            localStorage.setItem('google_access_token', event.data.token);
            popup?.close();
            resolve(true);
          }
        });
      });
      
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      return false;
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await descope.logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
};