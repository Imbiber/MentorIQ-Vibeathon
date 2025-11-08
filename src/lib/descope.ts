import createWebSdk from '@descope/web-js-sdk'

export const descopeClient = createWebSdk({
  projectId: import.meta.env.VITE_DESCOPE_PROJECT_ID || 'P3223qYZVJLHP1BYlfXDuKaDtjSk'
})

// Google Calendar integration constants
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

// Outbound Apps configuration
export const OUTBOUND_APPS = {
  GOOGLE_CALENDAR: 'google-calendar-app' // This will be configured in Descope console
}

export interface CalendarEvent {
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  colorId?: string
  attendees?: Array<{ email: string }>
}

export class DescopeCalendarService {
  private accessToken: string | null = null

  async connectGoogleCalendar(userId: string) {
    try {
      console.log('🔗 Connecting to Google Calendar via Descope...')
      
      const response = await descopeClient.outbound.connect(OUTBOUND_APPS.GOOGLE_CALENDAR, {
        redirectURL: `${window.location.origin}/calendar-connected`,
        userId
      })

      console.log('✅ Google Calendar connected successfully')
      return response
    } catch (error) {
      console.error('❌ Failed to connect Google Calendar:', error)
      throw error
    }
  }

  async getAccessToken(userId: string): Promise<string> {
    try {
      const tokenInfo = await descopeClient.outbound.getToken(OUTBOUND_APPS.GOOGLE_CALENDAR, userId)
      this.accessToken = tokenInfo.accessToken
      return tokenInfo.accessToken
    } catch (error) {
      console.error('❌ Failed to get access token:', error)
      throw error
    }
  }

  async createCalendarEvent(event: CalendarEvent, userId: string): Promise<any> {
    try {
      if (!this.accessToken) {
        await this.getAccessToken(userId)
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const createdEvent = await response.json()
      console.log('✅ Calendar event created:', createdEvent.htmlLink)
      return createdEvent
    } catch (error) {
      console.error('❌ Failed to create calendar event:', error)
      throw error
    }
  }

  async scheduleActionItems(actionItems: any[], userId: string) {
    const results = []
    
    for (const action of actionItems) {
      try {
        // Calculate event time based on due date and estimated duration
        const dueDate = new Date(action.dueDate)
        const duration = action.estimatedTime || 60 // Default 1 hour
        
        // Schedule 2 days before due date
        const scheduledDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000)
        scheduledDate.setHours(10, 0, 0, 0) // 10 AM by default

        const endDate = new Date(scheduledDate.getTime() + duration * 60 * 1000)

        const calendarEvent: CalendarEvent = {
          summary: `🎯 ${action.title}`,
          description: `MentorIQ Action Item\n\n${action.description}\n\nPriority: ${action.priority}\nEstimated Time: ${duration} minutes\nSuccess Rate: ${action.successProbability * 100}%\n\nGenerated from your mentor conversation analysis.`,
          start: {
            dateTime: scheduledDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          colorId: action.priority === 'high' ? '11' : action.priority === 'medium' ? '5' : '2' // Red for high, yellow for medium, green for low
        }

        const createdEvent = await this.createCalendarEvent(calendarEvent, userId)
        results.push({ action: action.title, event: createdEvent })
        
        // Add a small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Failed to schedule action: ${action.title}`, error)
        results.push({ action: action.title, error: error.message })
      }
    }

    return results
  }
}

export const calendarService = new DescopeCalendarService()