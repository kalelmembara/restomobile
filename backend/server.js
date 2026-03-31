/**
 * RestoApp Backend Server
 * ─────────────────────────────────────────────────────────────────
 * Menjalankan API di: http://localhost:3000
 *
 * Sebelum menjalankan server, pastikan:
 *   1. XAMPP → MySQL sudah dinyalakan
 *   2. Jalankan setup: node setup-database.js  (sekali saja)
 *   3. Jalankan server: node server.js
 *
 * API Endpoints:
 *   GET  /health                 → cek status server
 *   GET  /api/menus              → semua menu (utama)
 *   GET  /api/menus/categories   → semua kategori
 *   GET  /api/menus/category/:id → menu berdasarkan kategori
 *   GET  /api/menus/:id          → detail menu by ID
 *   POST /api/menus              → tambah menu baru
 *   PUT  /api/menus/:id          → update menu
 *   DEL  /api/menus/:id          → hapus menu
 *   GET  /menus                  → alias GET /api/menus (kompatibilitas)
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => cb(null, true),   // izinkan semua origin (development)
  credentials: true
}));

// ─── BODY PARSER ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES (Gambar Menu) ──────────────────────────────────────────────
// Simpan gambar di: backend/public/images/
// Akses : http://localhost:3000/images/namafile.jpg
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'OK',
    message:   '✅ Backend RestoApp berjalan',
    database:  process.env.DB_NAME || 'db_resto',
    timestamp: new Date().toISOString()
  });
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
const menuRoutes        = require('./routes/menus');
const transactionRoutes = require('./routes/transactions');

// Rute utama dengan prefix /api
app.use('/api/menus',        menuRoutes);
app.use('/api/transactions', transactionRoutes);

// Alias tanpa /api (kompatibilitas langsung: GET http://localhost:3000/menus)
app.use('/menus', menuRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error:   'Endpoint tidak ditemukan',
    method:  req.method,
    path:    req.path,
    hint:    'Coba: GET /api/menus atau GET /health'
  });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({
    error:   'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan server'
  });
});

// ─── START SERVER ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🚀  Backend RestoApp Berjalan!         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n🌐 URL        : http://localhost:${PORT}`);
  console.log(`🗄️  Database  : ${process.env.DB_NAME || 'db_resto'} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  console.log('\n📡 Endpoint Penting:');
  console.log(`   ✓ GET  http://localhost:${PORT}/health`);
  console.log(`   ✓ GET  http://localhost:${PORT}/api/menus          ← Frontend pakai ini`);
  console.log(`   ✓ GET  http://localhost:${PORT}/api/menus/categories`);
  console.log(`   ✓ GET  http://localhost:${PORT}/menus              ← Alias langsung`);
  console.log('\n🖼️  Gambar    : http://localhost:${PORT}/images/<namafile>');
  console.log('   Folder     : backend/public/images/');
  console.log('\n⚠️  Jika menu kosong: Pastikan XAMPP MySQL aktif &');
  console.log('   sudah jalankan: node setup-database.js\n');
});

// ─── KONEKSI DATABASE (di akhir agar server tetap start walau DB error) ──────
const db = require('./config/database');
db.getConnection()
  .then(conn => {
    console.log('✅ Database MySQL terhubung!');
    conn.release();
  })
  .catch(err => {
    console.error('\n🔴 PERHATIAN: Gagal koneksi MySQL!');
    console.error('   Error:', err.message);
    console.error('\n   📋 Solusi:');
    console.error('   1. Buka XAMPP → Start MySQL');
    console.error('   2. Jalankan: node setup-database.js');
    console.error('   3. Restart server ini\n');
  });
