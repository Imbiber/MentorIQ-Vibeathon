import React, { useState } from 'react';
import { authUtils } from '../../lib/auth/descope';

interface GoogleCalendarConnectProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({
  onSuccess,
  onError
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  React.useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      const tokens = await authUtils.getIntegrationTokens('current-user');
      setIsConnected(!!tokens.google);
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // For demo purposes, we'll simulate the OAuth flow
      // In production, this would use proper Descope Outbound Apps
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a demo token for testing
      const demoToken = `demo_google_token_${Date.now()}`;
      localStorage.setItem('google_access_token', demoToken);
      
      setIsConnected(true);
      onSuccess?.();
      
      console.log('Google Calendar connected successfully (demo mode)');
      
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      onError?.('Failed to connect to Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_access_token');
    setIsConnected(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-500">
              {isConnected 
                ? 'Schedule action items automatically' 
                : 'Connect to create calendar events'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
              <button
                onClick={handleDisconnect}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Connection Status Details */}
      {isConnected && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Auto-schedule action items:</span>
              <span className="text-green-600">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Focus time blocking:</span>
              <span className="text-green-600">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Smart reminders:</span>
              <span className="text-green-600">✓ Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      <div className="mt-3 pt-3 border-t border-yellow-100 bg-yellow-50 rounded-md p-2">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-yellow-800">
            <p className="font-medium">Demo Mode Active</p>
            <p className="mt-1">
              Calendar events will be simulated. For production, configure 
              Google OAuth in Descope Console with your client ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};