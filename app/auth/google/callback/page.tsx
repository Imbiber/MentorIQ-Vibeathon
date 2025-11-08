'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GoogleOAuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth response...');

  useEffect(() => {
    const processOAuthResponse = () => {
      try {
        // Parse the URL hash fragment (contains access_token, etc.)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');
        const state = params.get('state');
        const error = params.get('error');

        // Check for errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Verify state parameter for security
        const storedState = localStorage.getItem('oauth_state');
        if (state && storedState && state !== storedState) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        // Check if we got an access token
        if (!accessToken) {
          throw new Error('No access token received from Google');
        }

        // Store the token
        const expiryTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('google_token_expiry', expiryTime.toString());

        // Clean up state
        localStorage.removeItem('oauth_state');

        // Send success message to parent window
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_SUCCESS',
              access_token: accessToken,
              expires_in: parseInt(expiresIn || '3600')
            }, window.location.origin);
          } catch (error) {
            console.log('Could not send message to parent, using localStorage fallback');
            localStorage.setItem('oauth_result', JSON.stringify({
              type: 'GOOGLE_OAUTH_SUCCESS',
              access_token: accessToken,
              expires_in: parseInt(expiresIn || '3600')
            }));
          }
        } else {
          // Fallback: use localStorage when popup communication fails
          localStorage.setItem('oauth_result', JSON.stringify({
            type: 'GOOGLE_OAUTH_SUCCESS',
            access_token: accessToken,
            expires_in: parseInt(expiresIn || '3600')
          }));
        }

        setStatus('success');
        setMessage('Google Calendar connected successfully! You can close this window.');

        // Auto-close after 2 seconds
        setTimeout(() => {
          window.close();
        }, 2000);

      } catch (error) {
        console.error('OAuth processing error:', error);
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_OAUTH_ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, window.location.origin);
        }

        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    // Process OAuth response after component mounts
    processOAuthResponse();
  }, []);

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
              href="/upload"
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