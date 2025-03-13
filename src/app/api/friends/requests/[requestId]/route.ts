import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestId = params.requestId;
    const body = await request.json();
    const { status } = body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
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

    // Find and verify the friend request
    const friendRequest = await prisma.friend.findFirst({
      where: {
        id: requestId,
        OR: [
          { friendId: currentUser.id },
          { userId: currentUser.id }
        ],
        status: 'pending',
      },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found or already processed' },
        { status: 404 }
      );
    }

    // Update the friend request status
    const updatedRequest = await prisma.friend.update({
      where: {
        id: requestId,
      },
      data: {
        status: status.toLowerCase(),
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        friend: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      friendRequest: updatedRequest,
    });

  } catch (error) {
    console.error('Update friend request error:', error);
    return NextResponse.json(
      { error: 'Failed to update friend request' },
      { status: 500 }
    );
  }
} 