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

    // Get the search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
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

    // Search for users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            // Exclude current user from results
            NOT: { id: currentUser.id },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    // Get existing friend relationships for these users
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: currentUser.id, friendId: { in: users.map(u => u.id) } },
          { friendId: currentUser.id, userId: { in: users.map(u => u.id) } },
        ],
      },
    });

    // Enhance user results with friendship status
    const enhancedUsers = users.map(user => {
      const friendship = friendships.find(f => 
        (f.userId === currentUser.id && f.friendId === user.id) ||
        (f.friendId === currentUser.id && f.userId === user.id)
      );

      return {
        ...user,
        friendshipStatus: friendship ? friendship.status : null,
        friendRequestId: friendship ? friendship.id : null,
      };
    });

    return NextResponse.json({ users: enhancedUsers });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 