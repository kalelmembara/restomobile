# 🚀 QUICK START: Mengatasi "Backend Offline" Error

## Status Anda Saat Ini
```
❌ "Pesanan disimpan lokal (Backend sedang offline) ID: OFFLINE_1772273964618"
```

**Artinya:** Frontend tidak bisa koneksi ke backend di `http://localhost:3000`

---

## ⚡ Solusi Cepat (5 Menit)

### 1. Pastikan Backend Berjalan

Buka **PowerShell baru** dan jalankan:

```powershell
cd d:\MobileApp\restoapp\backend
npm start
```

**Tunggu sampai lihat:**
```
🚀 Server running at http://localhost:3000
```

### 2. Test di Browser

Buka tab baru, kunjungi:
```
http://localhost:3000/health
```

**Seharusnya lihat:**
```json
{"status": "OK", "message": "Backend is running"}
```

Jika lihat JSON ✅ → **Lanjut ke langkah 3**

Jika error atau loading ❌ → Kembali ke **Langkah 1**, pastikan backend berjalan

### 3. Test Frontend

Refresh aplikasi di `http://localhost:5173` atau tekan **F5**

Buat order baru → Klik **Konfirmasi Pesanan**

**Seharusnya lihat:**
```
✅ Pesanan berhasil!
ID: TRX20250228120530
```

Bukan:
```
⚠️ Pesanan disimpan lokal (Backend sedang offline)
```

---

## 🔧 Jika Masih Error

### Gunakan Script Diagnostik

#### Di Terminal (Backend)
```powershell
cd d:\MobileApp\restoapp
node backend-diagnostics.js
```

Backup output dan lihat error apa.

#### Di Browser (DevTools)

1. Tekan **F12** → buka DevTools
2. Klik tab **Console**
3. Copy-paste isi file: `frontend-diagnostics.js`
4. Lihat hasil test di console

---

## 🆘 Troubleshooting

| Problem | Solusi |
|---------|--------|
| Backend tidak berjalan | Kembali ke **Langkah 1**, jalankan `npm start` di folder backend |
| Port 3000 sudah digunakan | Lihat DIAGNOSTIK_BACKEND_OFFLINE.md → STEP 1B |
| CORS Error di console | Lihat DIAGNOSTIK_BACKEND_OFFLINE.md → SCENARIO 1 |
| Masih offline setelah fix | Jalankan script diagnostik, kumpulkan output, dan hubungi support |

---

## 📚 File Referensi

- 📖 **DIAGNOSTIK_BACKEND_OFFLINE.md** - Panduan lengkap troubleshooting
- 🔧 **backend-diagnostics.js** - Script untuk test backend
- 🖥️ **frontend-diagnostics.js** - Script untuk test dari browser

---

## ✅ Verifikasi Semuanya OK

Jika berhasil lakukan ini tanpa error:

```powershell
# 1. Backend berjalan
cd backend && npm start

# 2. (di PowerShell BARU) Test backend
node backend-diagnostics.js

# 3. (di tab browser/DevTools console)
# Copy-paste script dari frontend-diagnostics.js
```

Semua ✅ = **Sistem siap digunakan!**

---

**Butuh bantuan?** Lihat [DIAGNOSTIK_BACKEND_OFFLINE.md](DIAGNOSTIK_BACKEND_OFFLINE.md) untuk panduan detail.
