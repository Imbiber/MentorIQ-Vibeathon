import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-1'

    const meetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        actions: {
          orderBy: { priority: 'desc' }
        }
      }
    })

    return NextResponse.json({ meetings })

  } catch (error) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description } = body

    const meeting = await prisma.meeting.create({
      data: {
        userId: userId || 'demo-user-1',
        title: title || 'New Meeting',
        description,
        originalFileName: 'manual-entry',
        audioFileUrl: '',
        fileSize: 0,
        processingStatus: 'completed'
      }
    })

    return NextResponse.json({ meeting })

  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}