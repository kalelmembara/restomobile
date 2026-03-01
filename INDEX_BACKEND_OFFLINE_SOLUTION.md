# 📖 BACKEND OFFLINE: SOLUSI LENGKAP

## 🎯 Masalah Anda

```
❌ "Pesanan disimpan lokal (Backend sedang offline) ID: OFFLINE_1772273964618"
```

Aplikasi Anda di `http://localhost:5173` tidak bisa terhubung ke backend di `http://localhost:3000`.

---

## ⚡ MULAI DARI SINI: 3 Pilihan Solusi

### 🚀 **PILIHAN 1: Quick Fix (5 Menit)**
Jika Anda terburu-buru dan ingin cepat online:

**→ Buka:** [QUICK_FIX_BACKEND_OFFLINE.md](QUICK_FIX_BACKEND_OFFLINE.md)

**Yang akan Anda lakukan:**
1. Buka PowerShell baru
2. Run `npm start` di folder backend
3. Refresh aplikasi di browser
4. Done! ✅

---

### 🔍 **PILIHAN 2: Step-by-Step Diagnosis (15-20 Menit)**
Jika Anda ingin paham apa penyebabnya:

**→ Buka:** [DIAGNOSTIK_BACKEND_OFFLINE.md](DIAGNOSTIK_BACKEND_OFFLINE.md)

**Akan cover:**
- 5 langkah diagnosis sistematis
- Penjelasan tech stack Anda
- 4 scenario umum + solusinya
- Cara membaca Network tab di DevTools
- Checklist lengkap

---

### 🛠️ **PILIHAN 3: Auto Diagnostics (1 Menit)**
Jika Anda ingin script yang langsung test semuanya:

**Script Backend:**
```powershell
node backend-diagnostics.js
```
Script ini test:
- Backend running? ✓
- Health endpoint? ✓
- POST endpoint? ✓
- GET endpoint? ✓
- CORS config? ✓

**Script Frontend (di Browser Console):**
1. Tekan F12
2. Klik tab Console
3. Copy-paste isi file: `frontend-diagnostics.js`
4. Auto test dari browser

---

## 📚 Dokumentasi yang Tersedia

| File | Gunakan Saat | Waktu |
|------|-------------|--------|
| [QUICK_FIX_BACKEND_OFFLINE.md](QUICK_FIX_BACKEND_OFFLINE.md) | Terburu-buru | 5 menit |
| [DIAGNOSTIK_BACKEND_OFFLINE.md](DIAGNOSTIK_BACKEND_OFFLINE.md) | Ingin paham detail | 20 menit |
| [CONSOLE_ERROR_REFERENCE.md](CONSOLE_ERROR_REFERENCE.md) | Lihat error specific | 10 menit |
| backend-diagnostics.js | Test backend endpoints | 1 menit |
| frontend-diagnostics.js | Test dari browser | 1 menit |
| [IMPROVEMENTS_APPLIED.md](IMPROVEMENTS_APPLIED.md) | Lihat perubahan kode | 10 menit |

---

## 🔧 Yang Sudah Saya Perbaiki

### 1. **Code Improvements** 
✅ File: `src/services/transactionService.ts`
- Penambahan error categorization (CORS_ERROR, CONNECTION_REFUSED, dll)
- Better error logging dengan diagnostic hints
- New method: `syncOfflineTransactions()` untuk manual sync
- Enhanced offline queue tracking (savedAt, syncAttempts)

### 2. **Diagnostic Scripts**
✅ File: `backend-diagnostics.js`
- Auto-test semua endpoints backend
- Report detail dengan response time
- CORS validation
- Color-coded output

✅ File: `frontend-diagnostics.js`
- Test dari browser console
- Check environment variables
- Validate CORS headers
- Check offline queue status

### 3. **Documentation**
✅ 4 Markdown files dengan penjelasan detail

---

## ✅ Quick Checklist: Backend Harus Aktif

Sebelum coba aplikasi, pastikan:

- [ ] **Backend berjalan**: Terminal menunjukkan `🚀 Server running at http://localhost:3000`
- [ ] **Health endpoint**: Buka `http://localhost:3000/health` di browser → lihat JSON `{"status":"OK"}`
- [ ] **Port tidak conflict**: Tidak ada aplikasi lain di port 3000
- [ ] **Database ada**: File `resto.db` ada di folder `backend/`
- [ ] **Environment match**: `.env.local` punya `VITE_API_URL=http://localhost:3000/api`

Jika semua ✅, refresh aplikasi → pesanan seharusnya online!

---

## 🚨 Quick Diagnosis

Jika masih mendapat error "Backend Offline" ** setelah check di atas, jalankan:

```powershell
# Terminal 1: Test backend
node backend-diagnostics.js

# Terminal 2: Lihat backend logs
cd backend && npm start
```

**Lihat output error apa** → Banding dengan [CONSOLE_ERROR_REFERENCE.md](CONSOLE_ERROR_REFERENCE.md) untuk solusi spesifik.

---

## 🎓 Tech Stack Referensi

