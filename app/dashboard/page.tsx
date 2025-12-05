'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, TableStatus } from '@/lib/types';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Users,
  Clock,
  CheckCircle2,
  Utensils,
  Ban,
  Sparkles,
  MonitorPlay,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch and setup polling
    const timer = setTimeout(() => fetchTables(), 0);
    const interval = setInterval(fetchTables, 2000); // Update setiap 2 detik
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (table: Table) => {
    if (table.status === 'reserved' && table.reservedAt) {
      const elapsed = currentTime - table.reservedAt;
      const remaining = Math.max(0, (10 * 60 * 1000) - elapsed);
      return Math.ceil(remaining / 1000 / 60);
    }
    if (table.status === 'occupied' && table.occupiedAt) {
      const elapsed = currentTime - table.occupiedAt;
      const remaining = Math.max(0, (30 * 60 * 1000) - elapsed);
      return Math.ceil(remaining / 1000 / 60);
    }
    return null;
  };

  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    needsCleaning: tables.filter(t => t.status === 'needs-cleaning').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };

  const getTileStyles = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_30px_rgba(5,150,105,0.3)] scale-100 z-10';
      case 'reserved':
        return 'bg-amber-500/90 text-white border-amber-600/50 opacity-90';
      case 'occupied':
        return 'bg-slate-800/90 text-slate-300 border-slate-700 opacity-80';
      case 'needs-cleaning':
        return 'bg-red-600/90 text-white border-red-700 animate-pulse';
      case 'cleaning':
        return 'bg-blue-600/90 text-white border-blue-500 opacity-90';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const getStatusLabel = (status: TableStatus) => {
    switch (status) {
      case 'available': return 'KOSONG';
      case 'reserved': return 'RESERVED';
      case 'occupied': return 'TERISI';
      case 'needs-cleaning': return 'CLEANING';
      case 'cleaning': return 'WIP';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-muted/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col p-6 overflow-hidden font-sans">

      {/* 1. Top Bar: Header & Live Stats */}
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MonitorPlay className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none mb-1">MONITORING MEJA</h1>
            <p className="text-sm text-slate-400 font-medium">Live Status Feed</p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg min-w-[100px]">
            <span className="text-3xl font-bold text-emerald-400 leading-none">{stats.available}</span>
            <span className="text-[10px] uppercase font-bold text-emerald-600/80 tracking-wider">Tersedia</span>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg min-w-[100px] opacity-60">
            <span className="text-3xl font-bold text-slate-300 leading-none">{stats.occupied + stats.reserved}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Terisi</span>
          </div>
        </div>
      </header>

      {/* 2. Main Grid: Auto-fit to screen height */}
      <main className="flex-1 grid grid-cols-4 gap-4 pb-2">
        {tables.map((table) => {
          const timeRemaining = getTimeRemaining(table);
          const isAvailable = table.status === 'available';

          return (
            <Card
              key={table.id}
              className={`
                relative border-2 flex flex-col items-center justify-center text-center transition-all duration-300 rounded-2xl
                ${getTileStyles(table.status)}
              `}
            >
              {/* Card Header Content */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isAvailable ? (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                    {table.capacity} Seats
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium opacity-80 bg-black/20 px-2 py-1 rounded">
                    {timeRemaining ? (
                      <>
                        <Clock className="h-3 w-3" /> {timeRemaining}m
                      </>
                    ) : (
                      <span className="uppercase">{getStatusLabel(table.status)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Main Number - Huge Typography */}
              <CardContent className="p-0 flex flex-col items-center justify-center h-full w-full pt-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 mb-2">
                  MEJA
                </span>
                <span className="text-8xl font-black tracking-tighter leading-none mb-4">
                  {table.number}
                </span>

                {/* Secondary Icon/Status */}
                <div className="h-8 flex items-center justify-center">
                  {table.status === 'available' && <CheckCircle2 className="h-8 w-8 animate-bounce" />}
                  {table.status === 'occupied' && <Utensils className="h-6 w-6 opacity-50" />}
                  {table.status === 'reserved' && <Clock className="h-6 w-6 opacity-50" />}
                  {table.status === 'needs-cleaning' && <Sparkles className="h-6 w-6" />}
                  {table.status === 'cleaning' && <Ban className="h-6 w-6" />}
                </div>
              </CardContent>

              {/* Bottom Customer Name (If exists, mostly for Waiters) */}
              {table.customerName && !isAvailable && (
                <div className="absolute bottom-0 w-full p-3 bg-black/20 backdrop-blur-sm border-t border-white/5">
                  <p className="text-sm font-medium truncate max-w-full px-2 opacity-90">
                    {table.customerName}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </main>

      {/* 3. Footer Legend (Minimal) */}
      <footer className="shrink-0 pt-3 flex justify-center gap-8 border-t border-slate-800/50">
        {[
          { color: 'bg-emerald-500', label: 'Tersedia' },
          { color: 'bg-slate-700', label: 'Terisi' },
          { color: 'bg-amber-500', label: 'Reserved' },
          { color: 'bg-red-600', label: 'Perlu Bersih' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}