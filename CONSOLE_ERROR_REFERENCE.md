# 🔍 Browser Console Error Reference Guide

Ketika aplikasi offline, Anda akan melihat pesan di Browser Console. Panduan ini menjelaskan apa artinya dan cara mengatasinya.

---

## 1️⃣ CORS Error

### ❌ Pesan di Console:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/transactions' 
from origin 'http://localhost:5173' 
has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 🔍 Artinya:
Backend tidak mengizinkan request dari frontend (cross-origin issue).

### ✅ Solusi:

**Langkah 1: Cek backend/server.js**
```javascript
// Seharusnya ada:
app.use(cors({
  origin: 'http://localhost:5173',  // ← Harus sesuai dengan frontend URL
  credentials: true
}));
```

**Langkah 2: Verifikasi URL match**
| Bagian | Frontend | Backend | Status |
|--------|----------|---------|--------|
| Protocol | http:// | http:// | ✅ Match |
| Hostname | localhost | localhost | ✅ Match |  
| Port | 5173 | 3000 | ✅ Different (normal) |

**Langkah 3: Restart backend**
```powershell
# Terminal backend
Ctrl+C  # Stop backend
npm start  # Start ulang
```

---

## 2️⃣ Connection Refused (Backend Not Running)

### ❌ Pesan di Console:
```
TypeError: Failed to fetch
Cause: TypeError: Failed to fetch
    at createTransaction (transactionService.ts:150)

Network error:
Failed to fetch
Network Error: true
```

### 🔍 Artinya:
Frontend tidak bisa connect ke backend. Backend kemungkinan tidak berjalan.

### ✅ Solusi:

**Step 1: Check backend terminal**
```powershell
# Di PowerShell yang lain, cek apakah backend berjalan
cd d:\MobileApp\restoapp\backend

# Lihat ada apa:
npm start
# atau
npm run dev
```

**Step 2: Cek output**

**✅ Seharusnya lihat:**
```
🚀 Server running at http://localhost:3000
📝 API Documentation:
   POST   /api/transactions - Create transaction
   ...
```

**❌ Jika lihat error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```
→ Port 3000 sudah digunakan, lihat di bawah (Port Already in Use)

---

## 3️⃣ Timeout Error

### ❌ Pesan di Console:
```
DOMException: The operation was aborted.
Timeout: true

Error Type: AbortError
```

### 🔍 Artinya:
Backend tidak merespons dalam 10 detik. Ada 3 kemungkinan:
- Backend sangat lambat
- Database query hang
- Network connection problem

### ✅ Solusi:

**Checklist:**
1. Lihat terminal backend ada error?
2. Lihat Network tab di DevTools - state request apa (pending? completed?)
3. Check database di backend tidak corrupt

**Test:**
```powershell
# Terminal backend
node backend/test-transaction.js
```

**Output:**
```
✅ Database connected
✅ Schema created
Test transaction saved successfully!
```

Jika error disini → database problem

---

## 4️⃣ Port Already in Use (EADDRINUSE)

### ❌ Pesan di Console (Backend Terminal):
```
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenerHandle [as _listen2] (net.js:...)
```

### 🔍 Artinya:
Port 3000 sudah digunakan oleh aplikasi lain.

### ✅ Solusi:

**Option 1: Matikan aplikasi lain di port 3000**
```powershell
# Cari process di port 3000
Get-NetTCPConnection -LocalPort 3000 | Select ProcessName, ProcessId, State

# Output mungkin: 
# ProcessName  ProcessId  State
# ----------   ---------  -----
# node.exe     12345      Listen

# Kill process itu
Stop-Process -Id 12345 -Force

# Sekarang coba npm start lagi
npm start
```

**Option 2: Gunakan port berbeda**
```javascript
// Di backend/.env, ubah:
PORT=3000
// Ke:
PORT=3001

// Di frontend/.env.local, ubah:
VITE_API_URL=http://localhost:3000/api
// Ke:
VITE_API_URL=http://localhost:3001/api

// Restart both frontend dan backend
```

---

## 5️⃣ Database Error

### ❌ Pesan di Console (Backend Terminal):
```
Error: SQLITE_CANTOPEN: unable to open database file
    at Database.open (better-sqlite3/build/Release/better-sqlite3.node:...)
```

atau

```
Error: database schema incomplete
```

### 🔍 Artinya:
Database file tidak ada atau corrupted.

### ✅ Solusi:

**Step 1: Check database file exist**
```powershell
# Di folder backend
ls *.db
# Seharusnya lihat: resto.db
```

**Step 2: Jika tidak ada, buat ulang**
```powershell
cd backend
node test-transaction.js  # Ini akan create schema
```

**Step 3: Restart backend**
```powershell
npm start
```

---

## 6️⃣ 404 Endpoint Not Found

### ❌ Pesan di Console:
```
POST http://localhost:3000/api/transactions 404 (Not Found)

