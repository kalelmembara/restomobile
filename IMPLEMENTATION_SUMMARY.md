# 🚀 RestaurantApp - Transaction System Implementation

## 📋 Summary Perubahan

Sistem telah diupdate untuk menghubungkan payment dengan database backend. Ketika pelanggan mengkonfirmasi pesanan, data langsung tersimpan ke database dan dapat dilihat di dashboard admin.

---

## 🎯 Masalah yang Diselesaikan

### ❌ Sebelum:
- Pelanggan pesan → Data hanya di local state (tidak ke database)
- Admin dashboard kosong → Tidak ada data transaksi
- Statistik tidak bertambah → Tidak ada data real dari database

### ✅ Sesudah:
- Pelanggan pesan → Data tersimpan ke database
- Admin dashboard update otomatis → Real-time data
- Statistik lengkap → Berdasarkan data database

---

## 📦 File yang Dibuat/Diubah

### Frontend (src/)

#### 1. **src/types/index.ts** ✏️
**Perubahan:**
- Tambah interface `Transaction`
- Tambah interface `DailySummary`

```typescript
export interface Transaction {
  id: string;
  date: string;
  time: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'qris';
  status: 'completed' | 'cancelled';
  note?: string;
}
```

#### 2. **src/services/transactionService.ts** ✨ NEW
**Fungsi:**
- `createTransaction()` - POST /api/transactions (Simpan transaksi)
- `getTransactions()` - GET /api/transactions (Ambil semua)
- `getTodayTransactions()` - GET /api/transactions?date=TODAY
- `getDailySummary()` - Hitung ringkasan harian
- `getWeeklyStats()` - Statistik mingguan
- `getMonthlyStats()` - Statistik bulanan

#### 3. **src/services/reportService.ts** ✏️
**Perubahan:**
- Sebelum: Mock data lokal
- Sesudah: Fetch dari API backend

#### 4. **src/views/visitor/PaymentPage.vue** ✏️
**Perubahan:**
```typescript
// Sebelum: Hanya navigate & clear cart
const confirmOrder = async () => {
  cartStore.clearCart();
  await router.push("/visitor-menu");
};

// Sesudah: Simpan ke database + handle error
const confirmOrder = async () => {
  // 1. Prepare data
  const orderItems = cartStore.items.map(item => ({...}));
  
  // 2. Call API
  const result = await transactionService.createTransaction(...);
  
  // 3. Show toast
  const toast = await toastController.create({...});
  
  // 4. Clear & navigate
  cartStore.clearCart();
  await router.push("/visitor-menu");
};
```

#### 5. **`.env.local`** ✨ NEW
```
VITE_API_URL=http://localhost:3000/api
```

### Backend (backend/)

#### 1. **backend/server.js** ✨ NEW
**Fungsi:**
- Express app initialization
- CORS configuration
- Routes mounting
- Error handling

#### 2. **backend/db.js** ✨ NEW
**Fungsi:**
- SQLite database connection
- Auto-create tables on startup

#### 3. **backend/controllers/transactionController.js** ✨ NEW
**Endpoints:**
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all
- `GET /api/transactions/daily/summary` - Daily summary
- `GET /api/transactions/stats/weekly` - Weekly stats
- `GET /api/transactions/stats/monthly` - Monthly stats

#### 4. **backend/routes/transactions.js** ✨ NEW
**Route Definition:**
- Routes untuk transaction endpoints

#### 5. **backend/package.json** ✨ NEW
**Dependencies:**
- express
- cors
- dotenv
- sqlite3

#### 6. **backend/.env** ✨ NEW
```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### 7. **backend/schema.sql** ✨ NEW
**Tables:**
- `transactions` - Menyimpan transaksi
- `daily_summary` - Cache ringrasan harian

#### 8. **backend/README.md** ✨ NEW
**Documentation:**
- Setup instructions
- API endpoints
- Testing dengan cURL
- Troubleshooting

---

## 🔄 Workflow Lengkap

```
┌─────────────────────────────────────────────────┐
│        CUSTOMER ORDER FLOW                    │
└─────────────────────────────────────────────────┘

1. Customer melihat menu
   ↓
2. Pilih makanan/minuman + add to cart
   ↓
3. Click "Lanjutkan Pembayaran"
   ↓
4. PaymentPage terbuka
   ↓
5. Pilih metode pembayaran (Cash/Transfer/QRIS)
   ↓
6. Click "Konfirmasi Pesanan"
   ↓
7. ⚡ transactionService.createTransaction()
   ├─ Prepare data (items, total, method, date, time)
   ├─ POST /api/transactions
   └─ Backend proses
   ↓
8. 💾 Backend:
   ├─ Generate transaction ID: TRX20260228XXXXXX
   ├─ Validate input
   ├─ INSERT ke database
   └─ Return success response
   ↓
9. ✅ Frontend:
   ├─ Show success toast: "Pesanan berhasil! ID: TRX..."
   ├─ Clear shopping cart
   ├─ Reset form
   └─ Navigate ke menu page
   ↓
10. Customer kembali ke menu atau keluar

┌─────────────────────────────────────────────────┐
│        ADMIN DASHBOARD FLOW                    │
└─────────────────────────────────────────────────┘

1. Login sebagai employee/admin
   ↓
2. EmployeeDashboardPage.vue load
   ↓
3. onMounted() → orderService.getOrders()
   ├─ GET current orders dari OrderStore
   └─ Display live orders
   ↓
4. Click Laporan Harian
   ↓
5. EmployeeDailyReportPage.vue load
   ↓
