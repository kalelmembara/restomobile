# Frontend Integration Guide

## Overview

Frontend telah diupdate untuk terintegrasi dengan backend API:

1. **PaymentPage.vue** - Menyimpan transaksi ke database saat tombol "Konfirmasi Pesanan" diklik
2. **EmployeeDashboardPage.vue** - Menampilkan statistik dari database
3. **EmployeeDailyReportPage.vue** - Menampilkan laporan transaksi dari database
4. **EmployeeSalesStatisticPage.vue** - Menampilkan grafik statistik dari database

## Setup

### 1. Install Dependencies (jika belum)
```bash
npm install
```

### 2. Configuration

Edit atau buat file `.env.local` di root folder frontend:
```
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Frontend
```bash
npm run dev
```

Frontend akan running di `http://localhost:5173`

## Services

### transactionService
File: `src/services/transactionService.ts`

Fungsi utama:
- `createTransaction()` - Menyimpan transaksi ke database
- `getTodayTransactions()` - Mengambil transaksi hari ini
- `getDailySummary()` - Menghitung ringkasan harian
- `getWeeklyStats()` - Mengambil statistik mingguan
- `getMonthlyStats()` - Mengambil statistik bulanan

### reportService
File: `src/services/reportService.ts`

Fungsi utama:
- `getDailySummary()` - Ringkasan penjualan harian
- `getTodayTransactions()` - Daftar transaksi hari ini
- `getWeeklyStats()` - Data untuk grafik mingguan
- `getMonthlyStats()` - Data untuk grafik bulanan

## Workflow

### 1. Customer Order
```
VisitorMenuPage
  ↓ (Pilih menu)
  ↓
CartStore (Simpan ke cart)
  ↓ (Klik lanjutkan)
  ↓
PaymentPage
  ↓ (Pilih metode pembayaran)
  ↓ (Klik "Konfirmasi Pesanan")
  ↓
transactionService.createTransaction()
  ↓ (POST /api/transactions)
  ↓
Backend (Simpan ke database)
  ↓
Success Toast ✅
  ↓
Kembali ke VisitorMenuPage
  ↓
CartStore cleared
```

### 2. Admin Dashboard
```
EmployeeDashboardPage
  ↓ (Load data)
  ↓
orderService.getOrders() [dari CartStore/Local]
  ↓ (Menampilkan orders)
```

### 3. Employee Reports
```
EmployeeDailyReportPage
  ↓ (Load data)
  ↓
reportService.getDailySummary()
  ↓ (GET /api/transactions/daily/summary)
  ↓
Backend (Hitung dari database)
  ↓
reportService.getTodayTransactions()
  ↓ (GET /api/transactions?date=TODAY)
  ↓
Backend (Ambil dari database)
  ↓
Tampilkan hasil ✅
```

### 4. Employee Statistics
```
EmployeeSalesStatisticPage
  ↓ (Load data)
  ↓
reportService.getWeeklyStats() atau getMonthlyStats()
  ↓ (GET /api/transactions/stats/weekly/monthly)
  ↓
Backend (Hitung dari database)
  ↓
Chart.js (Render grafik)
  ↓
Tampilkan hasil ✅
```

## Updated Components

### PaymentPage.vue
**Changes:**
- Import `transactionService`
- Import `toastController` dari Ionic
- Update `confirmOrder()` function:
  ```typescript
  const confirmOrder = async () => {
    // 1. Prepare transaction data
    // 2. Call transactionService.createTransaction()
    // 3. Show success/error toast
    // 4. Clear cart
    // 5. Navigate to menu
  };
  ```

### EmployeeDailyReportPage.vue
**Changes:**
- `loadData()` function sudah call `reportService.getDailySummary()`
- `loadData()` function sudah call `reportService.getTodayTransactions()`
- Statistik otomatis update dari database

### EmployeeSalesStatisticPage.vue
**Changes:**
- `loadData()` function sudah call `reportService.getWeeklyStats()` atau `getMonthlyStats()`
- Grafik otomatis update dari database

## Error Handling

Semua services sudah include error handling dengan `try/catch`:

```typescript
try {
  const result = await transactionService.createTransaction(...);
  
  if (result.success) {
    // Berhasil
    showSuccessToast(result.transactionId);
  } else {
    // Gagal
    showErrorToast(result.message);
  }
} catch (error) {
  // Network error atau error lainnya
  console.error(error);
  showErrorToast('Error: ' + error.message);
}
```

## Testing

### 1. Local Testing
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend  
npm run dev

# Terminal 3: Test dengan cURL
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### 2. Test Workflow
1. Buka `http://localhost:5173`
2. Login sebagai visitor
3. Pilih menu makanan/minuman
4. Klik lanjutkan ke pembayaran
5. Pilih metode pembayaran
6. Klik "Konfirmasi Pesanan"
7. Lihat success toast dengan transaction ID
8. Login sebagai employee
9. Lihat dashboard/reports/stats sudah update

## Troubleshooting

### Transaksi Gagal Tersimpan
**Kemungkinan:**
- Backend tidak running
- API URL salah di `.env.local`
- CORS error

**Solusi:**
1. Cek backend running: `curl http://localhost:3000/health`
2. Cek browser console untuk error message
3. Cek `.env.local` VITE_API_URL

### Dashboard tidak update
**Kemungkinan:**
- Data belum tersimpan di database
- Page belum refresh
- API error

**Solusi:**
1. Cek browser Network tab untuk API calls
2. Refresh page
3. Lihat backend console untuk error

### CORS Error
**Error:** `Access-Control-Allow-Origin`

**Solusi:**
1. Pastikan backend running
2. Cek `.env` di backend:
   ```
   FRONTEND_URL=http://localhost:5173
   ```
3. Restart backend

## Production Checklist

- [ ] Backend running di production server
- [ ] Frontend build: `npm run build`
- [ ] Update `.env.local` to production API URL
- [ ] SSL/TLS configured
- [ ] Database backup setup
- [ ] Error logging setup
- [ ] Monitor API performance

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Vue 3 Documentation](https://vuejs.org/)
- [Ionic Vue Documentation](https://ionicframework.com/docs/vue/overview)
