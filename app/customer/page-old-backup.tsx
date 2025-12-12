'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, APITransaction, TransactionStatus } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Users,
  Utensils,
  Clock,
  CheckCircle2,
  Ban,
  Hourglass,
  ArrowLeft,
  BellRing,
  Armchair,
  User,
  Loader2,
  MapPin,
  ShoppingCart,
  CreditCard,
  Package
} from "lucide-react";

// Import API functions
import { fetchTables } from '@/lib/api/tables';
import { fetchTransactions, getActiveTransactionsForTable } from '@/lib/api/transactions';

interface TableWithTransactions extends Table {
  transactions: APITransaction[];
}

export default function CustomerPage() {
  const [tables, setTables] = useState<TableWithTransactions[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithTransactions | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [apiTables, allTransactions] = await Promise.all([
        fetchTables(),
        fetchTransactions(),
      ]);

      // Convert API tables dengan transactions
      const tablesWithTransactions: TableWithTransactions[] = apiTables.map((apiTable) => {
        const tableNumber = parseInt(apiTable.table_number);
        
        // Filter active transactions untuk table ini
        const tableTransactions = allTransactions.filter(
          t => t.tables.table_number === apiTable.table_number &&
          ['pending', 'preparing', 'ready'].includes(t.status)
        );
        
        let status: Table['status'] = 'available';
        let customerName: string | undefined;
        let occupiedAt: number | undefined;
        
        if (tableTransactions.length > 0) {
          const latestTransaction = tableTransactions[0];
          status = latestTransaction.status === 'ready' ? 'reserved' : 'occupied';
          customerName = latestTransaction.customer_name;
          occupiedAt = new Date(latestTransaction.created_at).getTime();
        } else if (!apiTable.is_available) {
          status = 'occupied';
        }
        
        return {
          id: `table-${tableNumber}`,
          number: tableNumber,
          status,
          capacity: 4,
          customerName,
          occupiedAt,
          transactions: tableTransactions,
        };
      });

      setTables(tablesWithTransactions);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data dari API');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update setiap 5 detik
    return () => clearInterval(interval);
  }, []);
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
        <Card className="w-full max-w-sm shadow-xl border-primary/10 overflow-hidden">
          <div className="bg-primary/5 p-6 flex flex-col items-center justify-center space-y-4 border-b border-primary/10">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-sm">
              <Utensils className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Selamat Datang!</h2>
              <p className="text-sm text-muted-foreground">Meja #{selectedTable.number}</p>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-base font-medium">Hai, {customerName}</p>
              <p className="text-sm text-muted-foreground">
                Silakan lihat menu yang tersedia. Klik tombol di bawah jika Anda sudah siap untuk memesan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 py-2 px-4 rounded-lg border border-amber-100">
              <Clock className="h-3.5 w-3.5" />
              <span>Waktu makan 30 menit dimulai setelah pesan</span>
            </div>

            <Button
              onClick={handleStartOrder}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <BellRing className="mr-2 h-4 w-4" />
              Mulai Pesan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      {/* Top Header Decoration */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">Pasar Lama</h1>
          </div>
          <div className="text-xs text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full">
            {availableTables.length} Meja Kosong
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 md:max-w-5xl md:p-8 space-y-6">

        {/* Welcome Section */}
        {!selectedTable && (
          <div className="space-y-1 pt-2">
            <h2 className="text-2xl font-bold tracking-tight">Halo, Pelanggan!</h2>
            <p className="text-muted-foreground text-sm">Cari meja kosong dan mulai pesananmu.</p>
          </div>
        )}

        {/* Input Name Section */}
        {!selectedTable && (
          <div className="sticky top-[73px] z-20 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/50 md:static md:bg-transparent md:mx-0 md:p-0">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama Anda untuk reservasi..."
                className="pl-10 h-12 text-base bg-white shadow-sm border-gray-200 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Available Tables */}
        {!selectedTable && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {tables.map((table) => {
              const isAvailable = table.status === 'available';
              return (
                <button
                  key={table.id}
                  onClick={() => isAvailable && handleReserveTable(table)}
                  disabled={!isAvailable}
                  className={`
                    group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200
                    ${isAvailable
                      ? 'bg-white border-gray-200 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                      : 'bg-gray-50/80 border-gray-100 cursor-not-allowed opacity-80'
                    }
                  `}
                >
                  <div className="flex justify-between w-full mb-3">
                    <span className="text-sm font-semibold text-gray-400 group-hover:text-primary transition-colors">
                      #{table.number}
                    </span>
                    {isAvailable ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-6 px-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Tersedia
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-500 h-6 px-1.5">
                        <Ban className="w-3.5 h-3.5 mr-1" /> Terisi
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center w-full py-2 gap-2">
                    {isAvailable ? (
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <Armchair className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center grayscale">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className={`font-bold text-lg ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                        Meja {table.number}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" /> {table.capacity} Seats
                      </p>
                    </div>
                  </div>

                  {!isAvailable && table.customerName && (
                    <div className="w-full mt-3 pt-3 border-t border-dashed border-gray-200">
                      <p className="text-xs text-center text-gray-500 truncate max-w-full">
                        {table.customerName}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!selectedTable && availableTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-16 w-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
              <Hourglass className="h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Semua meja penuh</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Mohon tunggu sebentar. Kami akan memberitahu jika ada meja yang kosong.
            </p>
          </div>
        )}

        {/* Active Timer Status Card - Sticky Bottom */}
        {selectedTable && timeRemaining !== null && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-md mx-auto w-full">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    {currentPhase === 'walking' ? 'Menuju Lokasi' : 'Sisa Waktu'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                      {formatTime(timeRemaining)}
                    </span>
                    <span className="text-sm font-medium text-gray-500">min</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">Meja #{selectedTable.number}</div>
                  <div className="text-xs text-muted-foreground">{selectedTable.capacity} Orang</div>
                </div>
              </div>

              {currentPhase === 'walking' && (
                <Button
                  onClick={handleArriveAtTable}
                  className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Saya Sudah Sampai
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="text-center pt-8 pb-4 hidden md:block">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Depan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}