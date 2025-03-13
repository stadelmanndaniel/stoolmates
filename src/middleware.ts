import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function middleware(request: NextRequest) {
  // Skip middleware for health check endpoint
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.next();
  }

  // Check if database is connected
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 503 }
    );
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.next();
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Database connection error' },
      { status: 503 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
}; 