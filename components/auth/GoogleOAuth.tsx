import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleOAuthProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

export const GoogleOAuth: React.FC<GoogleOAuthProps> = ({
  onSuccess,
  onError,
  buttonText = "Connect Google Calendar",
  className = ""
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check if already connected on mount
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');
    
    if (token && tokenExpiry) {
      const expiry = parseInt(tokenExpiry);
      if (Date.now() < expiry) {
        setAccessToken(token);
        setIsConnected(true);
      } else {
        // Token expired, clear it
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
      }
    }
  }, []);

  const handleGoogleAuth = async () => {
    setIsConnecting(true);
    
    try {
      // Get Google Client ID from environment
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      }

      // Google OAuth 2.0 parameters
      const scope = 'https://www.googleapis.com/auth/calendar';
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const responseType = 'token';
      const state = Math.random().toString(36).substring(2, 15);

      // Store state for security
      localStorage.setItem('oauth_state', state);

      // Build OAuth URL
      const authUrl = `https://accounts.google.com/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // For demo purposes, simulate successful connection if no real client ID
      if (clientId === 'your-google-client-id' || !clientId.includes('googleusercontent.com')) {
        console.log('Demo mode: Would open OAuth URL:', authUrl);
        
        // Simulate successful OAuth flow
        setTimeout(() => {
          const demoToken = `demo_google_token_${Date.now()}`;
          const expiry = Date.now() + 3600 * 1000; // 1 hour
          
          localStorage.setItem('google_access_token', demoToken);
          localStorage.setItem('google_token_expiry', expiry.toString());
          
          setAccessToken(demoToken);
          setIsConnected(true);
          setIsConnecting(false);
          
          onSuccess?.(demoToken);
          
          // Show success message
          alert('✅ Google Calendar connected successfully! (Demo Mode)\n\nIn production, this would connect to your real Google Calendar.');
        }, 1500);
        
        return;
      }

      // Real OAuth flow
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          // Check if token was received
          const token = localStorage.getItem('google_access_token');
          if (!token) {
            onError?.('OAuth was cancelled or failed');
          }
        }
      }, 1000);

      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          const { access_token, expires_in } = event.data;
          const expiry = Date.now() + (expires_in * 1000);
          
          localStorage.setItem('google_access_token', access_token);
          localStorage.setItem('google_token_expiry', expiry.toString());
          
          setAccessToken(access_token);
          setIsConnected(true);
          setIsConnecting(false);
          
          onSuccess?.(access_token);
          popup?.close();
          
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          onError?.(event.data.error);
          setIsConnecting(false);
          popup?.close();
          
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
        }
      };

      window.addEventListener('message', messageListener);

    } catch (error) {
      console.error('Google OAuth error:', error);
      onError?.(error instanceof Error ? error.message : 'Authentication failed');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    setAccessToken(null);
    setIsConnected(false);
  };

  const testCalendarAccess = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const calendar = await response.json();
        alert(`✅ Calendar access confirmed!\nCalendar: ${calendar.summary}`);
      } else {
        throw new Error('Calendar access failed');
      }
    } catch (error) {
      alert(`❌ Calendar test failed: ${error}`);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isConnected ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Calendar className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Connected and ready to schedule' : 'Connect to create events automatically'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
              <button
                onClick={testCalendarAccess}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Test
              </button>
              <button
                onClick={handleDisconnect}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleAuth}
              disabled={isConnecting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {buttonText}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Configuration Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Configuration Required</p>
            <p className="mb-2">To connect your real Google Calendar:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Add your Google Client ID to the .env file as VITE_GOOGLE_CLIENT_ID</li>
              <li>Set up OAuth redirect URI in Google Cloud Console: <code>http://localhost:8080/auth/google/callback</code></li>
              <li>Enable Google Calendar API in your Google Cloud project</li>
            </ol>
            <p className="mt-2 text-xs">Without configuration, demo mode will be used.</p>
          </div>
        </div>
      </div>
    </div>
  );
};