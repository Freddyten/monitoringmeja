# Sistem Monitoring Meja Restoran

Aplikasi web untuk monitoring dan manajemen meja restoran secara real-time dengan sistem timer otomatis.

## 🎯 Fitur Utama

1. **Customer Interface** - Scan QR untuk melihat meja tersedia dan reservasi
2. **Timer Otomatis** - 10 menit untuk menuju meja + 30 menit untuk makan
3. **Staff Cleaning Interface** - Scan QR meja untuk proses pembersihan
4. **Dashboard Real-time** - Monitor semua status meja secara langsung

## 🚀 Cara Menggunakan

### Instalasi

```bash
npm install
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📱 Alur Penggunaan

### 1. Customer
- Scan QR tenant → Masuk ke `/customer`
- Masukkan nama dan pilih meja yang tersedia
- Timer 10 menit dimulai (waktu menuju meja)
- Klik "Sudah Sampai" saat tiba di meja
- Timer 30 menit dimulai (waktu makan)
- Setelah selesai, meja otomatis berstatus "needs cleaning"

### 2. Staff Cleaning
- Akses `/cleaning`
- Scan QR meja atau input nomor meja
- Mulai proses pembersihan
- Meja otomatis tersedia kembali setelah 5 menit

### 3. Admin Dashboard
- Akses `/dashboard`
- Lihat status semua meja real-time
- Monitor timer yang sedang berjalan
- Statistik meja tersedia/terisi/kotor

## 🎨 Status Meja

- ✅ **Available** - Meja kosong dan bersih
- ⏱️ **Reserved** - Customer menuju meja (10 menit)
- 🍽️ **Occupied** - Customer sedang makan (30 menit)
- ⚠️ **Needs Cleaning** - Menunggu staff pembersihan
- 🧹 **Cleaning** - Sedang dibersihkan (5 menit)

## 📡 API Endpoints

- `GET /api/tables` - Dapatkan semua meja
- `POST /api/tables/[id]/reserve` - Reservasi meja
- `POST /api/tables/[id]/occupy` - Mulai makan di meja
- `POST /api/tables/[id]/finish` - Selesai makan
- `POST /api/tables/[id]/clean` - Mulai pembersihan

## 🔧 Teknologi

- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **REST API** - Backend Communication

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
