# 🧪 TESTING GUIDE - Sistem Transaksi Restoran

## ✅ Status Sistem

- ✅ **Backend**: http://localhost:3000 - **RUNNING** (Status 200)
- ✅ **Frontend**: http://localhost:5173 - **RUNNING** (Status 200)
- ✅ **API Health Check**: `/health` endpoint responding
- ✅ **API Transaction**: POST `/api/transactions` working (Status 201)

---

## 📋 CHECKLIST TEST END-TO-END

### Step 1: Persiapan Browser
- [ ] Buka browser di `http://localhost:5173`
- [ ] **HARD REFRESH**: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
- [ ] Buka **DevTools Console** (`F12`)
- [ ] Clear localStorage jika perlu: `localStorage.clear()`

### Step 2: Input Nama Pelanggan
- [ ] Halaman: **VisitorNamePage**
- [ ] Masukkan nama: `Ahmad Santoso`
- [ ] Klik "Lanjutkan ke Menu"
- [ ] **Expected Console Log**:
  ```
  ✅ Visitor name saved to localStorage: Ahmad Santoso
  ```

### Step 3: Pilih Menu
- [ ] Halaman: **VisitorMenuPage**
- [ ] Tambahkan items:
  - [ ] Sate Ayam × 2 (Rp 25.000 each)
  - [ ] Es Jeruk × 1 (Rp 5.000)
  - [ ] Gado-Gado × 1 (Rp 28.000)
- [ ] Klik checkout/bayar
- [ ] **Expected Total**: Rp 83.000

### Step 4: Payment Page
- [ ] Halaman: **PaymentPage**
- [ ] ✅ Verifikasi **"Nama Pelanggan"** banner menampilkan: `Ahmad Santoso`
- [ ] Isi **"Catatan Pesanan"**: `Tanpa gula, pedas sedang`
- [ ] Pilih metode pembayaran: **Cash**
- [ ] Klik tombol **"Konfirmasi Pesanan"**
- [ ] **Expected Console Logs**:
  ```
  ═══════════════════════════════════════
  📝 [createTransaction] STEP 1: PREPARING
  ═══════════════════════════════════════
  
  🔵 [createTransaction] STEP 2: ATTEMPTING BACKEND
  📤 POST to: http://localhost:3000/api/transactions
  
  ✅ [createTransaction] RESPONSE RECEIVED
  Status: 201
  
  🎉 [createTransaction] SUCCESS!
  Transaction ID: TRX20260228...
  ```

### Step 5: Verifikasi Toast Notification
- [ ] **Toast muncul**: `"✅ Pesanan berhasil disimpan ke server!"`
  - [ ] **BUKAN** `"⚠️ Backend sedang tidak tersedia..."` (offline warning)
- [ ] Jika offline warning → ini adalah BUG, lihat Step 6

### Step 6: Dashboard Employee
- [ ] Buka: `http://localhost:5173/employee-dashboard`
- [ ] Tunggu max 2 detik untuk auto-refresh
- [ ] ✅ Verifikasi order baru dengan:
  - [ ] nama: **Ahmad Santoso** (👤 icon)
  - [ ] items: Sate Ayam x2, Es Jeruk x1, Gado-Gado x1
  - [ ] total: **Rp 83.000,00**
  - [ ] catatan: **📝 Tanpa gula, pedas sedang**
  - [ ] status: **✅ Selesai** (green badge)

---

## 🐛 TROUBLESHOOTING

### Masalah: Selalu Muncul "Backend Offline" Warning

**Debug Steps:**
1. Buka DevTools Console (F12)
2. Lihat logs saat checkout/konfirmasi
3. Cari error message di console
4. Kemungkinan penyebab:
   - [ ] Backend tidak running → `npm run dev` di folder `/backend`
   - [ ] API_URL salah → cek `.env.local`: `VITE_API_URL=http://localhost:3000/api`
   - [ ] CORS error → cek backend CORS config
   - [ ] Network timeout → cek koneksi internet

### Masalah: Data Tidak Muncul di Dashboard

**Debug Steps:**
1. Lihat database ada atau tidak: `backend/resto.db`
2. Cek API response: 
   ```
   curl http://localhost:3000/api/transactions?date=2026-02-28
   ```
3. Lihat apakah `customer_name` dan `note` field ada di response
4. Refresh dashboard manual (F5)

### Masalah: Nama Pelanggan Kosong

**Debug Steps:**
1. Cek localStorage: `console.log(localStorage.getItem('visitor_name'))`
2. Pastikan memasukkan nama di VisitorNamePage
3. Hard refresh: `Ctrl+Shift+R`

---

## 🔍 API Testing (Manual)

### Test GET All Transactions
```bash
curl http://localhost:3000/api/transactions
```

### Test GET Transactions by Date
```bash
curl "http://localhost:3000/api/transactions?date=2026-02-28"
```

### Test POST New Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-02-28",
    "time":"14:30:00",
    "items":[{"name":"Sate Ayam","qty":2,"price":25000}],
    "total":50000,
    "paymentMethod":"cash",
    "status":"completed",
    "note":"Test transaction",
    "customerName":"Test User"
  }'
```

---

## 📝 EXPECTED BEHAVIOR

### Success Flow:
1. Customer enters name → stored in localStorage
2. Selects menu items → added to cart
3. Goes to payment page → sees name in banner + catatan input
4. Fills catatan + selects payment → clicks confirm
5. **Frontend POST to backend** with all data
6. **Backend returns `201 Created`** with transaction ID
7. **Toast shows**: `"✅ Pesanan berhasil disimpan ke server!"`
8. Cart cleared, redirect to menu
9. **Dashboard immediately shows** new order with name + catatan

### Offline Fallback (Only if Network Error):
- Only triggered if: network unavailable OR timeout OR CORS error
- Toast shows: `"⚠️ Backend sedang tidak terhubung..."`
- Data saved to localStorage
- Auto-sync when backend comes back online

---

## 🎯 SUCCESS CRITERIA

- ✅ Nama pelanggan **tidak pernah** "Unknown"
- ✅ Catatan pesanan **muncul** di dashboard
- ✅ Toast menunjukkan **sukses**, bukan offline
- ✅ Data **langsung** muncul di dashboard (max 2 detik)
- ✅ Console logs menunjukkan **status 201/200**
- ✅ Database file `resto.db` **berisi data** baru

---

## 🚀 NEXT STEPS

Jika semua test passed:
1. ✅ Feature ready for production
2. ✅ Can handle offline gracefully
3. ✅ Customer data captured correctly
4. ✅ Real-time dashboard updates working

Jika ada failures:
1. ❌ Check console logs for specific error
2. ❌ Verify backend/frontend still running
3. ❌ Check API endpoint responding
4. ❌ Report exact error message
