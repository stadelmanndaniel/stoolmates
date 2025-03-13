import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.error('No session found or missing user email');
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to check in' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('User not found in database:', session.user.email);
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Check if user already has an active check-in
    const activeCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
    });

    if (activeCheckIn) {
      return new NextResponse(
        JSON.stringify({ error: 'You already have an active check-in' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: user.id,
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, checkIn }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Check-in error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create check-in' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 