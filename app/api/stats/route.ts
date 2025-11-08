import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-1'

    // Fetch user's actions
    const actions = await prisma.action.findMany({
      where: { userId },
      include: { meeting: true }
    })

    // Fetch user's meetings
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalActions = actions.length
    const completedActions = actions.filter(action => action.status === 'completed').length
    const implementationRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

    const highPriorityActions = actions.filter(action => action.priority === 'high').length
    const averageSuccessProbability = actions.length > 0 
      ? actions.reduce((acc, action) => acc + (action.successProbability || 0), 0) / actions.length 
      : 0

    // Recent activity
    const recentMeetings = meetings.slice(0, 3).map(meeting => ({
      id: meeting.id,
      title: meeting.title || 'Professional Development Session',
      date: meeting.createdAt.toISOString().split('T')[0],
      insights: 3, // Mock data
      actions: actions.filter(action => action.meetingId === meeting.id).length,
      status: meeting.processingStatus
    }))

    // Upcoming actions (pending and in_progress)
    const upcomingActions = actions
      .filter(action => action.status === 'pending' || action.status === 'in_progress')
      .slice(0, 5)
      .map(action => ({
        id: action.id,
        title: action.title,
        dueDate: action.dueDate ? action.dueDate.toISOString().split('T')[0] : 'No due date',
        priority: action.priority,
        estimatedTime: action.estimatedTime || 30
      }))

    // Calculate current streak (mock calculation)
    const currentStreak = Math.floor(implementationRate / 3) // Simple calculation for demo

    // Growth patterns
    const patterns = [
      {
        pattern: "Strong in structured implementation",
        description: `You complete ${implementationRate}% of actions when given specific frameworks and timelines`,
        confidence: 0.87
      },
      {
        pattern: "Leadership focus emerging", 
        description: "Your last 3 conversations have centered on leadership development opportunities",
        confidence: 0.92
      }
    ]

    const stats = {
      implementationRate,
      actionsCompleted: completedActions,
      habitsFormed: Math.floor(completedActions / 3), // Mock calculation
      roiIncrease: 240 + (implementationRate * 2), // Mock calculation
      currentStreak,
      totalMeetings: meetings.length,
      averageSuccessProbability: Math.round(averageSuccessProbability * 100),
      highPriorityPending: highPriorityActions
    }

    return NextResponse.json({
      stats,
      recentMeetings,
      upcomingActions,
      patterns
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}