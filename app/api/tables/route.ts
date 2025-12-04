import { NextResponse } from 'next/server';
import { getAllTables } from '@/lib/store';

export async function GET() {
  const tables = getAllTables();
  return NextResponse.json(tables);
}
