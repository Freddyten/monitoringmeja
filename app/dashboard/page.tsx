'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import {
  Loader2,
  WifiOff,
  MonitorPlay,
  Clock
} from "lucide-react";

// Import API functions - utilizing existing backend
import { fetchTables } from '@/lib/api/tables';
import { fetchTransactions } from '@/lib/api/transactions';
import { APITable, APITransaction } from '@/lib/types';

// Types for our View Model
type TableStatus = 'available' | 'reserved' | 'occupied' | 'needs-cleaning' | 'cleaning';

interface DashboardTable {
  id: number;
  standId: number;
  number: string; // "1", "2", etc.
  status: TableStatus;
  customerName?: string;
  timeLabel?: string; // For elapsed time
}

// Configuration
const REFRESH_INTERVAL = 5000; // 5 seconds

export default function TVDashboard() {
  const [stands, setStands] = useState<Record<number, DashboardTable[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    try {
      const [apiTables, apiTransactions] = await Promise.all([
        fetchTables(),
        fetchTransactions(),
      ]);

      // We need to organize 50 tables into 10 stands
      // Initialize empty structure for 10 stands
      const organizedData: Record<number, DashboardTable[]> = {};
      for (let i = 1; i <= 10; i++) organizedData[i] = [];

      // Process all API tables
      apiTables.forEach((apiTable) => {
        const standId = apiTable.stand_id;
        if (standId < 1 || standId > 10) return; // Safety check

        // Find active transaction for this specific table
        const activeTxn = apiTransactions.find(
          t => t.stand_id === standId &&
            t.tables.table_number === apiTable.table_number &&
            ['pending', 'preparing', 'ready'].includes(t.status)
        );

        let status: TableStatus = 'available';
        let customerName = undefined;
        let timeLabel = undefined;

        // Determine Status based on Transaction or Table State
        if (activeTxn) {
          status = activeTxn.status === 'ready' ? 'reserved' : 'occupied';
          customerName = activeTxn.customer_name;

          // Calculate elapsed minutes
          const startTime = new Date(activeTxn.created_at).getTime();
          const minutes = Math.floor((Date.now() - startTime) / 60000);
          timeLabel = `${minutes}m`;
        } else if (!apiTable.is_available) {
          // If no active transaction but marked unavailable, assume cleaning/maintenance
          // You can adjust this logic based on how your backend sets is_available
          status = 'occupied';
        }

        organizedData[standId].push({
          id: apiTable.id,
          standId: standId,
          number: apiTable.table_number,
          status,
          customerName,
          timeLabel
        });
      });

      // Sort tables within each stand by number (1-5)
      Object.keys(organizedData).forEach(key => {
        const k = parseInt(key);
        organizedData[k].sort((a, b) => parseInt(a.number) - parseInt(b.number));
      });

      setStands(organizedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setError("Connection Lost");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Auto Refresh Timer ---
  useEffect(() => {
    fetchData(); // Initial load
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);


  // --- Helper: Status Colors (High Contrast for TV) ---
  const getStatusStyles = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]';
      case 'occupied':
        return 'bg-slate-700 text-slate-200 border-slate-600 opacity-90'; // Dimmed to focus attention on open tables? Or Red?
      // Alternative High Contrast: 'bg-red-600 text-white animate-pulse-slow'
      case 'reserved':
        return 'bg-amber-500 text-white border-amber-400 animate-pulse'; // Action needed
      case 'needs-cleaning':
      case 'cleaning':
        return 'bg-purple-600 text-white border-purple-500';
      default:
        return 'bg-slate-800 text-slate-500';
    }
  };


  const STAND_NAMES: Record<number, string> = {
    1: "Telur Gulung Haryadi",
    2: "Lumpia Basah Bakso",
    3: "Jagung Cheese Tarik",
    4: "Matchaiya - Premium Matcha",
    5: "Sakura Japanese Drink",
    6: "Sempol Ayam Sabrina",
    7: "Takoyaki",
    8: "Lumpia Ubi Lumer",
    9: "Cireng Gemoy",
    10: "Papa Moi Dessert"
  }

  if (loading && Object.keys(stands).length === 0) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <h1 className="text-2xl font-bold">BOOTING SYSTEM...</h1>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-hidden flex flex-col font-sans select-none cursor-none">

      {/* 1. Header (Compact) */}
      <header className="flex justify-between items-center px-6 py-3 bg-slate-900 border-b border-slate-800 shrink-0 h-[60px]">
        <div className="flex items-center gap-3">
          <MonitorPlay className="text-emerald-500 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wider text-slate-200">
            PASAR LAMA
          </h1>
        </div>

        {/* Legend */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-sm font-bold text-slate-400 uppercase">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-600"></span>
            <span className="text-sm font-bold text-slate-400 uppercase">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-400 uppercase">Ready/Rsrv</span>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          {error ? (
            <span className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
              <WifiOff className="w-3 h-3" /> OFFLINE
            </span>
          ) : (
            <span className="text-emerald-600">● LIVE DATA</span>
          )}
          <span>{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </header>

      {/* 2. The Grid Matrix (10 Columns x 5 Rows) */}
      <main className="flex-1 p-2 grid grid-cols-10 gap-1 bg-slate-950">

        {/* Render Columns for each Stand (1-10) */}
        {Array.from({ length: 10 }, (_, i) => {
          const standId = i + 1;
          const tables = stands[standId] || [];

          return (
            <div key={standId} className="flex flex-col gap-1 h-full border-r border-slate-800/50 last:border-r-0 pr-1 last:pr-0">

              {/* Stand Header with Name */}
              <div className="bg-slate-900/80 rounded-t-lg p-2 text-center border-b-2 border-slate-800 min-h-[85px] flex flex-col justify-center relative overflow-hidden group">
                {/* Background Number for style */}
                <span className="absolute -top-2 -right-2 text-5xl font-black text-slate-800/30 select-none z-0">
                  {standId}
                </span>

                {/* Stand Number */}
                <div className="relative z-10 flex items-center justify-center gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">STAND</span>
                  <span className="text-xl font-black text-white leading-none">{standId}</span>
                </div>

                {/* Stand Name - Auto clamping for long names */}
                <div className="relative z-10 h-[2.4em] flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-slate-300 leading-tight uppercase line-clamp-2 px-1">
                    {STAND_NAMES[standId] || `Tenant ${standId}`}
                  </span>
                </div>
              </div>

              {/* Table Slots (5 per stand) */}
              <div className="flex-1 flex flex-col gap-1">
                {Array.from({ length: 5 }, (_, j) => {
                  const table = tables[j]; // Assuming sorted 1-5
                  // Safety: if table data is missing for a specific slot
                  if (!table) {
                    return <div key={j} className="flex-1 bg-slate-900/30 rounded border border-slate-900/50" />;
                  }

                  return (
                    <Card
                      key={table.id}
                      className={`
                        flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-md border-2 transition-colors duration-500
                        ${getStatusStyles(table.status)}
                      `}
                    >
                      {/* Status Indicator (Timer or Icon) */}
                      {table.timeLabel && (
                        <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/40 rounded px-1.5 py-0.5 backdrop-blur-sm">
                          <Clock className="w-3 h-3 text-white/80" />
                          <span className="text-xs font-mono font-bold">{table.timeLabel}</span>
                        </div>
                      )}

                      {/* HUGE Table Number */}
                      <span className="text-5xl font-black leading-none opacity-100 z-10">
                        {table.number}
                      </span>

                      {/* Subtle Customer Name (Bottom) - Optional */}
                      {table.customerName && (
                        <div className="absolute bottom-0 w-full bg-black/40 text-center py-0.5 backdrop-blur-sm">
                          <p className="text-[10px] font-medium truncate px-1 text-white/90">
                            {table.customerName.split(' ')[0]} {/* First name only for space */}
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}