import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-1'
    const status = searchParams.get('status')

    const whereClause: any = { userId }
    if (status) {
      whereClause.status = status
    }

    const actions = await prisma.action.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        meeting: {
          select: {
            title: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({ actions })

  } catch (error) {
    console.error('Error fetching actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { actionId, status, implementationNotes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (implementationNotes) updateData.implementationNotes = implementationNotes
    if (status === 'completed') updateData.completedAt = new Date()

    const action = await prisma.action.update({
      where: { id: actionId },
      data: updateData
    })

    return NextResponse.json({ action })

  } catch (error) {
    console.error('Error updating action:', error)
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    )
  }
}