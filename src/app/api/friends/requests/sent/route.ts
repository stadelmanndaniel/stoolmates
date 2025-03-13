import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.friend.findMany({
      where: {
        userId: session.user.id,
        status: 'pending',
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

    // Format the response to match the frontend's expected structure
    const formattedRequests = requests.map(request => ({
      id: request.id,
      sender: request.user,
      receiver: request.friend,
      status: request.status.toUpperCase(),
    }));

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sent friend requests' },
      { status: 500 }
    );
  }
} 