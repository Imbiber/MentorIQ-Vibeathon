import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { transcribeAudio, transcribeWithAssemblyAI } from '@/lib/ai/transcription'
import { extractInsights } from '@/lib/ai/insights'
import { generateActionPlan } from '@/lib/ai/action-plan'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 })
    }

    // Get meeting from database
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    if (meeting.processingStatus !== 'uploaded') {
      return NextResponse.json({ error: 'Meeting already processed or processing' }, { status: 400 })
    }

    // Update status to processing
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { processingStatus: 'processing' }
    })

    try {
      // Step 1: Transcribe audio
      const audioPath = join(process.cwd(), 'public', meeting.audioFileUrl)
      
      // Use real AssemblyAI for production, mock for development
      const useRealTranscription = process.env.NODE_ENV === 'production' || process.env.USE_REAL_TRANSCRIPTION === 'true'
      const transcriptionResult = useRealTranscription 
        ? await transcribeWithAssemblyAI(audioPath)
        : await transcribeAudio(audioPath)

      // Step 2: Extract insights from transcript
      const insights = await extractInsights(transcriptionResult.transcript, {
        meetingType: meeting.meetingType,
        participants: meeting.participants as string[],
        duration: meeting.duration || undefined
      })

      // Step 3: Generate action plan
      const actionPlan = await generateActionPlan(insights, {
        userId: meeting.userId,
        // TODO: Get user profile from database
      })

      // Update meeting with results
      const updatedMeeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          transcript: transcriptionResult.transcript,
          insights: insights as any,
          confidence: insights.confidence,
          processingStatus: 'completed',
          duration: transcriptionResult.duration
        }
      })

      // Create action items in database
      const actions = await Promise.all(
        actionPlan.immediateActions.map(action =>
          prisma.action.create({
            data: {
              meetingId: meetingId,
              userId: meeting.userId,
              title: action.title,
              description: action.description,
              category: action.category,
              priority: action.priority,
              complexity: action.complexity,
              estimatedTime: action.estimatedTime,
              dueDate: action.dueDate,
              successProbability: action.successProbability,
              barriers: action.barriers as any,
              motivationLevel: action.motivationLevel
            }
          })
        )
      )

      return NextResponse.json({
        success: true,
        meeting: updatedMeeting,
        actions: actions,
        insights: insights,
        actionPlan: actionPlan
      })

    } catch (processingError) {
      // Update status to failed
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { processingStatus: 'failed' }
      })

      throw processingError
    }

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process meeting' },
      { status: 500 }
    )
  }
}

// Get processing status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const meetingId = url.searchParams.get('meetingId')

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        actions: true
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: meeting.processingStatus,
      meeting: meeting,
      actions: meeting.actions
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}