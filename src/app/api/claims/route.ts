import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import type { Claim } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const claims = serverDb.getClaims();
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    console.error('API Error in GET /api/claims:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newClaim: Claim = {
      id: body.id || `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId: body.itemId,
      userId: body.userId || 'user-current',
      date: body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'pending',
      message: body.message || '',
    };

    const saved = serverDb.addClaim(newClaim);
    return NextResponse.json({ success: true, claim: saved });
  } catch (error) {
    console.error('API Error in POST /api/claims:', error);
    return NextResponse.json({ success: false, error: 'Failed to create claim' }, { status: 500 });
  }
}
