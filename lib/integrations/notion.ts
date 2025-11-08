// Notion Integration via Descope Tokens

export class NotionService {
  private accessToken: string;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createMeetingInsightsPage(meetingData: {
    title: string;
    date: string;
    insights: any;
    actions: any[];
    transcript?: string;
  }): Promise<string | null> {
    if (!this.accessToken) {
      console.log('Demo mode: Would create Notion page:', meetingData.title);
      return 'demo-notion-page-id';
    }

    try {
      // First, find or create a database for meeting insights
      const databaseId = await this.getOrCreateMeetingDatabase();
      
      if (!databaseId) {
        throw new Error('Failed to get database ID');
      }

      const pageContent = {
        parent: { database_id: databaseId },
        properties: {
          'Meeting': {
            title: [{ text: { content: meetingData.title } }]
          },
          'Date': {
            date: { start: meetingData.date }
          },
          'Insights Count': {
            number: meetingData.insights.adviceGiven?.length || 0
          },
          'Actions Count': {
            number: meetingData.actions.length
          },
          'Confidence Score': {
            number: meetingData.insights.confidence || 0
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: '🧠 Key Insights' } }]
            }
          },
          ...this.createInsightsBlocks(meetingData.insights),
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: '🎯 Action Items' } }]
            }
          },
          ...this.createActionsBlocks(meetingData.actions)
        ]
      };

      const response = await fetch(`${this.baseUrl}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify(pageContent)
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;

    } catch (error) {
      console.error('Failed to create Notion page:', error);
      return null;
    }
  }

  private async getOrCreateMeetingDatabase(): Promise<string | null> {
    // In a real implementation, this would search for existing database
    // or create a new one. For demo purposes, we'll use a placeholder ID
    return 'demo-database-id';
  }

  private createInsightsBlocks(insights: any): any[] {
    const blocks: any[] = [];

    if (insights.adviceGiven && insights.adviceGiven.length > 0) {
      insights.adviceGiven.forEach((advice: any, index: number) => {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [
              {
                text: { 
                  content: `${advice.title}`,
                  link: null
                },
                annotations: { bold: true }
              },
              {
                text: { content: `\n${advice.description}` }
              },
              {
                text: { 
                  content: `\n💬 "${advice.quote}"`,
                  link: null
                },
                annotations: { italic: true }
              }
            ]
          }
        });
      });
    }

    return blocks;
  }

  private createActionsBlocks(actions: any[]): any[] {
    const blocks: any[] = [];

    actions.forEach((action: any) => {
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [
            {
              text: { 
                content: action.title,
                link: null
              },
              annotations: { bold: true }
            },
            {
              text: { content: `\n${action.description}` }
            },
            {
              text: { 
                content: `\n⏱️ ~${action.estimatedTime}min | 📈 ${Math.round((action.successProbability || 0) * 100)}% success rate`
              }
            }
          ],
          checked: false
        }
      });
    });

    return blocks;
  }

  async updateActionStatus(pageId: string, actionId: string, completed: boolean): Promise<boolean> {
    if (!this.accessToken) {
      console.log('Demo mode: Would update action status:', { pageId, actionId, completed });
      return true;
    }

    try {
      // In a real implementation, this would find and update the specific action block
      // For demo purposes, we'll just log the action
      console.log(`Updating action ${actionId} in page ${pageId} to ${completed ? 'completed' : 'pending'}`);
      return true;
    } catch (error) {
      console.error('Failed to update action status:', error);
      return false;
    }
  }

  async createProgressTrackingPage(userId: string, progressData: {
    weeklyStats: any;
    patterns: any[];
    goals: any[];
  }): Promise<string | null> {
    if (!this.accessToken) {
      console.log('Demo mode: Would create progress tracking page for user:', userId);
      return 'demo-progress-page-id';
    }

    // Implementation would create a comprehensive progress tracking page
    // with charts, statistics, and pattern analysis
    return 'progress-page-id';
  }
}