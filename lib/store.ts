// Simple in-memory store untuk demo
// Untuk production, gunakan database seperti PostgreSQL atau MongoDB

import { Table, TableStatus } from './types';

// Singleton pattern untuk mencegah re-initialization
let tablesInstance: Table[] | null = null;

function initializeTables(): Table[] {
  if (tablesInstance === null) {
    tablesInstance = Array.from({ length: 12 }, (_, i) => ({
      id: `table-${i + 1}`,
      number: i + 1,
      status: 'available' as TableStatus,
      capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
    }));
    
    // Tambahkan dummy data untuk testing (comment jika tidak perlu)
    // Meja 1: Reserved (menuju meja)
    tablesInstance[0].status = 'reserved';
    tablesInstance[0].reservedAt = Date.now() - (2 * 60 * 1000); // 2 menit yang lalu
    tablesInstance[0].customerName = 'John Doe';
    
    // Meja 2: Occupied (sedang makan)
    tablesInstance[1].status = 'occupied';
    tablesInstance[1].occupiedAt = Date.now() - (10 * 60 * 1000); // 10 menit yang lalu
    tablesInstance[1].customerName = 'Jane Smith';
    
    console.log('Tables initialized with test data');
  }
  return tablesInstance;
}

// Initialize dengan 12 meja
export const tables: Table[] = initializeTables();

export function getTable(id: string): Table | undefined {
  return tables.find(t => t.id === id);
}

export function getTableByNumber(number: number): Table | undefined {
  return tables.find(t => t.number === number);
}

export function updateTable(id: string, updates: Partial<Table>): Table | null {
  const table = tables.find(t => t.id === id);
  if (!table) return null;
  
  Object.assign(table, updates);
  return table;
}

export function getAvailableTables(): Table[] {
  return tables.filter(t => t.status === 'available');
}

export function getTablesByStatus(status: TableStatus): Table[] {
  return tables.filter(t => t.status === status);
}

export function getAllTables(): Table[] {
  return tables;
}
