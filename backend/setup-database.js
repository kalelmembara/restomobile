/**
 * setup-database.js
 * ─────────────────────────────────────────────────────────────────
 * Jalankan SEKALI untuk membuat database, tabel, dan data contoh:
 *   node setup-database.js
 * ─────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'db_resto';

async function main() {
  console.log('\n🚀 RestoApp - Setup Database');
  console.log('═══════════════════════════════════════');
  console.log(`   Host     : ${DB_HOST}:${DB_PORT}`);
  console.log(`   User     : ${DB_USER}`);
  console.log(`   Database : ${DB_NAME}`);
  console.log('═══════════════════════════════════════\n');

  // Koneksi awal TANPA database (untuk membuat database jika belum ada)
  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      multipleStatements: true,
    });
    console.log('✅ Terhubung ke MySQL server');
  } catch (err) {
    console.error('\n❌ GAGAL terhubung ke MySQL!');
    console.error('   Pesan error:', err.message);
    console.error('\n📋 Solusi (Laragon):');
    console.error('   1. Buka Laragon');
    console.error('   2. Klik [Start All] atau aktifkan MySQL');
    console.error('   3. Pastikan lampu MySQL hijau, lalu jalankan lagi');
    process.exit(1);
  }

  try {
    // 1. Buat database
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${DB_NAME}\``);
    console.log(`✅ Database '${DB_NAME}' siap`);

    // 2. Buat tabel kategori
    await conn.query(`
      CREATE TABLE IF NOT EXISTS kategori (
        id            INT          NOT NULL AUTO_INCREMENT,
        nama_kategori VARCHAR(100) NOT NULL,
        deskripsi     TEXT,
        created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_nama_kategori (nama_kategori)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabel kategori siap');

    // 3. Buat tabel menu
    await conn.query(`
      CREATE TABLE IF NOT EXISTS menu (
        id          INT              NOT NULL AUTO_INCREMENT,
        kategori_id INT              NOT NULL,
        nama_menu   VARCHAR(200)     NOT NULL,
        deskripsi   TEXT,
        harga       DECIMAL(10,2)    NOT NULL DEFAULT 0,
        image       VARCHAR(255),
        stok        INT              DEFAULT 999,
        status      ENUM('available','unavailable') DEFAULT 'available',
        created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at  TIMESTAMP        NULL DEFAULT NULL,
        PRIMARY KEY (id),
        KEY fk_menu_kategori (kategori_id),
        CONSTRAINT fk_menu_kategori FOREIGN KEY (kategori_id)
          REFERENCES kategori (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabel menu siap');

    // 4. Buat tabel transaksi
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transaksi (
        id             INT          NOT NULL AUTO_INCREMENT,
        transaction_id VARCHAR(50)  NOT NULL,
        tanggal        DATE         NOT NULL,
        waktu          TIME         NOT NULL,
        items          JSON         NOT NULL,
        total          DECIMAL(12,2) NOT NULL DEFAULT 0,
        payment_method ENUM('cash','transfer','qris') DEFAULT 'cash',
        status         ENUM('completed','cancelled','pending') DEFAULT 'completed',
        catatan        TEXT,
        nama_pelanggan VARCHAR(100),
        created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_transaction_id (transaction_id),
        KEY idx_tanggal (tanggal)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabel transaksi siap');

    // 5. Cek apakah perlu seed data
    const [[{ total }]] = await conn.query(`SELECT COUNT(*) AS total FROM menu`);
    if (parseInt(total) > 0) {
      console.log(`\n📊 Database sudah ada ${total} menu. Skip seeding.`);
    } else {
      console.log('\n📦 Menyisipkan data contoh...');

      // Seed kategori
      await conn.query(`
        INSERT IGNORE INTO kategori (nama_kategori, deskripsi) VALUES
          ('Makanan',  'Menu makanan utama dan lauk'),
          ('Minuman',  'Minuman dingin dan panas'),
          ('Snack',    'Cemilan dan makanan ringan'),
          ('Dessert',  'Makanan penutup')
      `);

      // Ambil ID kategori
      const [katRows] = await conn.query(
        `SELECT id, nama_kategori FROM kategori`
      );
      const katMap = {};
      katRows.forEach(r => { katMap[r.nama_kategori] = r.id; });

      // Seed menu makanan
      await conn.query(`
        INSERT INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
          (?, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan kerupuk renyah',      25000, 50),
          (?, 'Mie Goreng Jawa',     'Mie goreng bumbu jawa dengan telur dan sayuran segar',    22000, 50),
          (?, 'Ayam Bakar Madu',     'Ayam bakar pilihan dengan olesan madu manis gurih',       30000, 30),
          (?, 'Sate Ayam',           'Sate ayam 10 tusuk dengan bumbu kacang dan lontong',     28000, 40),
          (?, 'Gado-Gado',           'Sayuran segar dengan saus kacang spesial dan kerupuk',   20000, 35),
          (?, 'Bakso Kuah',          'Bakso daging sapi asli dengan kuah kaldu gurih',          18000, 60)
      `, Array(6).fill(katMap['Makanan']));

      // Seed menu minuman
      await conn.query(`
        INSERT INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
          (?, 'Es Teh Manis',  'Teh manis segar dingin dengan es batu',            5000, 99),
          (?, 'Es Jeruk',      'Jeruk peras segar dengan es batu',                 7000, 99),
          (?, 'Kopi Tubruk',   'Kopi tubruk asli cara tradisional',                8000, 99),
          (?, 'Jus Alpukat',   'Jus alpukat creamy lembut dengan susu kental',    15000, 50),
          (?, 'Es Campur',     'Minuman segar campuran buah-buahan dan jelly',     12000, 40),
          (?, 'Air Mineral',   'Air mineral botol 600ml',                           4000, 99)
      `, Array(6).fill(katMap['Minuman']));

      // Seed menu snack
      await conn.query(`
        INSERT INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
          (?, 'Kentang Goreng', 'Kentang goreng crispy dengan saus tomat dan mayo', 15000, 50),
          (?, 'Pisang Goreng',  'Pisang goreng crispy topping coklat dan keju',     10000, 40),
          (?, 'Cireng Isi',     'Cireng isi daging cincang dengan saus cuka',       12000, 45),
          (?, 'Tahu Crispy',   'Tahu goreng crispy bumbu bawang',                  10000, 50)
      `, Array(4).fill(katMap['Snack']));

      // Seed menu dessert
      await conn.query(`
        INSERT INTO menu (kategori_id, nama_menu, deskripsi, harga, stok) VALUES
          (?, 'Es Krim Vanilla',  'Es krim vanilla premium dengan topping coklat',   18000, 30),
          (?, 'Puding Coklat',   'Puding coklat lembut dengan saus karamel',         12000, 25),
          (?, 'Klepon',           'Klepon isi gula merah dengan taburan kelapa',       8000, 40)
      `, Array(3).fill(katMap['Dessert']));

      const [[{ jumlah }]] = await conn.query(
        `SELECT COUNT(*) AS jumlah FROM menu`
      );
      console.log(`✅ Berhasil memasukkan ${jumlah} menu contoh`);
    }

    console.log('\n🎉 Setup selesai! Database siap digunakan.');
    console.log('\n📡 Langkah selanjutnya:');
    console.log('   node server.js  ← jalankan backend');
    console.log('   atau: npm start\n');

  } catch (err) {
    console.error('\n❌ Error saat setup:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Cek username/password MySQL di file backend/.env');
    }
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
