'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Users,
  CheckCircle2,
  Ban,
  ArrowLeft,
  Loader2,
  Armchair,
  User,
} from "lucide-react";

// Import API functions
import { fetchTables } from '@/lib/api/tables';
import { fetchTransactions } from '@/lib/api/transactions';
import { StandSelector } from '@/components/StandSelector';

export default function CustomerPage() {
  const [selectedStand, setSelectedStand] = useState<number | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standsData, setStandsData] = useState<Array<{ standId: number; total: number; available: number; occupied: number }>>([]);

  // Load selected stand from localStorage
  useEffect(() => {
    const savedStand = localStorage.getItem('selectedStand');
    if (savedStand) {
      setSelectedStand(parseInt(savedStand));
    }
  }, []);

  const handleStandSelect = (standId: number) => {
    setSelectedStand(standId);
    localStorage.setItem('selectedStand', standId.toString());
  };

  // Fetch stands data for counter
  const fetchStandsData = async () => {
    try {
      const [apiTables, allTransactions] = await Promise.all([
        fetchTables(),
        fetchTransactions(),
      ]);

      // Calculate stats for each stand
      const standsStats = Array.from({ length: 10 }, (_, i) => {
        const standId = i + 1;
        const standTables = apiTables.filter(t => t.stand_id === standId);
        
        const occupied = standTables.filter(table => {
          return allTransactions.some(
            t => t.stand_id === standId &&
            t.tables.table_number === table.table_number &&
            ['pending', 'preparing', 'ready'].includes(t.status)
          );
        }).length;

        return {
          standId,
          total: standTables.length,
          available: standTables.length - occupied,
          occupied,
        };
      });

      setStandsData(standsStats);
    } catch (err) {
      console.error('Error fetching stands data:', err);
    }
  };

  // Auto-refresh stands data
  useEffect(() => {
    fetchStandsData();
    const interval = setInterval(fetchStandsData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    if (selectedStand === null) return;
    
    try {
      const [apiTables, allTransactions] = await Promise.all([
        fetchTables(),
        fetchTransactions(),
      ]);

      // Filter tables by selected stand using stand_id field
      const standTables = apiTables.filter(table => 
        table.stand_id === selectedStand
      );

      // Convert to local Table format
      const convertedTables: Table[] = standTables.map((apiTable) => {
        const tableNumber = parseInt(apiTable.table_number);
        
        // Check for active transactions using stand_id and table_number
        const hasActiveTransaction = allTransactions.some(
          t => t.stand_id === selectedStand &&
          t.tables.table_number === apiTable.table_number &&
          ['pending', 'preparing', 'ready'].includes(t.status)
        );
        
        const status: Table['status'] = hasActiveTransaction 
          ? 'occupied' 
          : 'available';
        
        return {
          id: `table-${selectedStand}-${tableNumber}`,
          number: tableNumber,
          status,
          capacity: 4,
        };
      });

      setTables(convertedTables);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data dari API');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStand !== null) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStand]);

  const handleTableSelect = (table: Table) => {
    if (table.status !== 'available') return;
    if (!customerName.trim()) {
      alert('Silakan masukkan nama Anda terlebih dahulu');
      return;
    }
    
    // Redirect ke URL pemesanan dengan stand dan table number
    const orderUrl = `https://pasarlama.raymondbt.my.id/stand/${selectedStand}?table=${table.number}`;
    window.location.href = orderUrl;
  };

  const availableTables = tables.filter(t => t.status === 'available');

  // Show stand selector if no stand selected
  if (selectedStand === null) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <StandSelector 
            onStandSelect={handleStandSelect}
            selectedStand={selectedStand}
            standsData={standsData}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-600 animate-pulse">Memuat data meja...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <div className="text-red-500 text-center">
          <p className="text-lg font-bold mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Reservasi Meja - Stand {selectedStand}
              </h1>
              <p className="text-sm text-slate-600">
                Pilih meja yang tersedia
                <button 
                  onClick={() => setSelectedStand(null)}
                  className="ml-3 text-blue-600 hover:text-blue-700 underline"
                >
                  Ganti Stand
                </button>
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Customer Name Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Masukkan nama Anda..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-4 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">{availableTables.length}</span>
              <span className="text-slate-600">Tersedia</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tables.map((table) => {
            const isAvailable = table.status === 'available';
            const canSelect = isAvailable && customerName.trim().length > 0;

            return (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                disabled={!canSelect}
                className={`
                  group relative flex flex-col items-center p-6 rounded-xl border-2 text-center transition-all duration-200
                  ${isAvailable && canSelect
                    ? 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                    : isAvailable 
                      ? 'bg-white border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {isAvailable ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Tersedia
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                      <Ban className="w-3 h-3 mr-1" /> Terisi
                    </Badge>
                  )}
                </div>

                {/* Table Icon */}
                <div className={`
                  h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-all
                  ${isAvailable && canSelect
                    ? 'bg-emerald-50 group-hover:bg-emerald-100'
                    : isAvailable
                      ? 'bg-slate-50'
                      : 'bg-slate-100'
                  }
                `}>
                  <Armchair className={`
                    h-8 w-8 transition-all
                    ${isAvailable && canSelect
                      ? 'text-emerald-600 group-hover:scale-110'
                      : isAvailable
                        ? 'text-slate-400'
                        : 'text-slate-300'
                    }
                  `} />
                </div>

                {/* Table Info */}
                <div>
                  <p className={`
                    font-bold text-2xl mb-1 transition-all
                    ${isAvailable && canSelect
                      ? 'text-slate-900 group-hover:text-emerald-600'
                      : 'text-slate-400'
                    }
                  `}>
                    Meja {table.number}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" /> {table.capacity} Kursi
                  </p>
                </div>

                {/* Hover Indicator */}
                {isAvailable && canSelect && (
                  <div className="mt-3 pt-3 border-t border-slate-100 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-emerald-600 font-medium">
                      Klik untuk pesan
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {availableTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Ban className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Semua meja penuh</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">
              Mohon tunggu sebentar atau pilih stand lain.
            </p>
          </div>
        )}

        {/* Info Card */}
        {!customerName.trim() && availableTables.length > 0 && (
          <Card className="mt-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700 text-center">
                💡 Masukkan nama Anda di kolom atas untuk bisa memilih meja
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
