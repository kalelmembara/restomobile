-- =====================================================
-- RestoApp - MySQL Database Schema
-- Database: db_resto
-- Import file ini lewat phpMyAdmin atau MySQL CLI
-- =====================================================

CREATE DATABASE IF NOT EXISTS db_resto
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_resto;

-- ─── TABEL KATEGORI ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kategori (
  id              INT             NOT NULL AUTO_INCREMENT,
  nama_kategori   VARCHAR(100)    NOT NULL,
  deskripsi       TEXT,
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_nama_kategori (nama_kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TABEL MENU ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu (
  id              INT             NOT NULL AUTO_INCREMENT,
  kategori_id     INT             NOT NULL,
  nama_menu       VARCHAR(200)    NOT NULL,
  deskripsi       TEXT,
  harga           DECIMAL(10,2)   NOT NULL DEFAULT 0,
  image           VARCHAR(255),
  stok            INT             DEFAULT 999,
  status          ENUM('available','unavailable') DEFAULT 'available',
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_menu_kategori (kategori_id),
  CONSTRAINT fk_menu_kategori FOREIGN KEY (kategori_id) REFERENCES kategori (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TABEL TRANSAKSI ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transaksi (
  id              INT             NOT NULL AUTO_INCREMENT,
  transaction_id  VARCHAR(50)     NOT NULL,
  tanggal         DATE            NOT NULL,
  waktu           TIME            NOT NULL,
  items           JSON            NOT NULL,
  total           DECIMAL(12,2)   NOT NULL DEFAULT 0,
  payment_method  ENUM('cash','transfer','qris') DEFAULT 'cash',
  status          ENUM('completed','cancelled','pending') DEFAULT 'completed',
  catatan         TEXT,
  nama_pelanggan  VARCHAR(100),
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_transaction_id (transaction_id),
  KEY idx_tanggal (tanggal),
  KEY idx_payment (payment_method),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATA CONTOH (Sample Data)
-- =====================================================

-- Kategori
INSERT IGNORE INTO kategori (nama_kategori, deskripsi) VALUES
  ('Makanan',  'Menu makanan utama dan lauk'),
  ('Minuman',  'Minuman dingin dan panas'),
  ('Snack',    'Cemilan dan makanan ringan'),
  ('Dessert',  'Makanan penutup');

-- Menu Makanan
INSERT IGNORE INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
  ((SELECT id FROM kategori WHERE nama_kategori='Makanan'), 'Nasi Goreng Spesial',  'Nasi goreng dengan telur, ayam, dan kerupuk',         25000, 50),
  ((SELECT id FROM kategori WHERE nama_kategori='Makanan'), 'Mie Goreng Jawa',      'Mie goreng bumbu jawa dengan telur dan sayuran',      22000, 50),
  ((SELECT id FROM kategori WHERE nama_kategori='Makanan'), 'Ayam Bakar Madu',      'Ayam bakar dengan olesan madu manis gurih',            30000, 30),
  ((SELECT id FROM kategori WHERE nama_kategori='Makanan'), 'Sate Ayam',            'Sate ayam 10 tusuk dengan bumbu kacang dan lontong',  28000, 40),
  ((SELECT id FROM kategori WHERE nama_kategori='Makanan'), 'Gado-Gado',            'Sayuran segar dengan saus kacang dan kerupuk',        20000, 35),
  ((SELECT id FROM kategori WHERE nama_kategori='Makanan'), 'Bakso Kuah',           'Bakso daging sapi asli dengan kuah kaldu gurih',      18000, 60);

-- Menu Minuman
INSERT IGNORE INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
  ((SELECT id FROM kategori WHERE nama_kategori='Minuman'), 'Es Teh Manis',   'Teh manis dingin dengan es batu',       5000, 99),
  ((SELECT id FROM kategori WHERE nama_kategori='Minuman'), 'Es Jeruk',       'Jeruk peras segar dengan es batu',      7000, 99),
  ((SELECT id FROM kategori WHERE nama_kategori='Minuman'), 'Kopi Tubruk',    'Kopi tubruk asli cara tradisional',     8000, 99),
  ((SELECT id FROM kategori WHERE nama_kategori='Minuman'), 'Jus Alpukat',    'Jus alpukat creamy dengan susu',       15000, 50),
  ((SELECT id FROM kategori WHERE nama_kategori='Minuman'), 'Es Campur',      'Minuman segar campuran buah dan jelly', 12000, 40),
  ((SELECT id FROM kategori WHERE nama_kategori='Minuman'), 'Air Mineral',    'Air mineral botol 600ml',               4000, 99);

-- Menu Snack
INSERT IGNORE INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
  ((SELECT id FROM kategori WHERE nama_kategori='Snack'), 'Kentang Goreng',  'Kentang goreng crispy dengan saus',      15000, 50),
  ((SELECT id FROM kategori WHERE nama_kategori='Snack'), 'Pisang Goreng',   'Pisang goreng crispy topping coklat',    10000, 40),
  ((SELECT id FROM kategori WHERE nama_kategori='Snack'), 'Cireng Isi',      'Cireng isi daging dengan saus cuka',     12000, 45);
