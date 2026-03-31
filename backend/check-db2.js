require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkDB() {
  // Koneksi LANGSUNG tanpa pool, dengan sql_mode di-set via multipleStatements
  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST     || 'localhost',
    port:               parseInt(process.env.DB_PORT || '3306'),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'db_resto',
    multipleStatements: true,
    dateStrings:        true,
  });

  const result = {};

  try {
    // Step 1: Nonaktifkan strict mode
    await conn.query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");

    // Step 2: Cek kategori
    const [cats] = await conn.query('SELECT id, nama_kategori FROM kategori ORDER BY id');
    result.kategori = cats;

    // Step 3: Cek deleted_at raw
    const [raw] = await conn.query('SELECT id, nama_menu, deleted_at FROM menu ORDER BY id');
    result.deleted_at_raw = raw;

    // Step 4: Test query getMenus
    const [menus] = await conn.query(`
      SELECT
        m.id,
        m.nama_menu        AS name,
        m.harga            AS price,
        m.kategori_id      AS category_id,
        COALESCE(k.nama_kategori, 'Umum') AS category
      FROM menu m
      LEFT JOIN kategori k ON m.kategori_id = k.id
      WHERE (m.deleted_at IS NULL OR m.deleted_at = '' OR m.deleted_at = '0000-00-00 00:00:00')
      ORDER BY k.nama_kategori, m.nama_menu
    `);
    result.menus = menus;
    result.success = true;

  } catch (err) {
    result.error = err.message;
    result.success = false;
  } finally {
    await conn.end();
  }

  fs.writeFileSync('check-db-result.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Done - success=' + result.success);
  if (result.error) console.log('Error: ' + result.error);
  process.exit(0);
}

checkDB();
