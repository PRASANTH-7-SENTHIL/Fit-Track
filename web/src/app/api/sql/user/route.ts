import { NextRequest, NextResponse } from 'next/server';
import { upsertUser, getUser, getUserFullAccountData } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || !body.email) {
      return NextResponse.json({ error: 'User id and email are required.' }, { status: 400 });
    }

    const user = upsertUser({
      id: body.id,
      fullName: body.fullName || body.displayName || 'FitTrack Athlete',
      email: body.email,
      authProvider: body.authProvider || 'password',
      createdAt: body.createdAt,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('SQL User Upsert Error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    const full = searchParams.get('full') === 'true';
    if (full) {
      const fullData = getUserFullAccountData(userId);
      return NextResponse.json({ success: true, data: fullData });
    }

    const user = getUser(userId);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('SQL User Fetch Error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
