'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, TableStatus } from '@/lib/types';

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

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'occupied':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'needs-cleaning':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'cleaning':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'reserved':
        return '⏱️';
      case 'occupied':
        return '🍽️';
      case 'needs-cleaning':
        return '⚠️';
      case 'cleaning':
        return '🧹';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'reserved':
        return 'Direservasi';
      case 'occupied':
        return 'Terisi';
      case 'needs-cleaning':
        return 'Perlu Dibersihkan';
      case 'cleaning':
        return 'Sedang Dibersihkan';
      default:
        return status;
    }
  };

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          📊 Dashboard Monitoring Meja
        </h1>
        <p className="text-center text-gray-600 mb-8">Real-time monitoring semua status meja</p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center border-t-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            <div className="text-gray-600">Tersedia</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center border-t-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-600">{stats.reserved}</div>
            <div className="text-gray-600">Direservasi</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{stats.occupied}</div>
            <div className="text-gray-600">Terisi</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center border-t-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600">{stats.needsCleaning}</div>
            <div className="text-gray-600">Perlu Bersih</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center border-t-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">{stats.cleaning}</div>
            <div className="text-gray-600">Dibersihkan</div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const timeRemaining = getTimeRemaining(table);
            return (
              <div
                key={table.id}
                className={`p-6 rounded-lg shadow-lg border-2 ${getStatusColor(table.status)}`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{getStatusIcon(table.status)}</div>
                  <div className="text-2xl font-bold mb-1">
                    Meja {table.number}
                  </div>
                  <div className="text-sm mb-2">
                    Kapasitas: {table.capacity} orang
                  </div>
                  <div className="font-semibold mb-2">
                    {getStatusText(table.status)}
                  </div>
                  
                  {table.customerName && (
                    <div className="text-sm">
                      👤 {table.customerName}
                    </div>
                  )}
                  
                  {timeRemaining !== null && timeRemaining > 0 && (
                    <div className="mt-2 text-sm font-semibold">
                      ⏱️ {timeRemaining} menit tersisa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Status Meja:</h3>
          <div className="grid md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Tersedia - Meja kosong dan bersih</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span>Direservasi - Customer menuju meja (10 mnt)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span>Terisi - Customer sedang makan (30 mnt)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <span>Perlu Dibersihkan - Menunggu staff</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧹</span>
              <span>Sedang Dibersihkan - Staff sedang bersihkan</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
