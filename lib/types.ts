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
