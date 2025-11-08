// Production Google Calendar Service
import { simpleGoogleAuthService } from './googleAuth-simple';

export interface CalendarEvent {
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
      method: 'popup' | 'email';
      minutes: number;
    }>;
  };
  colorId?: string;
}

export interface ActionItem {
  title?: string;
  name?: string;
  description: string;
  estimatedTime?: number;
  dueDate?: string | Date;
  priority?: 'high' | 'medium' | 'low';
  successProbability?: number;
}

export class GoogleCalendarService {
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  // Create a calendar event for an action item
  async createActionEvent(actionItem: ActionItem): Promise<{
    success: boolean;
    eventId?: string;
    htmlLink?: string;
    error?: string;
  }> {
    const accessToken = simpleGoogleAuthService.getAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated. Please connect Google Calendar first.' };
    }

    try {
      const title = actionItem.title || actionItem.name || 'Action Item';
      const now = new Date();
      const dueDate = actionItem.dueDate ? new Date(actionItem.dueDate) : new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const estimatedMinutes = actionItem.estimatedTime || 60;
      const endTime = new Date(dueDate.getTime() + estimatedMinutes * 60 * 1000);

      // Get user's timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const event: CalendarEvent = {
        summary: `🎯 ${title}`,
        description: this.formatDescription(actionItem),
        start: {
          dateTime: dueDate.toISOString(),
          timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 24 * 60 }
          ]
        },
        colorId: this.getPriorityColor(actionItem.priority)
      };

      const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      
      return {
        success: true,
        eventId: createdEvent.id,
        htmlLink: createdEvent.htmlLink
      };

    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Create multiple events for action items
  async createMultipleEvents(actionItems: ActionItem[]): Promise<{
    success: boolean;
    results: Array<{
      actionTitle: string;
      success: boolean;
      eventId?: string;
      htmlLink?: string;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const results = [];
    
    for (const actionItem of actionItems) {
      const title = actionItem.title || actionItem.name || 'Action Item';
      const result = await this.createActionEvent(actionItem);
      
      results.push({
        actionTitle: title,
        success: result.success,
        eventId: result.eventId,
        htmlLink: result.htmlLink,
        error: result.error
      });

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return {
      success: successful > 0,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  }

  // Create focus blocks in calendar
  async createFocusBlocks(schedule: {
    title: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // "09:00"
    duration: number; // minutes
    weeks: number; // how many weeks to create
  }): Promise<{
    success: boolean;
    eventsCreated: number;
    error?: string;
  }> {
    const accessToken = simpleGoogleAuthService.getAccessToken();
    if (!accessToken) {
      return { success: false, eventsCreated: 0, error: 'Not authenticated' };
    }

    try {
      let eventsCreated = 0;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      for (let week = 0; week < schedule.weeks; week++) {
        for (const dayOfWeek of schedule.daysOfWeek) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + (dayOfWeek - eventDate.getDay() + 7 * week));
          
          const [hours, minutes] = schedule.startTime.split(':').map(Number);
          eventDate.setHours(hours, minutes, 0, 0);

          const endTime = new Date(eventDate.getTime() + schedule.duration * 60 * 1000);

          const event: CalendarEvent = {
            summary: `🧠 ${schedule.title}`,
            description: 'Protected focus time for strategic work and implementation.\n\n🚫 No meetings during this time.\n\n🤖 Created by MentorIQ',
            start: {
              dateTime: eventDate.toISOString(),
              timeZone
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 15 }
              ]
            },
            colorId: '10' // Green for focus blocks
          };

          const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });

          if (response.ok) {
            eventsCreated++;
          }

          // Delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return {
        success: eventsCreated > 0,
        eventsCreated
      };

    } catch (error) {
      console.error('Failed to create focus blocks:', error);
      return {
        success: false,
        eventsCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get upcoming events
  async getUpcomingEvents(maxResults: number = 10): Promise<any[]> {
    const accessToken = simpleGoogleAuthService.getAccessToken();
    if (!accessToken) return [];

    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(
        `${this.baseUrl}/calendars/primary/events?timeMin=${timeMin}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.items || [];

    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

  // Private helper methods
  private formatDescription(actionItem: ActionItem): string {
    const description = actionItem.description || 'Action item from your mentor conversation';
    const estimatedTime = actionItem.estimatedTime || 60;
    const priority = actionItem.priority || 'medium';
    const successRate = actionItem.successProbability ? Math.round(actionItem.successProbability * 100) : 70;

    return `${description}

⏱️ Estimated time: ${estimatedTime} minutes
📊 Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}
🎯 Success rate: ${successRate}%

💡 Implementation tips:
• Block distractions during this time
• Prepare any needed resources beforehand
• Set a timer to stay focused

🤖 Created by MentorIQ - Your AI-powered behavior change assistant`;
  }

  private getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high': return '11'; // Red
      case 'medium': return '5'; // Yellow
      case 'low': return '10'; // Green
      default: return '1'; // Blue
    }
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();