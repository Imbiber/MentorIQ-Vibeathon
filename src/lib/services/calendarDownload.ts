// Calendar Download Service - Creates .ics files for manual import
export interface ActionItem {
  title?: string;
  name?: string;
  description: string;
  estimatedTime?: number;
  dueDate?: string | Date;
  priority?: 'high' | 'medium' | 'low';
  successProbability?: number;
}

export class CalendarDownloadService {
  // Create .ics file for an action item
  createICSFile(actionItem: ActionItem): string {
    const title = actionItem.title || actionItem.name || 'Action Item';
    const now = new Date();
    const dueDate = actionItem.dueDate ? new Date(actionItem.dueDate) : new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const estimatedMinutes = actionItem.estimatedTime || 60;
    const endTime = new Date(dueDate.getTime() + estimatedMinutes * 60 * 1000);

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
    };

    const startTime = formatDate(dueDate);
    const endTimeFormatted = formatDate(endTime);
    const createdTime = formatDate(now);
    
    // Generate unique ID
    const uid = `mentoriq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@mentoriq.app`;

    const description = this.formatDescription(actionItem);
    
    // Create ICS content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MentorIQ//Calendar Integration//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${createdTime}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTimeFormatted}`,
      `SUMMARY:🎯 ${title}`,
      `DESCRIPTION:${this.escapeICSText(description)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Action item due in 1 hour',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:EMAIL',
      'DESCRIPTION:Reminder: Action item due tomorrow',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  // Download .ics file
  downloadICSFile(actionItem: ActionItem): void {
    const icsContent = this.createICSFile(actionItem);
    const title = actionItem.title || actionItem.name || 'Action Item';
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_action.ics`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Download multiple events as one .ics file
  downloadMultipleEvents(actionItems: ActionItem[]): void {
    const now = new Date();
    const createdTime = this.formatDate(now);
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MentorIQ//Calendar Integration//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    actionItems.forEach((actionItem, index) => {
      const title = actionItem.title || actionItem.name || `Action Item ${index + 1}`;
      const dueDate = actionItem.dueDate ? new Date(actionItem.dueDate) : new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
      const estimatedMinutes = actionItem.estimatedTime || 60;
      const endTime = new Date(dueDate.getTime() + estimatedMinutes * 60 * 1000);

      const startTime = this.formatDate(dueDate);
      const endTimeFormatted = this.formatDate(endTime);
      const uid = `mentoriq-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}@mentoriq.app`;
      const description = this.formatDescription(actionItem);

      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${createdTime}`,
        `DTSTART:${startTime}`,
        `DTEND:${endTimeFormatted}`,
        `SUMMARY:🎯 ${title}`,
        `DESCRIPTION:${this.escapeICSText(description)}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: Action item due in 1 hour',
        'END:VALARM',
        'END:VEVENT'
      ]);
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MentorIQ_Action_Plan.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Helper methods
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
  }

  private formatDescription(actionItem: ActionItem): string {
    const description = actionItem.description || 'Action item from your mentor conversation';
    const estimatedTime = actionItem.estimatedTime || 60;
    const priority = actionItem.priority || 'medium';
    const successRate = actionItem.successProbability ? Math.round(actionItem.successProbability * 100) : 70;

    return `${description}\n\n⏱️ Estimated time: ${estimatedTime} minutes\n📊 Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}\n🎯 Success rate: ${successRate}%\n\n💡 Implementation tips:\n• Block distractions during this time\n• Prepare any needed resources beforehand\n• Set a timer to stay focused\n\n🤖 Created by MentorIQ - Your AI-powered behavior change assistant`;
  }

  private escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  }
}

// Export singleton instance
export const calendarDownloadService = new CalendarDownloadService();