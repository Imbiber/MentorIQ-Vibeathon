#!/usr/bin/env node

/**
 * Manual test script for Google Calendar integration
 * Run this to verify the calendar service works correctly
 */

const { GoogleCalendarService } = require('../lib/integrations/google-calendar.ts');

async function testCalendarIntegration() {
  console.log('🗓️  Testing Google Calendar Integration\n');

  try {
    // Initialize service (will use demo mode without token)
    console.log('1. Initializing Google Calendar service...');
    const calendarService = new GoogleCalendarService('');
    console.log('✅ Service initialized (demo mode)\n');

    // Test 1: Create implementation event
    console.log('2. Testing implementation event creation...');
    const testAction = {
      title: 'Review quarterly goals',
      description: 'Deep dive into Q4 objectives and update progress tracking.',
      estimatedTime: 60,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: 'high'
    };

    const eventId = await calendarService.createImplementationEvent(testAction);
    console.log(`✅ Implementation event created: ${eventId}\n`);

    // Test 2: Create focus blocks
    console.log('3. Testing focus block creation...');
    const focusSchedule = {
      title: 'Strategic Planning',
      daysOfWeek: [2, 4], // Tuesday, Thursday
      startTime: '10:00',
      duration: 120 // 2 hours
    };

    const focusEvents = await calendarService.createFocusBlocks(focusSchedule);
    console.log(`✅ Created ${focusEvents.length} focus blocks\n`);

    // Test 3: Get upcoming events
    console.log('4. Testing upcoming events retrieval...');
    const upcomingEvents = await calendarService.getUpcomingEvents(3);
    console.log(`✅ Retrieved ${upcomingEvents.length} upcoming events`);
    
    upcomingEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.summary}`);
      if (event.start?.dateTime) {
        console.log(`      📅 ${new Date(event.start.dateTime).toLocaleString()}`);
      }
    });

    console.log('\n🎉 All calendar tests passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up Google OAuth credentials');
    console.log('   2. Configure Descope Outbound Apps');
    console.log('   3. Test with real Google Calendar account');
    console.log('   4. Visit /test/calendar in your app to run browser tests');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure all dependencies are installed: npm install');
    console.error('   2. Check that TypeScript files are compiled');
    console.error('   3. Verify environment variables are set');
  }
}

// Handle both direct execution and module import
if (require.main === module) {
  testCalendarIntegration();
}

module.exports = { testCalendarIntegration };