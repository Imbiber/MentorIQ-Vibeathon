import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { googleAuthService } from '../lib/services/googleAuth';

export default function GoogleCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth response...');
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthResponse = async () => {
      try {
        // Processing Google OAuth callback
        
        // Parse the URL search parameters (contains authorization code)
        const urlParams = new URLSearchParams(window.location.search);
        
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        // Check for errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Check if we got an authorization code
        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        if (!state) {
          throw new Error('No state parameter received');
        }

        setMessage('Exchanging authorization code for access token...');

        // Handle the callback using the auth service
        try {
          const success = await googleAuthService.handleCallback(code, state);
          if (!success) {
            throw new Error('Failed to exchange authorization code for access token');
          }
        } catch (callbackError) {
          // Callback handling failed, trying direct token exchange
          
          // Fallback: Try direct token exchange
          // Attempting direct token exchange
          
          const tokenResponse = await fetch('/auth/google/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              code,
              redirect_uri: 'http://localhost:8080/auth/google/callback'
            })
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(`Token exchange failed: ${errorData.error || tokenResponse.statusText}`);
          }

          const tokens = await tokenResponse.json();
          
          // Store tokens directly
          const expiry = Date.now() + (tokens.expires_in * 1000);
          localStorage.setItem('google_access_token', tokens.access_token);
          localStorage.setItem('google_token_expiry', expiry.toString());
          if (tokens.refresh_token) {
            localStorage.setItem('google_refresh_token', tokens.refresh_token);
          }
          
          // Token exchange successful
        }

        setStatus('success');
        setMessage('Google Calendar connected successfully! Redirecting back...');

        // Mark that calendar was just connected
        sessionStorage.setItem('calendar_just_connected', 'true');

        // Check if this is a popup window
        if (window.opener) {
          // Popup completed, closing automatically
          // Close the popup for popup-based OAuth
          window.close();
        } else {
          // Get the return URL from state
          const oauthState = sessionStorage.getItem('oauth_return_state');
          let returnPath = '/upload';

          if (oauthState) {
            try {
              const parsedState = JSON.parse(oauthState);
              returnPath = parsedState.returnTo || '/upload';
            } catch (e) {
              console.error('Failed to parse oauth_return_state:', e);
            }
          }

          // Redirect back with calendar-connected flag
          setTimeout(() => {
            const separator = returnPath.includes('?') ? '&' : '?';
            navigate(`${returnPath}${separator}calendar-connected=true`, { replace: true });
          }, 1000);
        }

      } catch (error) {
        // OAuth processing failed

        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    // Process OAuth response after component mounts
    processOAuthResponse();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900">Processing...</h1>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-green-900">Success!</h1>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-red-900">Error</h1>
            </>
          )}
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'success' && (
          <div className="text-sm text-gray-500">
            <p>This window will close automatically in a few seconds.</p>
            <p>Return to the main application to continue.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              You can close this window and try again.
            </p>
            <Link 
              to="/upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}