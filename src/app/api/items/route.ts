import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import type { Item } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = serverDb.getItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('API Error in GET /api/items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newItem: Item = {
      id: body.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: body.name || 'Untitled Item',
      description: body.description || '',
      category: body.category || { id: 'other', name: 'Other' },
      status: body.status || 'lost',
      location: body.location || '',
      date: body.date || new Date().toISOString().split('T')[0],
      imageUrl: body.imageUrl || '',
      imageHint: body.imageHint || body.name || '',
      userId: body.userId || 'user-current',
      isPublic: body.isPublic ?? false, // Defaults to FALSE (Private to Admin first)
      moderationStatus: body.moderationStatus || 'pending', // Defaults to PENDING
      createdAt: body.createdAt || Date.now(),
      reporterName: body.reporterName || 'Anonymous Reporter',
      reporterContact: body.reporterContact || '',
    };

    const saved = serverDb.addItem(newItem);
    return NextResponse.json({ success: true, item: saved });
  } catch (error) {
    console.error('API Error in POST /api/items:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}
