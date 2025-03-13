import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        status: 'error',
        message: 'No session found',
        session: null
      });
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Session and user details retrieved',
      session: {
        ...session,
        user: {
          ...session.user,
          // Remove sensitive information
          password: undefined
        }
      },
      databaseUser: user
    });

  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to retrieve session information',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 