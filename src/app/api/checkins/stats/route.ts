import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get start of today and start of week
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    // Get daily count
    const dailyCount = await prisma.checkIn.count({
      where: {
        userId: session.user.id,
        startTime: {
          gte: startOfToday,
        },
      },
    });

    // Get weekly count
    const weeklyCount = await prisma.checkIn.count({
      where: {
        userId: session.user.id,
        startTime: {
          gte: startOfWeek,
        },
      },
    });

    // Get average duration of completed check-ins
    const completedCheckIns = await prisma.checkIn.findMany({
      where: {
        userId: session.user.id,
        endTime: {
          not: null,
        },
        duration: {
          not: null,
        },
      },
      select: {
        duration: true,
      },
    });

    const averageDuration = completedCheckIns.length > 0
      ? completedCheckIns.reduce((acc, curr) => acc + (curr.duration || 0), 0) / completedCheckIns.length
      : 0;

    // Get recent check-ins
    const recentCheckIns = await prisma.checkIn.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 5,
    });

    return NextResponse.json({
      dailyCount,
      weeklyCount,
      averageDuration,
      recentCheckIns,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 