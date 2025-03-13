import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/kimi';

export async function GET() {
  try {
    const content = await generateContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching sh*itchat content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 