```
┌─ Frontend ─────────────────────┐
│  Ionic + Vue3 + Vite           │
│  Port: http://localhost:5173   │─────────┐
│  API calls ke: localhost:3000  │         │
└────────────────────────────────┘         │
                                           │ HTTP
                                           │ REST
┌─ Backend ──────────────────────┐         │
│  Express.js                    │◄────────┘
│  Port: http://localhost:3000   │
│  Routes: /api/transactions     │
└────────────────────────────────┘
         │
         │ SQL Insert/Select
         │
┌─ Database ─────────────────────┐
│  SQLite (resto.db)             │
│  Tables: transactions          │
└────────────────────────────────┘
```

---

## 🔄 Flow: Order Creation

```
USER ACTION
    │
    ├─ Fill cart → click "Konfirmasi Pesanan"
    │
    ├─ Frontend: POST to http://localhost:3000/api/transactions
    │
    ├─ Backend Checks:
    │  ├─ Parse JSON request ✓
    │  ├─ Validate fields ✓
    │  ├─ Generate transaction ID ✓
    │  └─ Insert to SQLite ✓
    │
    ├─ Response 201: {"id": "TRX20250228..."}
    │
    └─ SUCCESS: Show toast "Pesanan berhasil!"

JIKA GAGAL:

USER ACTION
    │
    └─ Frontend: TRY POST to http://localhost:3000
       │
       ├─ Backend tidak running
       │  └─ ERR: Connection Refused
       │
       ├─ Frontend catches error
       │  └─ Save ke localStorage: OFFLINE_{timestamp}
       │
       └─ Show toast: "Pesanan disimpan lokal (Backend offline)"
```

---

## 📞 Quick Support Reference

**Problem → Solution**

| Problem | Check | Fix |
|---------|-------|-----|
| "Backend Offline" | `npm start` di backend folder? | Ya → Lanjut. Tidak → Run `npm start` |
| Still offline | Port 3000 conflict? | `Get-NetTCPConnection -LocalPort 3000` |
| Port conflict | Kill process | `Stop-Process -Id {PID} -Force` |
| CORS error | Frontend URL di server.js? | Check origin in CORS config |
| Database error | `resto.db` exist? | Run `node backend/test-transaction.js` |
| Network timeout | Backend slow? | Check logs di terminal backend |

---

## 🆘 I'm Still Stuck!

1. **Baca:** [DIAGNOSTIK_BACKEND_OFFLINE.md](DIAGNOSTIK_BACKEND_OFFLINE.md) - Very detailed step-by-step
2. **Run:** `node backend-diagnostics.js` - Automatic test
3. **Check:** [CONSOLE_ERROR_REFERENCE.md](CONSOLE_ERROR_REFERENCE.md) - Specific error messages
4. **Screenshot:** Error dari console dan terminal
5. **Share:** Untuk support/debugging

---

## 📊 File Structure

```
restoapp/
├─ backend/
│  ├─ server.js              ← Main backend
│  ├─ .env                   ← Backend config
│  ├─ db.js                  ← Database connection
│  ├─ test-transaction.js    ← Test script
│  ├─ routes/
│  │  └─ transactions.js     ← API routes
│  └─ controllers/
│     └─ transactionController.js ← Business logic
│
├─ src/
│  ├─ views/
│  │  └─ visitor/
│  │     └─ PaymentPage.vue  ← Order confirmation
│  └─ services/
│     └─ transactionService.ts ← API calls (UPDATED)
│
├─ .env.local                ← Frontend config (VITE_API_URL)
│
├─ QUICK_FIX_BACKEND_OFFLINE.md      ← Quick start [MULAI DARI SINI]
├─ DIAGNOSTIK_BACKEND_OFFLINE.md     ← Detailed guide
├─ CONSOLE_ERROR_REFERENCE.md        ← Error meanings
├─ IMPROVEMENTS_APPLIED.md           ← What I fixed
├─ INDEX_ALL_DOCUMENTATION.md        ← This file
├─ backend-diagnostics.js            ← Auto test backend
└─ frontend-diagnostics.js           ← Auto test frontend
```

---

## ✨ Next Steps After Fix

### Immediate (5 min)
- ✅ Fix backend offline issue (you are here)
- ✅ Verify applications working again

### Near-term (1-2 hours)
- Implement auto-sync pending transactions 🔄
- Add UI indicator for offline queue 📦
- Better error messages in UI 💬

### Long-term (1-2 days)
- Full PWA support with ServiceWorker 🌐
- Proper offline-first architecture 📱
- Background sync API ⏳

---

## 🎉 Success Criteria

Backend online ✅ ketika:
1. Create order → **tidak** lihat "Backend Offline"
2. Response time < 500ms
3. Transaction ID format: `TRXxxxxxxx` (bukan `OFFLINE_`)
4. Data muncul di database
5. Network tab status: **201 Created**

---

**Ready?** Pick one:
- ⚡ [QUICK_FIX_BACKEND_OFFLINE.md](QUICK_FIX_BACKEND_OFFLINE.md) - 5 minutes
- 🔍 [DIAGNOSTIK_BACKEND_OFFLINE.md](DIAGNOSTIK_BACKEND_OFFLINE.md) - Deep dive
- 🛠️ Run diagnostic scripts now

Good luck! 🚀
