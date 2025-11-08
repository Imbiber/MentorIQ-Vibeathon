// Integration Coordinator - Orchestrates all external integrations

import { GoogleCalendarService } from './google-calendar';
import { NotionService } from './notion';
import { SlackService } from './slack';
import { authUtils } from '../auth/descope';

export class IntegrationCoordinator {
  private calendarService?: GoogleCalendarService;
  private notionService?: NotionService;
  private slackService?: SlackService;

  constructor(private userId: string) {}

  async initialize(): Promise<void> {
    try {
      // Get integration tokens from Descope
      const tokens = await authUtils.getIntegrationTokens(this.userId);

      // Initialize services with available tokens
      if (tokens.google) {
        this.calendarService = new GoogleCalendarService(tokens.google);
      }
      
      if (tokens.notion) {
        this.notionService = new NotionService(tokens.notion);
      }
      
      if (tokens.slack) {
        this.slackService = new SlackService(tokens.slack);
      }

      // For demo mode, create services without tokens
      this.calendarService = new GoogleCalendarService('');
      this.notionService = new NotionService('');
      this.slackService = new SlackService('');

    } catch (error) {
      console.error('Failed to initialize integrations:', error);
    }
  }

  async processNewMeeting(meetingData: {
    id: string;
    title: string;
    date: string;
    insights: any;
    actions: any[];
    transcript?: string;
  }): Promise<{
    calendarEvents: string[];
    notionPageId: string | null;
    slackNotificationSent: boolean;
  }> {
    const results = {
      calendarEvents: [] as string[],
      notionPageId: null as string | null,
      slackNotificationSent: false
    };

    try {
      // Create calendar events for each action item
      if (this.calendarService) {
        for (const action of meetingData.actions) {
          const eventId = await this.calendarService.createImplementationEvent({
            title: action.title,
            description: action.description,
            estimatedTime: action.estimatedTime || 30,
            dueDate: action.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
            priority: action.priority || 'medium'
          });
          
          if (eventId) {
            results.calendarEvents.push(eventId);
          }
        }
      }

      // Create Notion page with insights and actions
      if (this.notionService) {
        results.notionPageId = await this.notionService.createMeetingInsightsPage(meetingData);
      }

      // Send Slack notification about new insights
      if (this.slackService && meetingData.actions.length > 0) {
        const topAction = meetingData.actions[0];
        results.slackNotificationSent = await this.slackService.sendImplementationReminder(
          this.userId, 
          topAction
        );
      }

    } catch (error) {
      console.error('Error processing meeting integrations:', error);
    }

    return results;
  }

  async createFocusTimeBlocks(schedule: {
    title: string;
    daysOfWeek: number[];
    startTime: string;
    duration: number;
  }): Promise<string[]> {
    if (!this.calendarService) {
      return [];
    }

    try {
      return await this.calendarService.createFocusBlocks(schedule);
    } catch (error) {
      console.error('Error creating focus blocks:', error);
      return [];
    }
  }

  async sendWeeklyProgressUpdate(progressData: {
    implementationRate: number;
    actionsCompleted: number;
    currentStreak: number;
    topPatterns: string[];
    upcomingActions: any[];
  }): Promise<boolean> {
    if (!this.slackService) {
      return false;
    }

    try {
      return await this.slackService.sendWeeklyProgressSummary(this.userId, progressData);
    } catch (error) {
      console.error('Error sending weekly update:', error);
      return false;
    }
  }

  async trackActionCompletion(actionId: string, completed: boolean): Promise<{
    calendarUpdated: boolean;
    notionUpdated: boolean;
    slackNotified: boolean;
  }> {
    const results = {
      calendarUpdated: false,
      notionUpdated: false,
      slackNotified: false
    };

    try {
      // Update Notion page
      if (this.notionService) {
        // In a real implementation, we'd need to track which Notion page contains this action
        results.notionUpdated = await this.notionService.updateActionStatus(
          'page-id', 
          actionId, 
          completed
        );
      }

      // Send motivational message if completed
      if (completed && this.slackService) {
        results.slackNotified = await this.slackService.sendMotivationalMessage(
          this.userId,
          {
            type: 'goal_achieved',
            message: '🎉 Great job completing that action! You\'re building momentum.',
            data: { actionId }
          }
        );
      }

    } catch (error) {
      console.error('Error tracking action completion:', error);
    }

    return results;
  }

  async getIntegrationStatus(): Promise<{
    calendar: boolean;
    notion: boolean;
    slack: boolean;
  }> {
    return {
      calendar: !!this.calendarService,
      notion: !!this.notionService,
      slack: !!this.slackService
    };
  }

  async setupAutomatedWorkflows(): Promise<void> {
    // Setup automated workflows like:
    // - Weekly progress summaries
    // - Reminder scheduling
    // - Pattern detection notifications
    // - Streak milestone celebrations
    
    console.log('Setting up automated workflows for user:', this.userId);
    
    // For demo purposes, just log what would be set up
    console.log('Would setup:');
    console.log('- Daily action reminders at 9 AM');
    console.log('- Weekly progress summary on Fridays');
    console.log('- Monthly pattern analysis reports');
    console.log('- Streak milestone celebrations');
  }
}

// Factory function to create and initialize coordinator
export async function createIntegrationCoordinator(userId: string): Promise<IntegrationCoordinator> {
  const coordinator = new IntegrationCoordinator(userId);
  await coordinator.initialize();
  return coordinator;
}