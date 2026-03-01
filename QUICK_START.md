# ⚡ Quick Start Guide

## 1️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

## 2️⃣ Start Backend Server

```bash
npm run dev
```

✅ Backend running di: `http://localhost:3000`

## 3️⃣ Start Frontend (dalam terminal baru)

```bash
npm run dev
```

✅ Frontend running di: `http://localhost:5173`

## 4️⃣ Test Workflow

### Scenario: Customer Order → Admin See Data

**Step 1: Login as Visitor**
- Open http://localhost:5173
- Pilih "Visitor" / "Sebagai Pelanggan"

**Step 2: Order Food**
- Pilih beberapa menu (Nasi Goreng, Teh Dingin, dll)
- Click "Lanjutkan Pembayaran"

**Step 3: Payment Confirmation**
- Pilih metode pembayaran (Cash)
- Click "Konfirmasi Pesanan"
- ✅ You should see: "Pesanan berhasil! ID: TRX..."
- Cart otomatis clear & return ke menu

**Step 4: Check Admin Dashboard**
- Logout dari visitor
- Login as Employee ("Sebagai Pegawai") - password: `pegawai`
- Di Dashboard:
  - "Pesanan Hari Ini" sudah update
  - "Penjualan" sudah update
- Click "Laporan Harian":
  - Total Penjualan: Rp XX
  - Total Transaksi: 1
  - Riwayat Transaksi: Lihat order baru
- Click "Statistik Penjualan":
  - Grafik menunjukkan penjualan hari ini

## 5️⃣ Testing with cURL

```bash
# Create transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-28",
    "time": "14:30:45",
    "items": [
      {"name": "Nasi Goreng", "qty": 2, "price": 25000},
      {"name": "Teh Dingin", "qty": 2, "price": 5000}
    ],
    "total": 60000,
    "paymentMethod": "cash",
    "note": "Tanpa gula"
  }'

# Response:
# {"success":true,"id":"TRX202602281430","transactionId":"TRX202602281430","message":"Transaction created successfully"}
```

```bash
# Get daily summary
curl http://localhost:3000/api/transactions/daily/summary?date=2026-02-28

# Response:
# {"totalSales":60000,"transactionCount":1,"topProduct":"Nasi Goreng"}
```

```bash
# Get weekly stats
curl http://localhost:3000/api/transactions/stats/weekly

# Response:
# {"labels":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"data":[0,0,60000,0,0,0,0]}
```

## 🔧 Configuration

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📂 Project Structure

```
restoapp/
├── src/                          # Frontend source
│   ├── services/
│   │   ├── transactionService.ts # NEW: Transaction API
│   │   └── reportService.ts      # UPDATED: Use API
│   ├── views/
│   │   └── visitor/
│   │       └── PaymentPage.vue   # UPDATED: Save to DB
│   └── types/
│       └── index.ts              # UPDATED: Add Transaction interface
│
├── backend/                       # NEW: Backend API
│   ├── server.js                 # Express app
│   ├── db.js                     # SQLite connection
│   ├── controllers/
│   │   └── transactionController.js
│   ├── routes/
│   │   └── transactions.js
│   ├── package.json
│   ├── .env
│   ├── schema.sql
│   └── README.md
│
├── .env.local                     # NEW: Frontend config
├── INTEGRATION_GUIDE.md           # NEW: Documentation
├── IMPLEMENTATION_SUMMARY.md      # NEW: Summary
└── QUICK_START.md                # You are here
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `connect ECONNREFUSED` | Backend tidak running. Jalankan `cd backend && npm run dev` |
| `CORS Error` | Pastikan `.env` backend punya `FRONTEND_URL=http://localhost:5173` |
| `Cannot find module...` | Jalankan `npm install` di backend |
| `SQLITE_CANTOPEN` | Folder backend harus writable |
| Transaction tidak tersimpan | Cek browser Network tab, lihat API response |

## 📚 Full Documentation

- **Detailed Setup:** `INTEGRATION_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Backend Docs:** `backend/README.md`
- **Database Schema:** `backend/schema.sql`

## 🎯 What's Next?

- ✅ Order & save to database
- ✅ Admin dashboard real-time update
- ✅ Transaction history & statistics
- 🟡 Add user authentication to API
- 🟡 Add payment gateway integration
- 🟡 Add email/SMS notifications
- 🟡 Deploy to production

---

**Everything is ready to use!** 🚀
