// Google Calendar Integration via Descope Tokens

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: false;
    overrides: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export class GoogleCalendarService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createImplementationEvent(actionItem: {
    title: string;
    description: string;
    estimatedTime: number;
    dueDate: Date;
    priority: string;
  }): Promise<string | null> {
    if (!this.accessToken) {
      console.log('Demo mode: Would create calendar event:', actionItem.title);
      return 'demo-event-id';
    }

    try {
      const event: CalendarEvent = {
        summary: `🎯 Implement: ${actionItem.title}`,
        description: `${actionItem.description}\n\n📊 Priority: ${actionItem.priority}\n⏱️ Estimated time: ${actionItem.estimatedTime} minutes\n\n🤖 Created by MentorIQ`,
        start: {
          dateTime: actionItem.dueDate.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: new Date(actionItem.dueDate.getTime() + actionItem.estimatedTime * 60000).toISOString(),
          timeZone: 'America/New_York'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 }
          ]
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;

    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return null;
    }
  }

  async createFocusBlocks(schedule: {
    title: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // "09:00"
    duration: number; // minutes
  }): Promise<string[]> {
    if (!this.accessToken) {
      console.log('Demo mode: Would create focus blocks:', schedule);
      return ['demo-block-1', 'demo-block-2', 'demo-block-3'];
    }

    const eventIds: string[] = [];

    try {
      // Create recurring events for the next 4 weeks
      for (let week = 0; week < 4; week++) {
        for (const dayOfWeek of schedule.daysOfWeek) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + (dayOfWeek - eventDate.getDay() + 7 * week));
          
          const [hours, minutes] = schedule.startTime.split(':').map(Number);
          eventDate.setHours(hours, minutes, 0, 0);

          const endTime = new Date(eventDate.getTime() + schedule.duration * 60000);

          const event: CalendarEvent = {
            summary: `🎯 ${schedule.title}`,
            description: 'Protected focus time for strategic work and implementation.\n\n🚫 No meetings allowed during this time.\n\n🤖 Created by MentorIQ',
            start: {
              dateTime: eventDate.toISOString(),
              timeZone: 'America/New_York'
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'America/New_York'
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 15 }
              ]
            }
          };

          const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });

          if (response.ok) {
            const result = await response.json();
            eventIds.push(result.id);
          }
        }
      }

      return eventIds;

    } catch (error) {
      console.error('Failed to create focus blocks:', error);
      return eventIds;
    }
  }

  async getUpcomingEvents(maxResults: number = 10): Promise<any[]> {
    if (!this.accessToken) {
      // Return mock events for demo
      return [
        {
          id: 'demo-1',
          summary: '🎯 Implement: Set up weekly focus blocks',
          start: { dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
          description: 'Focus time scheduled by MentorIQ'
        }
      ];
    }

    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];

    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }
}