// API Route: Proxy untuk Tables API
// GET /api/external/tables

import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'https://pasarlama.raymondbt.my.id/api/tables';

export async function GET() {
  try {
    const response = await fetch(EXTERNAL_API_URL, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from external tables API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tables data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
