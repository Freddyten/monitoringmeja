import { NextResponse } from 'next/server';
import { getTable, updateTable } from '@/lib/store';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const table = getTable(id);
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    if (table.status !== 'occupied') {
      return NextResponse.json({ error: 'Table not occupied' }, { status: 400 });
    }
    
    const updated = updateTable(id, {
      status: 'needs-cleaning',
      needsCleaningAt: Date.now(),
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
