# 🔴 Troubleshooting: Backend Offline Error

## Situasi
```
"Pesanan disimpan lokal (Backend sedang offline) ID: OFFLINE_1772273964618"
```

**Artinya:** Frontend gagal terhubung ke backend di `http://localhost:3000/api`

---

## Tech Stack Anda
| Komponen | Teknologi | Port |
|----------|-----------|------|
| **Frontend** | Ionic + Vite | 5173 |
| **Backend** | Express.js | 3000 |
| **Database** | SQLite | resto.db |

---

## ✅ SOLUSI SISTEMATIS

### STEP 1️⃣: CEK BACKEND BERJALAN?

#### A. Buka terminal BARU di folder `/backend`:
```powershell
cd backend
npm start
# Atau jika pakai nodemon untuk development:
npm run dev
```

**Output yang diharapkan:**
```
🚀 Server running at http://localhost:3000
📝 API Documentation:
   POST   /api/transactions - Create transaction
   GET    /api/transactions - Get all transactions
   ...
```

#### B. Jika ERROR: `port already in use`
Backend sudah jalan di port lain, atau port 3000 sedang digunakan. Solusi:
```powershell
# Di Windows PowerShell: Cari process di port 3000
Get-NetTCPConnection -LocalPort 3000 | Select ProcessName

# Atau matikan frontend di VS Code (Ctrl+C di terminal Vite)
# dan coba lagi
```

---

### STEP 2️⃣: TEST KONEKSI BACKEND (dari browser)

Di browser Anda, kunjungi: **`http://localhost:3000/health`**

| Response | Makna | Solusi |
|----------|-------|--------|
| **Lihat JSON `{"status": "OK"}** | ✅ Backend aktif | Lanjut ke STEP 3 |
| **Error/Timeout** | ❌ Backend tidak jalan | Kembali ke STEP 1 |
| **`Cannot GET /health`** | ❌ Backend tidak memiliki endpoint ini | Update backend (lihat catatan di bawah) |

---

### STEP 3️⃣: CEK CORS & NETWORK di Browser

#### A. Buka **Chrome DevTools (F12)**

#### B. Tab **Console** - cari pesan error:
```javascript
// Jika ada error seperti:
❌ CORS policy: No 'Access-Control-Allow-Origin' header
❌ Failed to fetch from http://localhost:3000/api/transactions
❌ TypeError: Failed to fetch

// Lihat STEP 5 untuk solusi
```

#### C. Tab **Network** - lakukan step berikut:

1. Di aplikasi, buat order dan klik "Konfirmasi Pesanan"
2. Di DevTools → Network tab, cari request ke `/api/transactions`
3. Lihat kolom Status:

| Status | Makna |
|--------|-------|
| **200 / 201** | ✅ Request sukses |
| **400 / 422** | Validasi error |
| **500** | Backend error |
| **0** (merah) | Koneksi putus/timeout |
| **(error) (CORS)** | CORS issue |

---

### STEP 4️⃣: CEK DATABASE

#### A. Verifikasi file database ada:
```powershell
# Di folder backend/
ls | grep "resto.db"
# Atau di Windows Explorer: Backend folder → cari file "resto.db"
```

#### B. CEK koneksi database:
```powershell
cd backend
node test-transaction.js
```

**Output yang diharapkan:**
```
✅ Database connected
✅ Schema created
Test transaction saved successfully!
ID: TRX_20250228_120530
```

---

### STEP 5️⃣: DIAGNOSA ERROR SPESIFIK

#### **SCENARIO 1: Browser → CORS Error**
```
❌ Access to XMLHttpRequest at 'http://localhost:3000/api/transactions' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Penyebab:** Backend CORS tidak dikonfigurasi dengan benar

**Solusi:**
Pastikan di `backend/server.js` baris ~11:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // ← Harus sesuai!
  credentials: true
}));
```

---

#### **SCENARIO 2: Browser → Timeout / Cannot Reach**
```
❌ Failed to fetch
❌ net::ERR_CONNECTION_REFUSED
```

**Penyebab:** Backend tidak berjalan atau port salah

**Checklist:**
- [ ] Backend running? (lihat STEP 1 output)
- [ ] Port 3000 belum digunakan? (STEP 1B)
- [ ] `.env` di backend punya `PORT=3000`?

---

#### **SCENARIO 3: Request Masuk Backend Tapi Error 500**
Di Network tab, response body menunjukkan:
```json
{"error": "Internal server error", "message": "..."}
```

**Solusi:**
1. Lihat terminal backend untuk error details
2. CEK database connection (STEP 4)
3. CEK schema database sudah ada? (kembali ke test-transaction.js)

---

#### **SCENARIO 4: Sudah Offline, Data Tidak Sync**
Pesanan disimpan di localStorage tapi tidak otomatis sync ke backend saat online.

**Cek:**
```javascript
// Di Browser Console:
JSON.parse(localStorage.getItem('pending_transactions'))

// Seharusnya lihat array dengan pesanan yang tertunda
// Jika kosong, pesanan sudah di-sync
```

---

## 🛠️ CHECKLIST CEPAT

Sebelum report "backend error", pastikan sudah:

- [ ] Backend terminal menunjukkan `🚀 Server running at http://localhost:3000`
- [ ] Bisa akses `http://localhost:3000/health` di browser
- [ ] Di `.env` file: `VITE_API_URL=http://localhost:3000/api` (frontend) dan `PORT=3000` (backend)
- [ ] Tidak ada port conflict di port 3000
- [ ] Database file `resto.db` ada di folder backend
- [ ] Tidak ada firewall/antivirus yang blok port 3000

---

## 📊 Debugging: Cari Detail Error

### A. Di Terminal Backend (saat request masuk):
Seharusnya melihat log seperti:
```
POST /api/transactions 201
   ↓ (jika ada error, lihat di sini)
```

### B. Di Browser DevTools → Console
Ketik untuk melihat detail request yang gagal:
```javascript
// Lihat semua stored transactions
JSON.parse(localStorage.getItem('pending_transactions'))

// Cek status backend
await fetch('http://localhost:3000/health').then(r => r.json())
```

### C. Lihat Source Code Error Handler
Di `src/services/transactionService.ts` baris ~257, ada detailed logging:
```
❌ [createTransaction] REQUEST FAILED
```

Bacalah pesan error yang ditampilkan di console browser.

---

## 📞 Butuh Bantuan Lebih?

Jika masih error setelah langkah di atas, kumpulkan:

1. **Screenshot atau copy-paste:**
   - Output dari terminal backend (STEP 1)
   - Error di Browser Console (STEP 3B)
   - Network tab status (STEP 3C)

2. **Jalankan script diagnostik:**
   ```powershell
   node backend/test-transaction.js
   ```
   Copy-paste hasilnya.

Dengan informasi itu, problem pasti bisa diidentifikasi!
