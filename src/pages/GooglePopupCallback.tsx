import { useEffect } from 'react';

export default function GooglePopupCallback() {
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Processing OAuth response
        
        // Parse the URL search parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          // OAuth error occurred
          window.close();
          return;
        }

        if (!code) {
          // No authorization code received
          window.close();
          return;
        }

        // Exchanging authorization code for token

        // Exchange code for token via backend
        const response = await fetch('/auth/google/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            code,
            redirect_uri: 'http://localhost:8080/auth/google/popup-callback'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to exchange authorization code');
        }

        const tokens = await response.json();
        
        // Store tokens in localStorage
        const expiry = Date.now() + (tokens.expires_in * 1000);
        localStorage.setItem('google_access_token', tokens.access_token);
        localStorage.setItem('google_token_expiry', expiry.toString());
        
        if (tokens.refresh_token) {
          localStorage.setItem('google_refresh_token', tokens.refresh_token);
        }

        // OAuth completed successfully
        
        // Close the popup
        window.close();

      } catch (error) {
        // Popup callback error
        window.close();
      }
    };

    processCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Authorization...
        </h2>
        <p className="text-gray-600">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
}