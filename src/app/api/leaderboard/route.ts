import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the timeframe from query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'daily';

    // Calculate the start date based on timeframe
    const startDate = new Date();
    if (timeframe === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Weekly
      startDate.setDate(startDate.getDate() - 7);
    }

    // Get all accepted friends
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: currentUser.id, status: 'accepted' },
          { friendId: currentUser.id, status: 'accepted' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Create array of friend IDs including current user
    const friendIds = [
      currentUser.id,
      ...friends.map(f => 
        f.userId === currentUser.id ? f.friendId : f.userId
      ),
    ];

    // Get check-ins for friends and current user
    const checkIns = await prisma.checkIn.groupBy({
      by: ['userId'],
      where: {
        userId: {
          in: friendIds,
        },
        startTime: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get user details for all users with check-ins
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Combine check-in counts with user details
    const leaderboard = users.map(user => {
      const userCheckIns = checkIns.find(c => c.userId === user.id);
      return {
        id: user.id,
        username: user.username,
        checkInCount: userCheckIns?._count.id || 0,
        isCurrentUser: user.id === currentUser.id,
      };
    });

    // Sort by check-in count (descending)
    leaderboard.sort((a, b) => b.checkInCount - a.checkInCount);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 