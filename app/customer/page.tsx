'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table } from '@/lib/types';

export default function CustomerPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'selection' | 'walking' | 'waiting-order' | 'dining'>('selection');
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);

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
    const timer = setTimeout(() => fetchTables(), 0);
    const interval = setInterval(fetchTables, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleArriveAtTable = async () => {
    if (!selectedTable) return;

    console.log('Arrive at table clicked, table:', selectedTable.id);

    try {
      const res = await fetch(`/api/tables/${selectedTable.id}/occupy`, {
        method: 'POST',
      });

      console.log('Occupy response:', res.status);

      if (res.ok) {
        const updatedTable = await res.json();
        console.log('Updated table:', updatedTable);
        setSelectedTable(updatedTable);
        setTimeRemaining(null); // Stop timer sementara
        setCurrentPhase('waiting-order'); // Ubah ke fase menunggu order
        await fetchTables();
      } else {
        const error = await res.json();
        console.error('Error response:', error);
        alert(`Error: ${error.error || 'Gagal update status meja'}`);
      }
    } catch (error) {
      console.error('Error occupying table:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleStartOrder = () => {
    // Mulai timer 30 menit setelah tombol "Pesan" diklik
    setTimeRemaining(30 * 60);
    setCurrentPhase('dining');
  };

  useEffect(() => {
    if (!selectedTable || timeRemaining === null || currentPhase !== 'walking' && currentPhase !== 'dining') return;

    const handleTimerEnd = async () => {
      if (currentPhase === 'walking') {
        // Timer 10 menit habis, langsung ke occupied
        console.log('Timer habis, auto arrive at table');
        await handleArriveAtTable();
      } else if (currentPhase === 'dining') {
        // Timer 30 menit habis, selesai makan
        try {
          await fetch(`/api/tables/${selectedTable.id}/finish`, {
            method: 'POST',
          });
          alert('Waktu makan selesai. Terima kasih!');
          setSelectedTable(null);
          setCurrentPhase('selection');
          setCustomerName('');
          fetchTables();
        } catch (error) {
          console.error('Error finishing dining:', error);
        }
      }
    };

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable, timeRemaining, currentPhase]);

  const handleReserveTable = async (table: Table) => {
    if (!customerName.trim()) {
      alert('Silakan masukkan nama Anda');
      return;
    }

    console.log('Reserving table:', table.id, 'for:', customerName);

    try {
      const res = await fetch(`/api/tables/${table.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName }),
      });

      console.log('Response status:', res.status);
      
      if (res.ok) {
        const updatedTable = await res.json();
        console.log('Updated table:', updatedTable);
        setSelectedTable(updatedTable);
        setTimeRemaining(10 * 60); // 10 menit
        setCurrentPhase('walking');
        setShowReservationModal(true); // Tampilkan modal
        fetchTables();
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        alert(`Error: ${errorData.error || 'Gagal memesan meja'}`);
      }
    } catch (error) {
      console.error('Error reserving table:', error);
      alert('Terjadi kesalahan saat memesan meja. Silakan coba lagi.');
    }
  };

  const closeModal = () => {
    setShowReservationModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const availableTables = tables.filter(t => t.status === 'available');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Blank Page - Waiting for Order
  if (currentPhase === 'waiting-order' && selectedTable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-5xl">
                🍽️
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Selamat Datang!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              <span className="font-semibold text-purple-600">{customerName}</span>
            </p>
            <p className="text-gray-600 mb-8">
              di <span className="font-bold text-2xl text-purple-700">Meja #{selectedTable.number}</span>
            </p>

            {/* Description */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
              <p className="text-gray-700 mb-4">
                Anda sudah sampai di meja. Silakan lihat menu dan klik tombol di bawah untuk memulai pemesanan.
              </p>
              <p className="text-sm text-gray-600">
                ⏱️ Timer 30 menit akan dimulai setelah Anda memesan
              </p>
            </div>

            {/* Order Button */}
            <button
              onClick={handleStartOrder}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold py-6 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🛎️ Mulai Pesan
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Klik tombol di atas saat Anda siap untuk memesan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Pilih Meja Anda
        </h1>
        <p className="text-center text-gray-600 mb-8">Selamat datang! Silakan pilih meja yang tersedia</p>

        {/* Modal Konfirmasi Reservasi */}
        {showReservationModal && selectedTable && timeRemaining !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
              <div className="text-center">
                {/* Icon Success */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                {/* Judul */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  ✅ Reservasi Berhasil!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Terima kasih, <span className="font-semibold text-blue-600">{customerName}</span>
                </p>

                {/* Info Meja */}
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="text-6xl mb-3">🪑</div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">
                    Meja #{selectedTable.number}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Kapasitas: {selectedTable.capacity} orang
                  </p>
                </div>

                {/* Timer */}
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 mb-6 text-white">
                  <p className="text-sm font-semibold mb-2">⏱️ Waktu Menuju Meja</p>
                  <div className="text-5xl font-bold mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm opacity-90">
                    Silakan segera menuju ke meja Anda
                  </p>
                </div>

                {/* Instruksi */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                  <p className="text-sm text-yellow-800">
                    <strong>📍 Petunjuk:</strong><br />
                    • Segera menuju ke meja #{selectedTable.number}<br />
                    • Klik tombol "Sudah Sampai" saat tiba<br />
                    • Timer akan berganti menjadi waktu makan (30 menit)
                  </p>
                </div>

                {/* Tombol */}
                <button
                  onClick={closeModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg"
                >
                  Mengerti, Saya Akan Ke Meja Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timer Display */}
        {selectedTable && timeRemaining !== null && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Meja #{selectedTable.number}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentPhase === 'walking' 
                ? '⏱️ Waktu menuju ke meja' 
                : '🍽️ Waktu makan'}
            </p>
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {formatTime(timeRemaining)}
            </div>
            {currentPhase === 'walking' && (
              <button
                onClick={handleArriveAtTable}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ✓ Saya Sudah Sampai di Meja
              </button>
            )}
          </div>
        )}

        {/* Name Input */}
        {!selectedTable && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <label className="block text-gray-700 font-semibold mb-2">
              Nama Anda:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Available Tables */}
        {!selectedTable && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Semua Meja ({tables.length})
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => {
                const isAvailable = table.status === 'available';
                return (
                  <button
                    key={table.id}
                    onClick={() => isAvailable && handleReserveTable(table)}
                    disabled={!isAvailable}
                    className={`p-6 rounded-lg shadow transition-all ${
                      isAvailable
                        ? 'bg-gray-100 border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl cursor-pointer'
                        : 'bg-white border-2 border-red-500 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {isAvailable ? '🪑' : '🔒'}
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        Meja {table.number}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Kapasitas: {table.capacity} orang
                      </div>
                      <div className={`mt-2 font-semibold ${
                        isAvailable ? 'text-gray-600' : 'text-red-600'
                      }`}>
                        {isAvailable ? '✓ Tersedia' : '✗ Terisi'}
                      </div>
                      {!isAvailable && table.customerName && (
                        <div className="mt-1 text-xs text-gray-500">
                          {table.customerName}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {availableTables.length === 0 && (
              <div className="text-center py-8 mt-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-5xl mb-3">⏳</div>
                <p className="text-lg font-semibold text-gray-700">Semua meja sedang terisi</p>
                <p className="text-gray-600">Silakan tunggu beberapa saat</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
