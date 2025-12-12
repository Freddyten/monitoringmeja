'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APITransaction, TransactionStatus } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Clock,
  Utensils,
  Package,
  TrendingUp
} from "lucide-react";

// Import API functions
import { fetchTransactions, fetchCompletedTransactions } from '@/lib/api/transactions';
import { fetchTables } from '@/lib/api/tables';
import { StandSelector } from '@/components/StandSelector';

interface TableCleaningStatus {
  table_number: string;
  table_name: string;
  completedOrders: APITransaction[];
  lastCompletedAt: string | null;
  needsCleaning: boolean;
}

export default function CleaningPage() {
  const [selectedStand, setSelectedStand] = useState<number | null>(null);
  const [data, setData] = useState<TableCleaningStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    needsCleaning: 0,
    recentlyCompleted: 0,
  });
  const [standsData, setStandsData] = useState<Array<{ standId: number; total: number; available: number; occupied: number }>>([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [completedTransactions, setCompletedTransactions] = useState<APITransaction[]>([]);

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
    const interval = setInterval(fetchStandsData, 5000);
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

      // Filter completed transactions dari hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedTxns = allTransactions.filter(
        t => t.status === 'completed' && 
        new Date(t.completed_at || t.updated_at) >= today
      );

      setCompletedTransactions(completedTxns);

      // Group by table
      const tableCleaningMap: Map<string, TableCleaningStatus> = new Map();

      standTables.forEach(table => {
        const tableCompleted = completedTxns.filter(
          t => t.stand_id === selectedStand &&
          t.tables.table_number === table.table_number
        );

        const lastCompleted = tableCompleted.length > 0
          ? tableCompleted.sort((a, b) => 
              new Date(b.completed_at || b.updated_at).getTime() - 
              new Date(a.completed_at || a.updated_at).getTime()
            )[0]
          : null;

        // Meja perlu dibersihkan jika ada completed order dalam 30 menit terakhir
        const needsCleaning = lastCompleted 
          ? (currentTime - new Date(lastCompleted.completed_at || lastCompleted.updated_at).getTime()) < (30 * 60 * 1000)
          : false;

        tableCleaningMap.set(table.table_number, {
          table_number: table.table_number,
          table_name: table.table_name,
          completedOrders: tableCompleted,
          lastCompletedAt: lastCompleted?.completed_at || lastCompleted?.updated_at || null,
          needsCleaning,
        });
      });

      const cleaningData = Array.from(tableCleaningMap.values())
        .sort((a, b) => {
          // Sort by needs cleaning first, then by last completed time
          if (a.needsCleaning && !b.needsCleaning) return -1;
          if (!a.needsCleaning && b.needsCleaning) return 1;
          
          if (a.lastCompletedAt && b.lastCompletedAt) {
            return new Date(b.lastCompletedAt).getTime() - new Date(a.lastCompletedAt).getTime();
          }
          return 0;
        });

      setData(cleaningData);

      // Calculate stats - will be recalculated by useEffect based on currentTime
      updateStats(cleaningData, completedTxns);

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching cleaning data:', err);
      setError('Gagal memuat data dari API');
      setLoading(false);
    }
  };

  // Function to update stats based on current time
  const updateStats = (cleaningData: TableCleaningStatus[], completedTxns: APITransaction[]) => {
    const needsCleaningCount = cleaningData.filter(d => {
      if (!d.lastCompletedAt) return false;
      return (currentTime - new Date(d.lastCompletedAt).getTime()) < (30 * 60 * 1000);
    }).length;

    const recentlyCompletedCount = completedTxns.filter(t => {
      const completedTime = new Date(t.completed_at || t.updated_at).getTime();
      return (currentTime - completedTime) < (10 * 60 * 1000); // Last 10 minutes
    }).length;

    setStats({
      totalCompleted: completedTxns.length,
      needsCleaning: needsCleaningCount,
      recentlyCompleted: recentlyCompletedCount,
    });
  };

  // Update current time every second for real-time stats
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate stats when currentTime changes
  useEffect(() => {
    if (data.length > 0 && completedTransactions.length > 0) {
      updateStats(data, completedTransactions);
    }
  }, [currentTime]);

  useEffect(() => {
    if (selectedStand !== null) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Update setiap 5 detik
      return () => clearInterval(interval);
    }
  }, [selectedStand]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const getTimeSince = (dateString: string) => {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diff = Math.floor((now - then) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit lalu`;
    const hours = Math.floor(diff / 60);
    return `${hours} jam lalu`;
  };

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
        <p className="text-sm font-medium text-slate-600 animate-pulse">Memuat data cleaning dari API...</p>
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
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Cleaning Monitor - Stand {selectedStand}
              </h1>
              <p className="text-sm text-slate-600">
                Status Pembersihan Meja dari API
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
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.totalCompleted}</div>
              <div className="text-xs text-blue-700">Total Selesai Hari Ini</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{stats.needsCleaning}</div>
              <div className="text-xs text-orange-700 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" /> Perlu Dibersihkan
              </div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">{stats.recentlyCompleted}</div>
              <div className="text-xs text-emerald-700 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> 10 Menit Terakhir
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Needs Cleaning Section */}
        {data.filter(d => d.needsCleaning).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
              Prioritas Pembersihan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.filter(d => d.needsCleaning).map((item) => (
                <Card key={item.table_number} className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.table_name}</CardTitle>
                      <Badge className="bg-orange-500 text-white animate-pulse">
                        Perlu Dibersihkan
                      </Badge>
                    </div>
                    <CardDescription>
                      Nomor: {item.table_number}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.lastCompletedAt && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-600">
                            {getTimeSince(item.lastCompletedAt)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Selesai: {formatDate(item.lastCompletedAt)}
                        </div>
                        <div className="pt-2 mt-2 border-t border-orange-200">
                          <div className="text-xs text-slate-600">
                            {item.completedOrders.length} order selesai hari ini
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Tables Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-slate-600" />
            Semua Meja ({data.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.filter(d => !d.needsCleaning).map((item) => (
              <Card key={item.table_number} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.table_name}</CardTitle>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Bersih
                    </Badge>
                  </div>
                  <CardDescription>
                    Nomor: {item.table_number}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {item.completedOrders.length > 0 ? (
                      <>
                        {item.lastCompletedAt && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">
                                {getTimeSince(item.lastCompletedAt)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Terakhir: {formatDate(item.lastCompletedAt)}
                            </div>
                          </>
                        )}
                        <div className="pt-2 mt-2 border-t border-slate-200">
                          <div className="text-xs text-slate-600 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {item.completedOrders.length} order selesai hari ini
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-400 py-4 text-center">
                        Belum ada order hari ini
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">
              <Sparkles className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-slate-600 font-medium">Tidak ada data meja</p>
            <p className="text-sm text-slate-500 mt-1">
              Tidak ada transaksi yang selesai hari ini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
