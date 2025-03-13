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

    // Get received friend requests
    const receivedRequests = await prisma.friend.findMany({
      where: {
        friendId: currentUser.id,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Get sent friend requests
    const sentRequests = await prisma.friend.findMany({
      where: {
        userId: currentUser.id,
        status: 'pending',
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Format the response data
    const formattedReceivedRequests = receivedRequests.map(request => ({
      id: request.id,
      sender: request.user,
      receiver: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
      },
      status: request.status,
    }));

    const formattedSentRequests = sentRequests.map(request => ({
      id: request.id,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
      },
      receiver: request.friend,
      status: request.status,
    }));

    return NextResponse.json({
      receivedRequests: formattedReceivedRequests,
      sentRequests: formattedSentRequests,
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
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

    // Check if users are already friends or if a request already exists
    const existingRelation = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            userId: currentUser.id,
            friendId: friendId,
          },
          {
            userId: friendId,
            friendId: currentUser.id,
          },
        ],
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Friend request already exists or users are already friends' },
        { status: 400 }
      );
    }

    // Create friend request
    const friendRequest = await prisma.friend.create({
      data: {
        userId: currentUser.id,
        friendId: friendId,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      friendRequest: {
        id: friendRequest.id,
        sender: friendRequest.user,
        receiver: friendRequest.friend,
        status: friendRequest.status,
      }
    });

  } catch (error) {
    console.error('Create friend request error:', error);
    return NextResponse.json(
      { error: 'Failed to create friend request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 