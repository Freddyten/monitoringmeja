// Tipe data untuk aplikasi monitoring meja

export type TableStatus = 
  | 'available'      // Meja kosong dan bersih
  | 'reserved'       // Meja sudah dipilih, customer dalam perjalanan (10 menit)
  | 'occupied'       // Customer sudah di meja dan makan (30 menit)
  | 'needs-cleaning' // Customer selesai, meja perlu dibersihkan
  | 'cleaning';      // Meja sedang dibersihkan

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  reservedAt?: number;
  occupiedAt?: number;
  needsCleaningAt?: number;
  cleaningStartedAt?: number;
  customerName?: string;
}

export interface TimerInfo {
  tableId: string;
  type: 'reservation' | 'dining';
  startTime: number;
  duration: number; // dalam menit
  endTime: number;
}

// ===== API Types =====

// API Table dari endpoint https://pasarlama.raymondbt.my.id/api/tables
export interface APITable {
  id: number;
  stand_id: number;
  table_number: string;
  table_name: string;
  is_available: boolean;
  created_at: string;
}

// API Transaction dari endpoint https://pasarlama.raymondbt.my.id/api/transactions
export type TransactionStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'qris' | 'transfer';
export type PaymentStatus = 'paid' | 'unpaid';

export interface APITransaction {
  id: string;
  stand_id: number;
  customer_name: string;
  status: TransactionStatus;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  prepared_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  tables: {
    table_number: string;
  };
}

// API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  timestamp: string;
}

// Extended Table interface dengan informasi dari API
export interface ExtendedTable extends Table {
  standId?: number;
  apiId?: number;
  isAvailable?: boolean;
  transactions?: APITransaction[];
}
