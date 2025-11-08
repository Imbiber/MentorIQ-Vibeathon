import { NextRequest, NextResponse } from 'next/server';
import { authUtils } from '@/lib/auth/descope';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await authUtils.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { descopeUserId: user.id },
      include: { profile: true }
    });

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          descopeUserId: user.id,
          profile: {
            create: {
              timezone: 'UTC',
              learningStyle: 'visual',
              implementationRate: 0.0,
              enableCalendarSync: true,
              enableNotionSync: false,
              enableSlackReminders: false
            }
          }
        },
        include: { profile: true }
      });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Session error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await authUtils.signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout error' }, { status: 500 });
  }
}