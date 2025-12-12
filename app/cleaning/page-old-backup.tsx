'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Table } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ScanLine,
  Sparkles,
  Trash2,
  SprayCan,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Search,
  Timer,
  Loader2
} from "lucide-react";

export default function CleaningPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannedTable, setScannedTable] = useState<Table | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const previousDirtyCountRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      console.log('All tables:', data);
      console.log('Occupied/Reserved tables:', data.filter((t: Table) => t.status === 'occupied' || t.status === 'reserved'));
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
    const interval = setInterval(fetchTables, 2000); // Update setiap 2 detik untuk realtime
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Update current time every second for timer display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Notifikasi suara dan visual ketika ada meja baru yang perlu dibersihkan
  useEffect(() => {
    const dirtyCount = tables.filter(t => t.status === 'needs-cleaning').length;

    if (dirtyCount > previousDirtyCountRef.current && previousDirtyCountRef.current > 0) {
      // Ada meja baru yang perlu dibersihkan

      // Notifikasi browser (jika diizinkan)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🧹 Meja Perlu Dibersihkan!', {
          body: `${dirtyCount} meja menunggu pembersihan`,
          icon: '/favicon.ico',
          tag: 'cleaning-alert'
        });
      }

      // Play sound alert (optional)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCuAzvLZiTYHGmi67OmfTBENT6zs7qZXFgpLo+PvuWUdBjmT1/HMey4FI3bK8N2RQAoUXrTp66hVFApGn+DyvmwhBCuAzvLZiTYHGmi67OmfTBENT6zs7qZXFgpLo+PvuWUdBjmT1/HMey4FI3bK8N2RQAoUXrTp66hVFApGn+DyvmwhBCuAzvLZiTYHGmi67OmfTBENT6zs7qZXFgpLo+PvuWUdBjmT1/HMey4FI3bK8N2RQAoUXrTp66hVFApGn+Dy');
        audio.play().catch(() => { });
      } catch (e) { }
    }

    previousDirtyCountRef.current = dirtyCount;
  }, [tables]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleScanTable = async () => {
    const num = parseInt(tableNumber);
    if (isNaN(num)) {
      alert('Nomor meja tidak valid');
      return;
    }

    const table = tables.find(t => t.number === num);
    if (!table) {
      alert('Meja tidak ditemukan');
      return;
    }

    if (table.status !== 'needs-cleaning') {
      alert('Meja ini tidak perlu dibersihkan saat ini');
      return;
    }

    setScannedTable(table);
  };

  const handleStartCleaning = async () => {
    if (!scannedTable) return;

    try {
      const res = await fetch(`/api/tables/${scannedTable.id}/clean`, {
        method: 'POST',
      });

      if (res.ok) {
        alert(`Pembersihan meja #${scannedTable.number} dimulai!`);
        setScannedTable(null);
        setTableNumber('');
        fetchTables();
      }
    } catch (error) {
      console.error('Error starting cleaning:', error);
    }
  };

  const dirtyTables = tables.filter(t => t.status === 'needs-cleaning');
  const cleaningTables = tables.filter(t => t.status === 'cleaning');
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'reserved');

  console.log('Dirty tables count:', dirtyTables.length);
  console.log('Cleaning tables count:', cleaningTables.length);
  console.log('Occupied tables count:', occupiedTables.length);
  console.log('Occupied tables:', occupiedTables);

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

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (table: Table) => {
    if (table.status === 'reserved') {
      return 'Menuju Meja';
    }
    if (table.status === 'occupied') {
      const timeRemaining = getTimeRemaining(table);
      if (timeRemaining !== null && timeRemaining > 0) {
        return 'Sedang Makan';
      }
      return 'Sedang Memesan';
    }
    return '';
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
    <div className="min-h-screen p-4 md:p-8 bg-green-50/50">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
            <SprayCan className="h-8 w-8 text-green-600" />
            Staff Cleaning
          </h1>
          <p className="text-muted-foreground">Dashboard operasional kebersihan meja</p>
        </div>

        {/* Status Alerts */}
        {dirtyTables.length > 0 ? (
          <Alert variant="destructive" className="border-red-500 bg-red-50 animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">PERHATIAN: {dirtyTables.length} Meja Kotor!</AlertTitle>
            <AlertDescription>
              Segera bersihkan meja: {dirtyTables.map(t => `#${t.number}`).join(', ')}
            </AlertDescription>
          </Alert>
        ) : dirtyTables.length === 0 && cleaningTables.length === 0 ? (
          <Alert className="border-green-500 bg-green-100 text-green-800">
            <Sparkles className="h-5 w-5" />
            <AlertTitle className="font-bold">Semua Bersih!</AlertTitle>
            <AlertDescription>
              Tidak ada antrian pembersihan saat ini. Good job!
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Scanner Card */}
        <Card className="max-w-xl mx-auto shadow-md border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Scan QR Meja
            </CardTitle>
            <CardDescription>Masukkan nomor meja atau scan QR untuk mulai membersihkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Nomor Meja..."
                className="text-lg h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleScanTable()}
              />
              <Button onClick={handleScanTable} className="h-12 w-32 bg-green-600 hover:bg-green-700">
                <Search className="mr-2 h-4 w-4" /> Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cleaning Confirmation Dialog */}
        <Dialog open={!!scannedTable} onOpenChange={(open) => !open && setScannedTable(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center items-center gap-2">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-yellow-600" />
              </div>
              <DialogTitle className="text-2xl">Bersihkan Meja #{scannedTable?.number}?</DialogTitle>
              <DialogDescription>
                Konfirmasi bahwa Anda akan mulai membersihkan meja ini. Status akan berubah menjadi "Cleaning".
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2">
              <Button variant="outline" onClick={() => setScannedTable(null)} className="w-full">
                Batal
              </Button>
              <Button onClick={handleStartCleaning} className="w-full bg-green-600 hover:bg-green-700">
                <SprayCan className="mr-2 h-4 w-4" />
                Mulai Bersihkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Grid Content */}
        <div className="grid gap-8">

          {/* 1. Dirty Tables (Highest Priority) */}
          {dirtyTables.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Perlu Dibersihkan ({dirtyTables.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dirtyTables.map((table) => (
                  <Card key={table.id} className="border-2 border-red-500 bg-red-50/50 shadow-sm">
                    <CardContent className="p-6 text-center space-y-2">
                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trash2 className="h-6 w-6 text-red-600 animate-bounce" />
                      </div>
                      <div className="text-2xl font-bold text-red-700">Meja {table.number}</div>
                      <Badge variant="destructive">Urgent</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 2. Currently Cleaning */}
          {cleaningTables.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600">
                <SprayCan className="h-5 w-5" />
                Sedang Dibersihkan ({cleaningTables.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cleaningTables.map((table) => (
                  <Card key={table.id} className="border-2 border-blue-400 bg-blue-50/30">
                    <CardContent className="p-6 text-center space-y-2">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="h-6 w-6 text-blue-600 animate-spin-slow" />
                      </div>
                      <div className="text-2xl font-bold text-blue-700">Meja {table.number}</div>
                      <p className="text-xs text-blue-600">Auto-finish in 5m</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3. Occupied Tables (Low Priority Info) */}
          {occupiedTables.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-600">
                <Utensils className="h-5 w-5" />
                Meja Terisi ({occupiedTables.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-75">
                {occupiedTables.map((table) => {
                  const timeRemaining = getTimeRemaining(table);
                  const statusText = getStatusText(table);
                  return (
                    <Card key={table.id} className={`border ${table.status === 'reserved' ? 'border-yellow-300 bg-yellow-50' : 'border-blue-200 bg-white'}`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-gray-700">Meja {table.number}</div>
                        <div className="text-sm text-muted-foreground mb-2">{table.customerName}</div>
                        <Badge variant="secondary" className="mb-2">{statusText}</Badge>

                        {timeRemaining !== null && timeRemaining > 0 && (
                          <div className="flex items-center justify-center gap-1 text-xs font-mono font-medium text-gray-500">
                            <Timer className="h-3 w-3" />
                            {timeRemaining}m left
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Halaman Utama
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
