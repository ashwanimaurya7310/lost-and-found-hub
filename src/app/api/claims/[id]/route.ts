import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = serverDb.updateClaim(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, claim: updated });
  } catch (error) {
    console.error('API Error in PATCH /api/claims/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to update claim' }, { status: 500 });
  }
}
