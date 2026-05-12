/**
 * fix-deleted-at.js  (v2)
 * ─────────────────────────────────────────────────────────
 * Memperbaiki nilai deleted_at yang bermasalah di tabel menu.
 *
 * Root cause: MySQL strict mode menolak perbandingan TIMESTAMP = ''
 * Fix: Nonaktifkan strict mode dulu, lalu update dengan CAST comparison.
 *
 * Jalankan: node fix-deleted-at.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixDeletedAt() {
  console.log('\n🔧 Fix deleted_at values di tabel menu...\n');

  let conn;
  try {
    conn = await mysql.createConnection({
      host:               process.env.DB_HOST     || 'localhost',
      port:               parseInt(process.env.DB_PORT || '3306'),
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASSWORD || '',
      database:           process.env.DB_NAME     || 'db_resto',
      dateStrings:        true,
    });

    console.log('✅ Terhubung ke MySQL\n');

    // Step 1: Matikan SEMUA strict mode (termasuk TIMESTAMP validation)
    await conn.query("SET SESSION sql_mode = ''");
    console.log('📌 sql_mode dikosongkan (strict mode OFF)');

    // Step 2: Lihat kondisi awal dengan CAST agar tidak error strict mode
    const [before] = await conn.query(`
      SELECT id, nama_menu, CAST(deleted_at AS CHAR) AS da_str
      FROM menu ORDER BY id
    `);
    console.log(`\n📋 Total baris di tabel menu: ${before.length}`);

    const problemRows = before.filter(r =>
      r.da_str === '' ||
      r.da_str === null ||
      r.da_str === '0000-00-00 00:00:00' ||
      r.da_str === '0000-00-00'
    );

    console.log(`⚠️  Baris dengan deleted_at bermasalah (empty/null/zero): ${problemRows.length}`);
    problemRows.forEach(r =>
      console.log(`   - ID ${r.id}: "${r.nama_menu}" → deleted_at="${r.da_str}"`)
    );

    // Step 3: Fix semua kemungkinan nilai bermasalah
    // Gunakan CAST di WHERE agar tidak ada perbandingan TIMESTAMP langsung
    const [fix1] = await conn.query(`
      UPDATE menu
      SET deleted_at = NULL
      WHERE CAST(deleted_at AS CHAR) = ''
         OR CAST(deleted_at AS CHAR) = '0000-00-00 00:00:00'
         OR CAST(deleted_at AS CHAR) = '0000-00-00'
    `);
    console.log(`\n✅ Fixed nilai kosong/zero: ${fix1.affectedRows} baris`);

    // Step 4: Verifikasi hasil — query yang sama dengan getMenus di controller
    await conn.query("SET SESSION sql_mode = ''");  // pastikan masih OFF
    const [menus] = await conn.query(`
      SELECT
        m.id,
        m.nama_menu        AS name,
        m.harga            AS price,
        m.deleted_at,
        COALESCE(k.nama_kategori, 'Umum') AS category
      FROM menu m
      LEFT JOIN kategori k ON m.kategori_id = k.id
      WHERE m.deleted_at IS NULL
      ORDER BY k.nama_kategori, m.nama_menu
    `);

    console.log(`\n🎉 Menu aktif (deleted_at IS NULL): ${menus.length} item`);
    menus.forEach(r =>
      console.log(`   ✓ [${r.category}] ${r.name} — Rp ${Number(r.price).toLocaleString('id-ID')}`)
    );

    // Step 5: Cek kategori
    const [cats] = await conn.query('SELECT id, nama_kategori FROM kategori ORDER BY id');
    console.log(`\n📂 Kategori tersedia: ${cats.length}`);
    cats.forEach(c => console.log(`   - ${c.id}. ${c.nama_kategori}`));

    if (menus.length === 0) {
      console.log('\n⚠️  PERHATIAN: Menu masih kosong!');
      console.log('   Coba jalankan: node setup-database.js');
    } else {
      console.log('\n✅ Database OK! Silakan restart backend.');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('   Code:', err.code);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }

  console.log('\n════════════════════════════════════════════');
  console.log('  Langkah selanjutnya:');
  console.log('  1. node server.js          ← restart backend');
  console.log('  2. Buka /visitor-menu      ← menu harus muncul');
  console.log('════════════════════════════════════════════\n');
}

fixDeletedAt();
