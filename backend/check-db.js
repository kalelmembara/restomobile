require('dotenv').config();
const db = require('./db-mysql');

async function checkDB() {
  try {
    const [cats] = await db.query('SELECT id, nama_kategori FROM kategori ORDER BY id');
    console.log('KATEGORI:');
    cats.forEach(c => console.log('  id=' + c.id + ' nama=' + c.nama_kategori));

    const [menus] = await db.query('SELECT id, kategori_id, nama_menu FROM menu ORDER BY id');
    console.log('MENU:');
    menus.forEach(m => console.log('  id=' + m.id + ' kat_id=' + m.kategori_id + ' nama=' + m.nama_menu));

    const [j] = await db.query('SELECT m.id, m.nama_menu, m.kategori_id, k.nama_kategori FROM menu m LEFT JOIN kategori k ON m.kategori_id = k.id ORDER BY m.id');
    console.log('JOIN RESULT:');
    j.forEach(x => console.log('  id=' + x.id + ' kat_id=' + x.kategori_id + ' nama_kat=' + x.nama_kategori + ' menu=' + x.nama_menu));

  } catch (err) {
    console.log('ERROR: ' + err.message);
  } finally {
    process.exit(0);
  }
}

checkDB();
