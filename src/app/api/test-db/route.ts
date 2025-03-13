import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Try to count users as a simple test
    const count = await prisma.user.count();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 