ErrorData: { error: "Endpoint not found" }
Status: 404
```

### 🔍 Artinya:
Backend tidak punya endpoint `/api/transactions`.

### ✅ Solusi:

**Check routes ada di backend/routes/transactions.js**
```javascript
// Seharusnya ada:
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
```

**Check server.js punya route ini**
```javascript
// Seharusnya ada:
app.use('/api/transactions', transactionRoutes);
```

---

## 7️⃣ Offline Queue di LocalStorage

### ℹ️ Check di Console:
```javascript
// Ketik di browser console:
JSON.parse(localStorage.getItem('pending_transactions'))

// Output:
[
  {
    id: "OFFLINE_1772273964618",
    date: "2025-02-28",
    time: "10:30:45",
    items: [{ name: "Nasi Kuning", qty: 2, price: 50000 }],
    total: 100000,
    customerName: "John",
    savedAt: "2025-02-28T10:30:45.123Z",
    syncAttempts: 0
  }
]
```

### 🔍 Artinya:
Data pesanan disimpan offline dan menunggu untuk di-sync ke backend.

### ✅ Apa selanjutnya:
1. **Backend online** → Transaction akan otomatis attempt sync
2. **Sync manual:**
   ```javascript
   await transactionService.syncOfflineTransactions()
   ```

---

## 8️⃣ Network Tab Analysis

Buka DevTools → Network Tab → Buat order → Cari request ke `/transactions`

### ✅ Successful Request (200/201)
```
Status: 201 Created
Headers:
  Request: POST /api/transactions, Content-Type: application/json
  Response: Content-Type: application/json
Response Body:
  {
    "id": "TRX20250228103045",
    "success": true
  }
```

### ❌ Failed Request (Lihat Status)

| Status | Artinya | Solusi |
|--------|---------|--------|
| **0** (Cancelled) | Request tidak selesai | Backend offline atau timeout |
| **400** | Validation error | Check field requirement |
| **404** | Endpoint tidak ada | Check routes |
| **500** | Server error | Check backend logs |
| **(CORS)** | CORS error | See CORS section above |

---

## 🛠️ Quick Diagnosis Flowchart

```
┌─ Muncul notifikasi: "Backend Offline"?
│
├─ YES, jalankan:
│  ├─ node backend-diagnostics.js
│  ├─ frontend-diagnostics.js di console
│  └─ Baca output di atas (section 1-8)
│
├─ ERROR CATEGORIES:
│  ├─ CORS_ERROR → Fix CORS header di server.js
│  ├─ CONNECTION_REFUSED → Start backend dengan npm start
│  ├─ TIMEOUT → Check backend performance / database
│  ├─ EADDRINUSE → Change port atau kill conflicting process
│  ├─ SQLITE_ERROR → Run test-transaction.js untuk create schema
│  ├─ 404_ENDPOINT → Check routes di backend
│  └─ 500_SERVER_ERROR → Check terminal backend untuk logs
│
└─ VERIFY:
   ├─ http://localhost:3000/health → 200 OK
   ├─ Create order → ID format TRXxxxxxxx (bukan OFFLINE_)
   └─ Check Network tab → Status 201
```

---

## 📋 Checklist untuk Troubleshooting

- [ ] Backend berjalan? → Terminal menampilkan `🚀 Server running at http://localhost:3000`
- [ ] Bisa akses health? → `http://localhost:3000/health` return JSON
- [ ] Port conflict? → `Get-NetTCPConnection -LocalPort 3000`
- [ ] Database exist? → `ls backend/*.db`
- [ ] CORS config? → Check `origin` di server.js
- [ ] Frontend URL match? → `.env.local: VITE_API_URL=http://localhost:3000/api`
- [ ] Network tab? → POST menunjukkan status 200 atau error?
- [ ] Offline queue? → `localStorage.getItem('pending_transactions')`

---

## 🎓 Pro Tips

### 1. Enable Verbose Logging
Di browser console:
```javascript
// Saat membuat order, lihat detailed logs di console
// Format color-coded:
// 🔵 = Info/Step
// 🟢 = Success
// 🟠 = Warning
// ❌ = Error
// 🔄 = Process
```

### 2. Network Throttling
Simulasikan slow network untuk test timeout handling:
```
DevTools → Network tab → Throttling dropdown
  Pilih: "Slow 3G" atau "Fast 3G"
  Test create order → lihat apakah timeout
```

### 3. Offline Mode Simulation
```
DevTools → Network tab → Offline checkbox
  ✓ Offline
  Coba create order → seharusnya langsung OFFLINE_
```

### 4. Clear Offline Queue
```javascript
// Di console:
localStorage.removeItem('pending_transactions');
location.reload();
```

---

## 📞 Butuh Bantuan?

1. **Baca file:** [DIAGNOSTIK_BACKEND_OFFLINE.md](DIAGNOSTIK_BACKEND_OFFLINE.md)
2. **Run script:** `node backend-diagnostics.js` dan `frontend-diagnostics.js`
3. **Kumpulkan:**
   - Screenshot console error
   - Backend terminal output
   - Network tab screenshot
4. **Share untuk support**
