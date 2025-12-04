import { NextResponse } from 'next/server';
import { getTable, updateTable } from '@/lib/store';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log('Occupy request for table:', id);
    
    const table = getTable(id);
    console.log('Current table:', table);
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    if (table.status !== 'reserved') {
      console.log('Table status is not reserved:', table.status);
      return NextResponse.json({ error: `Table not reserved. Current status: ${table.status}` }, { status: 400 });
    }
    
    const updated = updateTable(id, {
      status: 'occupied',
      occupiedAt: Date.now(),
    });
    
    console.log('Table updated to occupied:', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Occupy error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
