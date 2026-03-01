# 🧪 Manual Test Guide - Customer Order to Employee Dashboard

## ✅ Checklist Sebelum Test

- [ ] Backend running: `npm run dev` di folder `backend/`
- [ ] Backend port 3000 responsive
- [ ] .env.local ada: `VITE_API_URL=http://localhost:3000/api`
- [ ] VS Code/Dev Tools tidak menunjukkan error di console
- [ ] localStorage cleared (DevTools → Application → Local Storage → Clear All)

---

## 📱 STEP 1: TEST CUSTOMER ORDER (Tab 1)

1. **Buka browser**: `http://localhost:5175` (atau port Vite yang aktif)

2. **Klik "Sebagai Tamu"**
   - Redirect ke halaman Nama Pelanggan

3. **Isi Nama**: Misal "Andi Wijaya"
   - Pastikan nama tersimpan di `visitorStore`
   - Klik "Lanjutkan ke Menu"

4. **Tambah Menu ke Cart**:
   - Klik minimal 2-3 menu (makanan/minuman)
   - Contoh: Nasi Goreng (Rp 25.000) + Kopi Tubruk (Rp 8.000)

5. **Lihat Rincian Pesanan**:
   - Klik "Lihat Rincian Pesanan"
   - Verifikasi items benar
   - Klik "Lanjutkan"

6. **Payment Page**:
   - Pilih metode pembayaran: Misal "Cash"
   - Opsional: Tambah catatan
   - **KLIK "Konfirmasi Pesanan"** ✅

7. **Expected Toast Message**:
   ```
   ✅ Pesanan berhasil!
   ID: TRX202602281234567
   ```
   (Bukan "OFFLINE_..." atau "Backend sedang offline")

8. **Check Console** (F12 → Console):
   ```
   Tidak ada error
   Request POST /api/transactions berhasil
   ```

---

## 👨‍💼 STEP 2: CHECK EMPLOYEE DASHBOARD (Tab 2)

1. **Buka tab baru**: `http://localhost:5175`

2. **Klik "Sebagai Pegawai"** → Login (atau skip)

3. **Lihat Main Dashboard**:
   - [ ] **"Pesanan Hari Ini"** menunjukkan: **1** (bukan **0**)
   - [ ] **"Penjualan"** menunjukkan: **Rp 33,000** (total order)

4. **Tabel Pesanan** harus menampilkan:
   ```
   ┌──────────┬────────────┬───────────┬────────────┐
   │ ID       │ Pelanggan  │ Items     │ Total      │
   ├──────────┼────────────┼───────────┼────────────┤
   │ TRX...   │ Andi Wijaya│ Nasi...   │ Rp 33,000  │
   └──────────┴────────────┴───────────┴────────────┘
   ```

5. **Buat order lagi** (Tab 1):
   - Nama: "Siti Nurhaliza"
   - Menu: Mie Goreng + Es Teh
   - Konfirmasi pesanan

6. **Lihat Dashboard** (Tab 2):
   - Dashboard auto-refresh setiap 2 detik
   - Harus muncul 2 pesanan:
     - "Andi Wijaya" + "Siti Nurhaliza"
   - "Pesanan Hari Ini": **2**

---

## 🔍 DEBUG: Jika Tidak Muncul

### Cek 1: API Health
Di browser console:
```javascript
fetch('http://localhost:3000/health').then(r => r.json()).then(console.log)
```
Expected: `{status: "OK", message: "Backend is running"}`

### Cek 2: Database Kosong?
```javascript
fetch('http://localhost:3000/api/transactions').then(r => r.json()).then(console.log)
```
Expected: `[]` (jika belum ada order) atau `[{id, customerName, ...}]` (jika ada)

### Cek 3: visitorStore tersimpan?
```javascript
// Di PaymentPage custom element inspector
this.$pinia.state.value.visitor.visitorName  // Harus "Andi Wijaya"
```

### Cek 4: Console Error?
Tekan **F12** → **Console** → Lihat error merah
Common errors:
- `Error: Failed to fetch` → Backend tidak running
- `TypeError: Cannot read property 'items'` → Data format salah
- `CORS error` → Backend CORS config salah

---

## 💾 Database Info

Database file: `backend/resto.db`

Lihat raw data dengan SQL browser atau Node CLI:
```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./backend/resto.db');
db.all('SELECT * FROM transactions', (err, rows) => {
  console.log(rows);
  db.close();
});
```

---

## 📝 Expected Output

### Console (Customer side - PaymentPage)
```
✅ Pesanan berhasil!
ID: TRX20260228...
→ Redirect ke /visitor-menu
```

### Console (Employee side - Dashboard)
```
[Auto-refresh setiap 2 detik]
orders: [{customer: "Andi Wijaya", total: 33000, ...}]
stats: {todayOrders: 1, totalSales: 33000}
```

### Database (backend/resto.db)
```sql
SELECT * FROM transactions WHERE date = '2026-02-28';

id | transaction_id  | date       | time     | customer_name  | total  | items
---|-----------------|------------|----------|----------------|--------|----------
1  | TRX202602281... | 2026-02-28 | 14:30:45 | Andi Wijaya    | 33000  | [...]
```

---

## ❌ Troubleshooting Umum

| Masalah | Solusi |
|---------|--------|
| "Backend sedang offline" | Pastikan `npm run dev` di `backend/` folder |
| "CORS error" | Refresh browser, clear cache (Ctrl+Shift+R) |
| Dashboard masih 0 pesanan | Tunggu 2-3 detik (auto-refresh timer) |
| Nama pelanggan "Unknown" | Pastikan masuk halaman nama terlebih dahulu |
| LocalStorage punya "OFFLINE_..." | Clear localStorage di DevTools |
| TypeError di console | Cek types/index.ts punya customerName field |

---

## 🎯 Success Criteria

✅ Customer bisa order dengan nama tersimpan  
✅ API POST berhasil (TRX... ID, bukan OFFLINE_...)  
✅ Employee dashboard menampilkan nama pelanggan  
✅ Dashboard auto-refresh setiap 2 detik  
✅ Statistik Pesanan Hari Ini & Penjualan terupdate  

---

## 🚀 Next Steps (Jika Berhasil)

1. Deploy ke production dengan ENV variable yang benar
2. Tambah authentication untuk employee login
3. Implementasi order status tracking
4. Buat notifikasi real-time dengan WebSocket
5. Setup database backup & monitoring
