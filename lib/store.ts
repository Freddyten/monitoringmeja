// Store untuk data management dengan integrasi API
// Menggabungkan data lokal dengan data dari API eksternal

import { Table, TableStatus, APITable, APITransaction } from './types';
import { fetchTables } from './api/tables';
import { fetchTransactions, getActiveTransactionsForTable } from './api/transactions';

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

// ===== API Integration Functions =====

/**
 * Sync tables from API ke local store
 * Menggabungkan data dari API dengan status lokal
 */
export async function syncTablesFromAPI(): Promise<Table[]> {
  try {
    const apiTables = await fetchTables();
    const apiTransactions = await fetchTransactions();
    
    // Map API tables ke format local Table
    const syncedTables: Table[] = apiTables.map((apiTable) => {
      const tableNumber = parseInt(apiTable.table_number);
      
      // Cari existing local table
      const existingTable = tables.find(t => t.number === tableNumber);
      
      // Cari active transactions untuk table ini
      const tableTransactions = apiTransactions.filter(
        t => t.tables.table_number === apiTable.table_number &&
        ['pending', 'preparing', 'ready'].includes(t.status)
      );
      
      // Tentukan status berdasarkan availability dan transactions
      let status: TableStatus = 'available';
      let customerName: string | undefined;
      let occupiedAt: number | undefined;
      
      if (!apiTable.is_available || tableTransactions.length > 0) {
        status = 'occupied';
        if (tableTransactions.length > 0) {
          const latestTransaction = tableTransactions[0];
          customerName = latestTransaction.customer_name;
          occupiedAt = new Date(latestTransaction.created_at).getTime();
        }
      }
      
      return {
        id: `table-${tableNumber}`,
        number: tableNumber,
        status: existingTable?.status || status,
        capacity: existingTable?.capacity || 4, // Default capacity
        customerName: existingTable?.customerName || customerName,
        occupiedAt: existingTable?.occupiedAt || occupiedAt,
        reservedAt: existingTable?.reservedAt,
        needsCleaningAt: existingTable?.needsCleaningAt,
        cleaningStartedAt: existingTable?.cleaningStartedAt,
      };
    });
    
    // Update tablesInstance
    tablesInstance = syncedTables;
    
    return syncedTables;
  } catch (error) {
    console.error('Error syncing tables from API:', error);
    // Return existing tables jika error
    return tables;
  }
}

/**
 * Get combined data: local table + API transactions
 */
export async function getTableWithTransactions(tableNumber: number): Promise<{
  table: Table | undefined;
  transactions: APITransaction[];
}> {
  try {
    const table = getTableByNumber(tableNumber);
    const transactions = await getActiveTransactionsForTable(tableNumber.toString());
    
    return {
      table,
      transactions,
    };
  } catch (error) {
    console.error('Error getting table with transactions:', error);
    return {
      table: getTableByNumber(tableNumber),
      transactions: [],
    };
  }
}

/**
 * Get all tables with their transactions
 */
export async function getAllTablesWithTransactions(): Promise<Array<{
  table: Table;
  transactions: APITransaction[];
}>> {
  try {
    const allTransactions = await fetchTransactions();
    
    return tables.map(table => {
      const tableTransactions = allTransactions.filter(
        t => t.tables.table_number === table.number.toString() &&
        ['pending', 'preparing', 'ready'].includes(t.status)
      );
      
      return {
        table,
        transactions: tableTransactions,
      };
    });
  } catch (error) {
    console.error('Error getting all tables with transactions:', error);
    return tables.map(table => ({ table, transactions: [] }));
  }
}

