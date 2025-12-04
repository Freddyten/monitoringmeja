'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Table } from '@/lib/types';

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
        audio.play().catch(() => {});
      } catch (e) {}
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🧹 Staff Cleaning
        </h1>
        <p className="text-center text-gray-600 mb-8">Scan QR code di meja untuk memulai pembersihan</p>

        {/* Alert Banner - Meja yang perlu dibersihkan */}
        {dirtyTables.length > 0 && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-lg font-bold text-red-800">
                  ⚠️ PERHATIAN: {dirtyTables.length} Meja Perlu Dibersihkan!
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Meja nomor: {dirtyTables.map(t => `#${t.number}`).join(', ')}
                </p>
              </div>
              <div className="ml-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
                  {dirtyTables.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success Banner - Semua meja bersih */}
        {dirtyTables.length === 0 && cleaningTables.length === 0 && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ✨ Semua meja sudah bersih! Great job!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Scan Meja</h2>
          <div className="flex gap-4">
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Masukkan nomor meja"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && handleScanTable()}
            />
            <button
              onClick={handleScanTable}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Scan
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            * Dalam implementasi real, ini akan menggunakan QR scanner
          </p>
        </div>

        {/* Scanned Table Confirmation */}
        {scannedTable && (
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Meja #{scannedTable.number}
            </h2>
            <p className="text-gray-700 mb-4">
              Meja ini perlu dibersihkan. Mulai pembersihan?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleStartCleaning}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ✓ Mulai Bersihkan
              </button>
              <button
                onClick={() => setScannedTable(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Occupied Tables - Meja Terisi */}
        {occupiedTables.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Meja Terisi ({occupiedTables.length})
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {occupiedTables.map((table) => {
                const timeRemaining = getTimeRemaining(table);
                const statusText = getStatusText(table);
                return (
                  <div
                    key={table.id}
                    className={`bg-white p-6 rounded-lg shadow border-2 ${
                      table.status === 'reserved' ? 'border-yellow-400' : 'border-blue-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {table.status === 'reserved' ? '🚶' : '🍽️'}
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        Meja {table.number}
                      </div>
                      {table.customerName && (
                        <div className="text-sm text-gray-600 mb-1">
                          👤 {table.customerName}
                        </div>
                      )}
                      <div className="text-gray-600 text-sm mb-2">
                        Kapasitas: {table.capacity} orang
                      </div>
                      <div className={`mt-2 font-semibold ${
                        table.status === 'reserved' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {statusText}
                      </div>
                      {timeRemaining !== null && timeRemaining > 0 && (
                        <div className="mt-2 bg-gray-100 rounded-lg py-2 px-3">
                          <div className="text-xs text-gray-600 mb-1">Waktu Tersisa</div>
                          <div className="text-lg font-bold text-gray-800">
                            {timeRemaining} menit
                          </div>
                        </div>
                      )}
                      {table.status === 'occupied' && (timeRemaining === null || timeRemaining === 0) && (
                        <div className="mt-2 bg-purple-100 rounded-lg py-2 px-3">
                          <div className="text-sm font-semibold text-purple-700">
                            📝 Sedang Memesan
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dirty Tables List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Meja Perlu Dibersihkan ({dirtyTables.length})
          </h2>
          {dirtyTables.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dirtyTables.map((table) => (
                <div
                  key={table.id}
                  className="bg-white p-6 rounded-lg shadow border-2 border-yellow-500"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚠️</div>
                    <div className="text-2xl font-bold text-gray-800">
                      Meja {table.number}
                    </div>
                    <div className="text-gray-600">
                      Kapasitas: {table.capacity} orang
                    </div>
                    <div className="mt-2 text-yellow-600 font-semibold">
                      Perlu dibersihkan
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              <div className="text-4xl mb-2">✨</div>
              <p>Tidak ada meja yang perlu dibersihkan</p>
            </div>
          )}
        </div>

        {/* Currently Cleaning */}
        {cleaningTables.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Sedang Dibersihkan ({cleaningTables.length})
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cleaningTables.map((table) => (
                <div
                  key={table.id}
                  className="bg-white p-6 rounded-lg shadow border-2 border-blue-500"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧽</div>
                    <div className="text-2xl font-bold text-gray-800">
                      Meja {table.number}
                    </div>
                    <div className="text-gray-600">
                      Kapasitas: {table.capacity} orang
                    </div>
                    <div className="mt-2 text-blue-600 font-semibold">
                      Sedang dibersihkan
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-green-600 hover:text-green-700 font-semibold">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
