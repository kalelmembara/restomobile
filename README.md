# 🍽️ Restoran App — Ionic Vue + PHP API

Aplikasi kasir restoran berbasis mobile (Ionic Vue) dengan backend PHP dan database MySQL.

---

## 📁 Struktur Folder

```
project/
├── .gitignore
├── db_resto.sql              ← Import ke phpMyAdmin
├── README.md
├── api/                      ← Backend PHP → taruh di htdocs/api/
│   ├── config/
│   │   └── database.php      ← Konfigurasi koneksi DB
│   └── endpoints/
│       ├── auth.php
│       ├── dashboard.php
│       ├── kategori.php
│       ├── menu.php
│       ├── meja.php
│       └── transaksi.php
└── resto/                    ← Frontend Ionic Vue
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.ts
        ├── App.vue
        ├── router/index.ts
        ├── stores/auth.ts
        ├── composables/useApi.ts
        ├── theme/variables.css
        └── views/
            ├── LoginPage.vue
            ├── admin/
            │   ├── AdminLayout.vue
            │   ├── DashboardPage.vue
            │   ├── MenuPage.vue
            │   ├── KategoriPage.vue
            │   └── MejaPage.vue
            └── kasir/
                ├── KasirLayout.vue
                ├── TransaksiPage.vue
                ├── RiwayatPage.vue
                └── MejaStatusPage.vue
```

---

## 🚀 Push ke GitHub (Pertama Kali)

### 1. Buat repository baru di GitHub
- Buka https://github.com/new
- Isi nama repo, misal: `restoran-app`
- Pilih **Public** atau **Private**
- **Jangan centang** "Add README" / "Add .gitignore"
- Klik **Create repository**

### 2. Di terminal, masuk ke folder project

```bash
cd path/ke/project
```

### 3. Inisialisasi git dan push

```bash
# Inisialisasi git
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "feat: initial commit restoran app"

# Ganti branch ke main
git branch -M main

# Hubungkan ke GitHub (ganti URL dengan repo Anda)
git remote add origin https://github.com/USERNAME/restoran-app.git

# Push ke GitHub
git push -u origin main
```

> Ganti `USERNAME` dan `restoran-app` dengan username dan nama repo GitHub Anda.

### 4. Untuk push perubahan berikutnya

```bash
git add .
git commit -m "pesan perubahan"
git push
```

---

## ⚙️ Setup & Jalankan Lokal

### STEP 1 — Import Database
1. Buka phpMyAdmin → `http://localhost/phpmyadmin`
2. Klik **Import** → pilih file `db_resto.sql` → klik **Go**

### STEP 2 — Setup API PHP
1. Copy folder `api/` ke `C:/xampp/htdocs/api/`
2. Jika password MySQL Anda bukan kosong, edit `api/config/database.php`:
   ```php
   $password = "password_anda";
   ```
3. Test: buka `http://localhost/api/endpoints/dashboard.php`
   → harus tampil JSON `{"success":true,...}`

### STEP 3 — Jalankan Frontend

```bash
cd resto
npm install
npm run dev
```

Buka browser: **http://localhost:8100**

---

## 👤 Akun Default

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | Admin |
| kasir1   | kasir123 | Kasir |
| budi     | budi123  | Admin |

---

## 🎯 Fitur

### Admin
- **Dashboard** — statistik real-time, pendapatan hari/bulan, dine-in vs takeaway, transaksi terakhir
- **Menu** — CRUD + toggle stok (swipe kiri)
- **Kategori** — CRUD (swipe kiri edit/hapus)
- **Meja** — CRUD visual grid (hijau=tersedia, merah=terisi)

### Kasir
- **Transaksi** — POS: grid menu, filter kategori, pilih Dine In/Take Away, pilih meja, hitung kembalian
- **Riwayat** — semua transaksi dengan detail item, info meja & tipe order
- **Meja** — lihat & toggle status meja (tap untuk ubah)

---

## 🛠️ Teknologi

| Layer    | Teknologi                    |
|----------|------------------------------|
| Frontend | Ionic 7 + Vue 3 + TypeScript |
| State    | Pinia                        |
| Router   | Vue Router 4                 |
| Build    | Vite                         |
| Backend  | PHP 7.4+ (PDO)               |
| Database | MySQL — `db_resto`           |
