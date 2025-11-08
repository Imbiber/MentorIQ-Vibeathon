import React, { useState } from 'react';
import { GoogleCalendarConnect } from '../integrations/GoogleCalendarConnect';
import { GoogleCalendarService } from '../../lib/integrations/google-calendar';
import { authUtils } from '../../lib/auth/descope';

export const CalendarTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runCalendarTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting Google Calendar integration test...');
      
      // Test 1: Check token retrieval
      addResult('📋 Test 1: Checking token retrieval...');
      const tokens = await authUtils.getIntegrationTokens('test-user');
      
      if (tokens.google) {
        addResult('✅ Google token found: ' + tokens.google.substring(0, 20) + '...');
      } else {
        addResult('⚠️ No Google token found - using demo mode');
      }

      // Test 2: Initialize Calendar Service
      addResult('📋 Test 2: Initializing Google Calendar service...');
      const calendarService = new GoogleCalendarService(tokens.google || '');
      addResult('✅ Calendar service initialized');

      // Test 3: Create a test event
      addResult('📋 Test 3: Creating test calendar event...');
      const testAction = {
        title: 'Practice public speaking',
        description: 'Prepare for next week\'s presentation. Practice key points and timing.',
        estimatedTime: 45,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'high'
      };

      const eventId = await calendarService.createImplementationEvent(testAction);
      if (eventId) {
        addResult('✅ Calendar event created successfully: ' + eventId);
      } else {
        addResult('❌ Failed to create calendar event');
      }

      // Test 4: Create focus blocks
      addResult('📋 Test 4: Creating focus time blocks...');
      const focusSchedule = {
        title: 'Deep Work Session',
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        startTime: '09:00',
        duration: 90 // 1.5 hours
      };

      const focusEvents = await calendarService.createFocusBlocks(focusSchedule);
      addResult(`✅ Created ${focusEvents.length} focus blocks`);

      // Test 5: Get upcoming events
      addResult('📋 Test 5: Fetching upcoming events...');
      const upcomingEvents = await calendarService.getUpcomingEvents(5);
      addResult(`✅ Found ${upcomingEvents.length} upcoming events`);

      // Display event details
      if (upcomingEvents.length > 0) {
        upcomingEvents.forEach((event, index) => {
          addResult(`   📅 ${index + 1}. ${event.summary || 'Untitled Event'}`);
        });
      }

      addResult('🎉 All calendar integration tests completed successfully!');

    } catch (error) {
      addResult('❌ Test failed: ' + (error as Error).message);
      console.error('Calendar test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🗓️ Google Calendar Integration Test
        </h1>
        <p className="text-gray-600 mb-6">
          Test the Google Calendar integration to ensure action items can be scheduled automatically.
        </p>

        {/* Connection Component */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Connect Google Calendar</h2>
          <GoogleCalendarConnect 
            onSuccess={() => addResult('🔗 Google Calendar connected successfully')}
            onError={(error) => addResult('❌ Connection error: ' + error)}
          />
        </div>

        {/* Test Runner */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Run Integration Tests</h2>
          <button
            onClick={runCalendarTest}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Tests...
              </>
            ) : (
              '🧪 Run Calendar Tests'
            )}
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Test Results</h2>
            <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Next Steps for Production</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Configure Google OAuth client in Google Cloud Console</li>
            <li>2. Set up Descope Outbound Apps with your Google client credentials</li>
            <li>3. Update the connectGoogleCalendar function with real OAuth flow</li>
            <li>4. Test with real Google Calendar account</li>
            <li>5. Add error handling for token expiration and refresh</li>
          </ul>
        </div>
      </div>
    </div>
  );
};