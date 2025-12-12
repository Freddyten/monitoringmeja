// API Service untuk Tables
import { APITable, APIResponse } from '../types';

// Use internal API routes yang berfungsi sebagai proxy
const API_BASE_URL = '/api/external';

/**
 * Fetch semua tables dari API
 */
export async function fetchTables(): Promise<APITable[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tables`, {
      cache: 'no-store', // Disable cache untuk data real-time
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.statusText}`);
    }

    const data: APIResponse<APITable> = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
}

/**
 * Fetch tables berdasarkan stand_id
 */
export async function fetchTablesByStand(standId: number): Promise<APITable[]> {
  try {
    const allTables = await fetchTables();
    return allTables.filter((table) => table.stand_id === standId);
  } catch (error) {
    console.error('Error fetching tables by stand:', error);
    throw error;
  }
}

/**
 * Fetch available tables (is_available: true)
 */
export async function fetchAvailableTables(): Promise<APITable[]> {
  try {
    const allTables = await fetchTables();
    return allTables.filter((table) => table.is_available);
  } catch (error) {
    console.error('Error fetching available tables:', error);
    throw error;
  }
}

/**
 * Fetch occupied tables (is_available: false)
 */
export async function fetchOccupiedTables(): Promise<APITable[]> {
  try {
    const allTables = await fetchTables();
    return allTables.filter((table) => !table.is_available);
  } catch (error) {
    console.error('Error fetching occupied tables:', error);
    throw error;
  }
}

/**
 * Fetch table by table number
 */
export async function fetchTableByNumber(tableNumber: string): Promise<APITable | undefined> {
  try {
    const allTables = await fetchTables();
    return allTables.find((table) => table.table_number === tableNumber);
  } catch (error) {
    console.error('Error fetching table by number:', error);
    throw error;
  }
}

/**
 * Get table statistics
 */
export async function getTableStats() {
  try {
    const tables = await fetchTables();
    
    // Group tables by stand
    const tablesByStand = tables.reduce((acc, table) => {
      if (!acc[table.stand_id]) {
        acc[table.stand_id] = [];
      }
      acc[table.stand_id].push(table);
      return acc;
    }, {} as Record<number, APITable[]>);

    const stats = {
      total: tables.length,
      available: tables.filter(t => t.is_available).length,
      occupied: tables.filter(t => !t.is_available).length,
      totalStands: Object.keys(tablesByStand).length,
      tablesByStand: Object.entries(tablesByStand).map(([standId, standTables]) => ({
        standId: Number(standId),
        total: standTables.length,
        available: standTables.filter(t => t.is_available).length,
        occupied: standTables.filter(t => !t.is_available).length,
      })),
    };

    return stats;
  } catch (error) {
    console.error('Error calculating table stats:', error);
    throw error;
  }
}

/**
 * Get unique stand IDs
 */
export async function getStandIds(): Promise<number[]> {
  try {
    const tables = await fetchTables();
    const standIds = [...new Set(tables.map(t => t.stand_id))];
    return standIds.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error getting stand IDs:', error);
    throw error;
  }
}
