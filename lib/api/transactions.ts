// API Service untuk Transactions
import { APITransaction, APIResponse } from '../types';

// Use internal API routes yang berfungsi sebagai proxy
const API_BASE_URL = '/api/external';

/**
 * Fetch semua transactions dari API
 */
export async function fetchTransactions(): Promise<APITransaction[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      cache: 'no-store', // Disable cache untuk data real-time
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data: APIResponse<APITransaction> = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Fetch transactions berdasarkan table number
 */
export async function fetchTransactionsByTable(tableNumber: string): Promise<APITransaction[]> {
  try {
    const allTransactions = await fetchTransactions();
    return allTransactions.filter(
      (transaction) => transaction.tables.table_number === tableNumber
    );
  } catch (error) {
    console.error('Error fetching transactions by table:', error);
    throw error;
  }
}

/**
 * Fetch transactions berdasarkan status
 */
export async function fetchTransactionsByStatus(status: string): Promise<APITransaction[]> {
  try {
    const allTransactions = await fetchTransactions();
    return allTransactions.filter(
      (transaction) => transaction.status === status
    );
  } catch (error) {
    console.error('Error fetching transactions by status:', error);
    throw error;
  }
}

/**
 * Fetch pending transactions (status: pending)
 */
export async function fetchPendingTransactions(): Promise<APITransaction[]> {
  return fetchTransactionsByStatus('pending');
}

/**
 * Fetch ready transactions (status: ready)
 */
export async function fetchReadyTransactions(): Promise<APITransaction[]> {
  return fetchTransactionsByStatus('ready');
}

/**
 * Fetch completed transactions (status: completed)
 */
export async function fetchCompletedTransactions(): Promise<APITransaction[]> {
  return fetchTransactionsByStatus('completed');
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats() {
  try {
    const transactions = await fetchTransactions();
    
    const stats = {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      preparing: transactions.filter(t => t.status === 'preparing').length,
      ready: transactions.filter(t => t.status === 'ready').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      cancelled: transactions.filter(t => t.status === 'cancelled').length,
      totalRevenue: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.total_amount, 0),
      pendingRevenue: transactions
        .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + t.total_amount, 0),
    };

    return stats;
  } catch (error) {
    console.error('Error calculating transaction stats:', error);
    throw error;
  }
}

/**
 * Get active transactions for a specific table
 * Active = pending, preparing, or ready
 */
export async function getActiveTransactionsForTable(tableNumber: string): Promise<APITransaction[]> {
  try {
    const allTransactions = await fetchTransactions();
    return allTransactions.filter(
      (transaction) => 
        transaction.tables.table_number === tableNumber &&
        ['pending', 'preparing', 'ready'].includes(transaction.status)
    );
  } catch (error) {
    console.error('Error fetching active transactions for table:', error);
    throw error;
  }
}
