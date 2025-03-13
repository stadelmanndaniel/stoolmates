import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Format the response to include only friend details
    const formattedFriends = friends.map(friendship => {
      // If the current user is the 'user', return the 'friend' details
      // Otherwise, return the 'user' details
      const friendDetails = friendship.userId === currentUser.id
        ? friendship.friend
        : friendship.user;

      return {
        id: friendDetails.id,
        username: friendDetails.username,
      };
    });

    return NextResponse.json(formattedFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
} 