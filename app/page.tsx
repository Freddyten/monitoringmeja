export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Sistem Monitoring Meja Restoran
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card Customer */}
          <a 
            href="/customer" 
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Customer</h2>
              <p className="text-gray-600">Scan QR untuk melihat meja kosong dan reservasi</p>
            </div>
          </a>

          {/* Card Staff Cleaning */}
          <a 
            href="/cleaning" 
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🧹</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Staff Cleaning</h2>
              <p className="text-gray-600">Scan QR meja untuk membersihkan meja</p>
            </div>
          </a>

          {/* Card Admin Dashboard */}
          <a 
            href="/dashboard" 
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Dashboard</h2>
              <p className="text-gray-600">Monitor semua meja secara real-time</p>
            </div>
          </a>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Cara Kerja Sistem:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Customer scan QR code tenant untuk memesan meja yang tersedia</li>
            <li>Customer pilih meja - Timer 10 menit dimulai untuk menuju ke meja</li>
            <li>Setelah sampai di meja, timer 30 menit dimulai untuk waktu makan</li>
            <li>Setelah selesai, customer meninggalkan meja (status: needs cleaning)</li>
            <li>Staff cleaning scan QR di meja untuk membersihkan</li>
            <li>Setelah dibersihkan, meja kembali tersedia untuk customer baru</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
