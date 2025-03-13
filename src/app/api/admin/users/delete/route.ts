import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { usernames } = await request.json();

    if (!Array.isArray(usernames)) {
      return NextResponse.json(
        { error: 'usernames must be an array' },
        { status: 400 }
      );
    }

    // First, find the users
    const users = await prisma.user.findMany({
      where: {
        username: {
          in: usernames
        }
      }
    });

    const userIds = users.map(user => user.id);

    // Delete all friend requests involving these users
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: { in: userIds } },
          { receiverId: { in: userIds } }
        ]
      }
    });

    // Delete all check-ins for these users
    await prisma.checkIn.deleteMany({
      where: {
        userId: {
          in: userIds
        }
      }
    });

    // Finally, delete the users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        username: {
          in: usernames
        }
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedUsers.count,
      message: `Successfully deleted ${deletedUsers.count} users and their associated data`
    });
  } catch (error) {
    console.error('Delete users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 