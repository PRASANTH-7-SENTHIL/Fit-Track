import { NextResponse } from 'next/server';
import { getDatabaseStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getDatabaseStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('SQL Stats Error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
