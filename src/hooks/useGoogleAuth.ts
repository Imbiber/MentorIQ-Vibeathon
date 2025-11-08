import { useState, useEffect } from 'react';

interface GoogleAuthState {
  isConnected: boolean;
  isChecking: boolean;
  token: string | null;
}

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isConnected: false,
    isChecking: true,
    token: null
  });

  // Check for existing token on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('google_access_token');
      const expiry = localStorage.getItem('google_token_expiry');

      if (token && expiry) {
        const expiryTime = parseInt(expiry);
        const now = Date.now();

        if (now < expiryTime) {
          // Token is still valid
          setAuthState({
            isConnected: true,
            isChecking: false,
            token
          });
          return;
        } else {
          // Token expired, clear it
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_token_expiry');
        }
      }

      setAuthState({
        isConnected: false,
        isChecking: false,
        token: null
      });
    };

    checkAuth();

    // Listen for storage changes (from OAuth callback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'google_access_token' || e.key === 'google_token_expiry') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case localStorage was updated in same tab
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const connect = (clientId: string) => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';

    // Generate random state for CSRF protection
    const stateValue = 'calendar_connect_' + Math.random().toString(36).substring(7);

    // Store state in BOTH localStorage (for validation) and sessionStorage (for return path)
    localStorage.setItem('oauth_state', stateValue);

    const currentState = {
      returnTo: window.location.pathname + window.location.search,
      timestamp: Date.now()
    };
    sessionStorage.setItem('oauth_return_state', JSON.stringify(currentState));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(stateValue)}`;

    console.log('🔐 Starting OAuth with state:', stateValue);
    window.location.href = authUrl;
  };

  const disconnect = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_refresh_token');
    setAuthState({
      isConnected: false,
      isChecking: false,
      token: null
    });
  };

  return {
    ...authState,
    connect,
    disconnect
  };
}
