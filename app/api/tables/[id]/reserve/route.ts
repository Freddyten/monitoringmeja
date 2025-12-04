import { NextResponse } from 'next/server';
import { getTable, updateTable } from '@/lib/store';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { customerName } = await request.json();
    const table = getTable(id);
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    if (table.status !== 'available') {
      return NextResponse.json({ error: 'Table not available' }, { status: 400 });
    }
    
    const updated = updateTable(id, {
      status: 'reserved',
      reservedAt: Date.now(),
      customerName,
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Reserve error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
