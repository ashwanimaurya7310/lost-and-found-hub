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

    const updated = serverDb.updateItem(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('API Error in PATCH /api/items/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = serverDb.deleteItem(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('API Error in DELETE /api/items/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
