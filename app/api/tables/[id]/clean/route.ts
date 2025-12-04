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
    
    if (table.status !== 'needs-cleaning') {
      return NextResponse.json({ error: 'Table does not need cleaning' }, { status: 400 });
    }
    
    const updated = updateTable(id, {
      status: 'cleaning',
      cleaningStartedAt: Date.now(),
    });
    
    // Auto complete cleaning setelah 5 menit
    setTimeout(() => {
      updateTable(id, {
        status: 'available',
        reservedAt: undefined,
        occupiedAt: undefined,
        needsCleaningAt: undefined,
        cleaningStartedAt: undefined,
        customerName: undefined,
      });
    }, 5 * 60 * 1000);
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
