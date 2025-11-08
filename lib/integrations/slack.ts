// Slack Integration via Descope Tokens

export class SlackService {
  private accessToken: string;
  private baseUrl = 'https://slack.com/api';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async sendImplementationReminder(userId: string, action: {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    estimatedTime: number;
  }): Promise<boolean> {
    if (!this.accessToken) {
      console.log('Demo mode: Would send Slack reminder:', action.title);
      return true;
    }

    try {
      const message = {
        channel: await this.getUserDMChannel(userId),
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🎯 *Time to implement: ${action.title}*\n\n${action.description}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*⏰ Due:*\n${action.dueDate.toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*⏱️ Estimated Time:*\n~${action.estimatedTime} minutes`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '✅ Mark Complete'
                },
                style: 'primary',
                action_id: `complete_action_${action.id}`
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '⏰ Remind Later'
                },
                action_id: `remind_later_${action.id}`
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🔗 Open Dashboard'
                },
                action_id: 'open_dashboard',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      return result.ok;

    } catch (error) {
      console.error('Failed to send Slack reminder:', error);
      return false;
    }
  }

  async sendWeeklyProgressSummary(userId: string, progressData: {
    implementationRate: number;
    actionsCompleted: number;
    currentStreak: number;
    topPatterns: string[];
    upcomingActions: any[];
  }): Promise<boolean> {
    if (!this.accessToken) {
      console.log('Demo mode: Would send weekly progress summary to user:', userId);
      return true;
    }

    try {
      const message = {
        channel: await this.getUserDMChannel(userId),
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📊 Your Weekly Progress Summary'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*🎯 Implementation Rate:*\n${progressData.implementationRate}%`
              },
              {
                type: 'mrkdwn',
                text: `*✅ Actions Completed:*\n${progressData.actionsCompleted}`
              },
              {
                type: 'mrkdwn',
                text: `*🔥 Current Streak:*\n${progressData.currentStreak} days`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🧠 Top Patterns This Week:*\n${progressData.topPatterns.map(p => `• ${p}`).join('\n')}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🎯 Coming Up:*\n${progressData.upcomingActions.slice(0, 3).map(a => `• ${a.title}`).join('\n')}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '📱 Open Dashboard'
                },
                style: 'primary',
                action_id: 'open_dashboard',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🎤 Process New Meeting'
                },
                action_id: 'process_meeting',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/upload`
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      return result.ok;

    } catch (error) {
      console.error('Failed to send weekly summary:', error);
      return false;
    }
  }

  async sendMotivationalMessage(userId: string, context: {
    type: 'streak_milestone' | 'goal_achieved' | 'pattern_detected';
    message: string;
    data?: any;
  }): Promise<boolean> {
    if (!this.accessToken) {
      console.log('Demo mode: Would send motivational message:', context.message);
      return true;
    }

    try {
      const emoji = context.type === 'streak_milestone' ? '🔥' : 
                   context.type === 'goal_achieved' ? '🎉' : '💡';

      const message = {
        channel: await this.getUserDMChannel(userId),
        text: `${emoji} ${context.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} ${context.message}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '📊 View Progress'
                },
                action_id: 'view_progress',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      return result.ok;

    } catch (error) {
      console.error('Failed to send motivational message:', error);
      return false;
    }
  }

  private async getUserDMChannel(userId: string): Promise<string> {
    if (!this.accessToken) {
      return 'demo-channel-id';
    }

    try {
      const response = await fetch(`${this.baseUrl}/conversations.open`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ users: userId })
      });

      const result = await response.json();
      return result.channel?.id || 'fallback-channel-id';
    } catch (error) {
      console.error('Failed to get DM channel:', error);
      return 'fallback-channel-id';
    }
  }

  async scheduleReminder(userId: string, actionId: string, reminderTime: Date): Promise<string | null> {
    if (!this.accessToken) {
      console.log('Demo mode: Would schedule reminder for action:', actionId, 'at', reminderTime);
      return 'demo-scheduled-message-id';
    }

    // Implementation would use Slack's scheduled messages API
    // or integrate with a job scheduler
    return 'scheduled-message-id';
  }
}