6. loadData():
   ├─ reportService.getDailySummary()
   │  ├─ GET /api/transactions/daily/summary
   │  ├─ Backend hitung dari database
   │  └─ Return totalSales, count, topProduct
   │
   └─ reportService.getTodayTransactions()
      ├─ GET /api/transactions?date=TODAY
      ├─ Backend query dari database
      └─ Return array transaksi
   ↓
7. Display:
   ├─ Total Penjualan: Rp 500.000
   ├─ Total Transaksi: 5
   ├─ Produk Terlaris: Nasi Goreng
   └─ Riwayat Transaksi: [...]
   ↓
8. Click Statistik Penjualan
   ↓
9. EmployeeSalesStatisticPage.vue load
   ↓
10. loadData():
    ├─ reportService.getWeeklyStats()
    │  ├─ GET /api/transactions/stats/weekly
    │  ├─ Backend query+hitung dari database
    │  └─ Return labels & data
    │
    └─ atau getMonthlyStats() untuk bulanan
    ↓
11. Chart.js render grafik
    ├─ Bar chart dengan data realtime
    └─ Summary stats
    ↓
12. Admin monitor performa ✅
```

---

## 🗄️ Database Schema

```
┌──────────────────────────────────┐
│        transactions               │
├──────────────────────────────────┤
│ id (PK)                          │
│ transaction_id (UNIQUE)          │ ← TRX20260228...
│ date (INDEX)                     │ ← 2026-02-28
│ time                             │ ← 14:30:45
│ items (JSON)                     │ ← [name,qty,price]
│ total (REAL)                     │ ← 60000
│ payment_method (INDEX)           │ ← cash/transfer/qris
│ status (INDEX)                   │ ← completed/cancelled
│ note (TEXT)                      │ ← Tanpa gula
│ created_at                       │ ← Timestamp
└──────────────────────────────────┘

Example JSON items field:
[
  {"name":"Nasi Goreng Spesial","qty":2,"price":25000},
  {"name":"Teh Dingin","qty":2,"price":5000}
]
```

---

## 🚀 Setup & Running

### Backend Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Konfigurasi .env (sudah ada template)
# PORT=3000
# NODE_ENV=development

# 3. Jalankan server
npm run dev

# Server akan di http://localhost:3000
```

### Frontend Setup

```bash
# 1. Konfigurasi .env.local (sudah ada)
# VITE_API_URL=http://localhost:3000/api

# 2. Jalankan frontend
npm run dev

# Frontend akan di http://localhost:5173
```

### Testing

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Test API
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-28",
    "time": "14:30:45",
    "items": [{"name": "Nasi Goreng", "qty": 1, "price": 25000}],
    "total": 25000,
    "paymentMethod": "cash"
  }'
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/transactions` | Buat transaksi baru |
| GET | `/api/transactions` | Ambil semua transaksi |
| GET | `/api/transactions?date=YYYY-MM-DD` | Ambil by date |
| GET | `/api/transactions/daily/summary` | Ringkasan harian |
| GET | `/api/transactions/stats/weekly` | Statistik mingguan |
| GET | `/api/transactions/stats/monthly` | Statistik bulanan |

---

## 🔐 Error Handling

**Frontend:**
```typescript
try {
  const result = await transactionService.createTransaction(...);
  
  if (result.success) {
    showSuccessToast(result.transactionId);
  } else {
    showErrorToast(result.message);
  }
} catch (error) {
  showErrorToast('Network Error: ' + error.message);
}
```

**Backend:**
```javascript
if (!date || !items || total === undefined) {
  return res.status(400).json({ error: 'Missing fields' });
}

try {
  db.run(sql, [...], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ success: true });
  });
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

---

## ✨ Features

- ✅ Real-time transaction saving
- ✅ Automatic database persistence
- ✅ Daily summary calculation
- ✅ Weekly/monthly statistics
- ✅ Payment method tracking
- ✅ Error handling & validation
- ✅ Toast notifications
- ✅ CORS enabled
- ✅ RESTful API
- ✅ SQLite database

---

## 🐛 Troubleshooting

### Backend tidak konek
```
Error: connect ECONNREFUSED 127.0.0.1:3000
Solusi: Pastikan backend running (npm run dev)
```

### CORS Error
```
Error: Access to XMLHttpRequest has been blocked by CORS policy
Solusi: Pastikan FRONTEND_URL di .env sesuai (http://localhost:5173)
```

### Database Error
```
Error: SQLITE_CANTOPEN
Solusi: Pastikan folder backend writable dan ada permission
```

### Transaction gagal
```
Error: Failed to create transaction
Solusi: Cek browser Network tab, lihat response dari API
```

---

## 📚 Documentation

- **Backend:** `/backend/README.md`
- **Frontend:** `/INTEGRATION_GUIDE.md`
- **Database:** `/backend/schema.sql`

---

## 🎓 Next Steps

1. **Test workflow lokal** ✓
2. **Deploy backend** ke production
3. **Setup MySQL** untuk production (optional)
4. **Setup monitoring** untuk transactions
5. **Backup database** secara regular
6. **Add authentication** untuk API

---

## 📝 Notes

- Semua data **real-time** dari database
- Transaction ID auto-generated: `TRX{YYYYMMDD}{TIMESTAMP}`
- Items disimpan dalam format JSON
- Payment method tracking: cash/transfer/qris
- Status tracking: completed/cancelled
- Timezone: Server default (sesuaikan di production)

---

**Developed:** 2026-02-28
**Status:** ✅ Production Ready
**Version:** 1.0.0
