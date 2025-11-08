import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@mentoriq.com' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'demo@mentoriq.com',
      name: 'Demo User',
      descopeUserId: 'demo-descope-id',
      profile: {
        create: {
          implementationRate: 0.73,
          optimalActionComplexity: 'medium',
          procrastinationTendency: 0.3
        }
      }
    }
  })

  // Create demo meetings
  const meeting1 = await prisma.meeting.upsert({
    where: { id: 'demo-meeting-1' },
    update: {},
    create: {
      id: 'demo-meeting-1',
      userId: user.id,
      title: 'Leadership Development Session',
      description: 'Quarterly mentoring discussion on leadership growth',
      originalFileName: 'leadership-session.mp3',
      audioFileUrl: '/demo/leadership-session.mp3',
      fileSize: 5242880,
      processingStatus: 'completed',
      transcript: 'Demo transcript content...',
      insights: {
        summary: 'Leadership development conversation focusing on delegation and team communication',
        keyThemes: ['Leadership', 'Delegation', 'Communication', 'Team Management'],
        emotionalTone: 'Collaborative and Growth-Focused',
        confidence: 0.89
      },
      confidence: 0.89
    }
  })

  const meeting2 = await prisma.meeting.upsert({
    where: { id: 'demo-meeting-2' },
    update: {},
    create: {
      id: 'demo-meeting-2',
      userId: user.id,
      title: 'Career Strategy Discussion',
      description: 'Planning next career moves and skill development',
      originalFileName: 'career-strategy.mp3',
      audioFileUrl: '/demo/career-strategy.mp3',
      fileSize: 3145728,
      processingStatus: 'completed',
      transcript: 'Demo career strategy transcript...',
      insights: {
        summary: 'Strategic career planning with focus on skill development and networking',
        keyThemes: ['Career Planning', 'Skill Development', 'Networking', 'Strategic Thinking'],
        emotionalTone: 'Ambitious and Forward-Thinking',
        confidence: 0.92
      },
      confidence: 0.92
    }
  })

  // Create demo actions
  const actions = [
    {
      meetingId: meeting1.id,
      userId: user.id,
      title: 'Implement weekly team check-ins',
      description: 'Schedule recurring 30-minute sessions with each team member to improve communication and provide regular feedback',
      category: 'leadership',
      priority: 'high',
      complexity: 'medium',
      estimatedTime: 45,
      successProbability: 0.85,
      status: 'completed'
    },
    {
      meetingId: meeting1.id,
      userId: user.id,
      title: 'Practice active listening techniques',
      description: 'Apply the LISTEN framework in next three team meetings',
      category: 'communication',
      priority: 'high',
      complexity: 'medium',
      estimatedTime: 30,
      successProbability: 0.78,
      status: 'in_progress'
    },
    {
      meetingId: meeting2.id,
      userId: user.id,
      title: 'Research industry conferences',
      description: 'Identify 3 relevant conferences for networking and skill development',
      category: 'networking',
      priority: 'medium',
      complexity: 'low',
      estimatedTime: 60,
      successProbability: 0.90,
      status: 'pending'
    },
    {
      meetingId: meeting2.id,
      userId: user.id,
      title: 'Complete strategic thinking course',
      description: 'Enroll in and complete online course on strategic business thinking',
      category: 'skills',
      priority: 'medium',
      complexity: 'high',
      estimatedTime: 300,
      successProbability: 0.75,
      status: 'pending'
    }
  ]

  for (const action of actions) {
    await prisma.action.create({
      data: action
    })
  }

  // Create user patterns
  const patterns = [
    {
      userId: user.id,
      patternType: 'implementation_style',
      description: 'Strong implementation when given structured frameworks',
      confidence: 0.87,
      metadata: {
        framework_preference: 'high',
        structure_importance: 0.9
      },
      frequency: 5
    },
    {
      userId: user.id,
      patternType: 'success_factor',
      description: 'Higher success rate with leadership-focused actions',
      confidence: 0.92,
      metadata: {
        category_preference: 'leadership',
        success_correlation: 0.85
      },
      frequency: 3
    }
  ]

  for (const pattern of patterns) {
    await prisma.userPattern.create({
      data: pattern
    })
  }

  console.log('Database initialized')
}

main()
  .catch((e) => {
    process.exit(1)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })