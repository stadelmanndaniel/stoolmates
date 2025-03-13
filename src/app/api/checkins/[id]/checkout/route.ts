import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkIn = await prisma.checkIn.findUnique({
      where: { id: params.id },
    });

    if (!checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
    }

    if (checkIn.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (checkIn.endTime) {
      return NextResponse.json(
        { error: 'Check-in already completed' },
        { status: 400 }
      );
    }

    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - checkIn.startTime.getTime()) / 1000
    );

    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: params.id },
      data: {
        endTime: now,
        duration,
      },
    });

    return NextResponse.json({ checkIn: updatedCheckIn });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 