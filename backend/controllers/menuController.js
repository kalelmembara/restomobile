/**
 * Menu Controller
 * Database: db_resto (MySQL via XAMPP)
 *
 * Struktur tabel:
 *   menu     : id, kategori_id, nama_menu, deskripsi, harga, image, stok, status, deleted_at
 *   kategori : id, nama_kategori
 */

const db = require('../config/database');

// ─── GET SEMUA KATEGORI ───────────────────────────────────────────────────────
async function getCategories(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, nama_kategori AS name FROM kategori ORDER BY nama_kategori'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('getCategories error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── GET SEMUA MENU ───────────────────────────────────────────────────────────
async function getMenus(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.nama_menu                         AS name,
        m.deskripsi                         AS description,
        m.harga                             AS price,
        m.image                             AS image_url,
        m.stok,
        m.status,
        m.kategori_id                       AS category_id,
        COALESCE(k.nama_kategori, 'Umum')   AS category
      FROM menu m
      LEFT JOIN kategori k ON m.kategori_id = k.id
      WHERE m.deleted_at IS NULL
      ORDER BY k.nama_kategori, m.nama_menu
    `);
    res.json(rows || []);
  } catch (err) {
    console.error('getMenus error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── GET MENU BY ID ───────────────────────────────────────────────────────────
async function getMenuById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.nama_menu                         AS name,
        m.deskripsi                         AS description,
        m.harga                             AS price,
        m.image                             AS image_url,
        m.stok,
        m.status,
        m.kategori_id                       AS category_id,
        COALESCE(k.nama_kategori, 'Umum')   AS category
      FROM menu m
      LEFT JOIN kategori k ON m.kategori_id = k.id
      WHERE m.id = ? AND m.deleted_at IS NULL
    `, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('getMenuById error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── GET MENU BY KATEGORI ─────────────────────────────────────────────────────
async function getMenusByCategory(req, res) {
  const { categoryId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.nama_menu                         AS name,
        m.deskripsi                         AS description,
        m.harga                             AS price,
        m.image                             AS image_url,
        m.stok,
        m.status,
        m.kategori_id                       AS category_id,
        COALESCE(k.nama_kategori, 'Umum')   AS category
      FROM menu m
      LEFT JOIN kategori k ON m.kategori_id = k.id
      WHERE m.kategori_id = ? AND m.deleted_at IS NULL
      ORDER BY m.nama_menu
    `, [categoryId]);
    res.json(rows || []);
  } catch (err) {
    console.error('getMenusByCategory error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── TAMBAH KATEGORI ─────────────────────────────────────────────────────────
async function addCategory(req, res) {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nama kategori wajib diisi' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO kategori (nama_kategori) VALUES (?)',
      [name.trim()]
    );
    res.status(201).json({ success: true, id: result.insertId, name: name.trim() });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Kategori sudah ada' });
    }
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── HAPUS KATEGORI ──────────────────────────────────────────────────────────
async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM kategori WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── TAMBAH MENU ─────────────────────────────────────────────────────────────
async function createMenu(req, res) {
  const { name, categoryId, price, description, imageUrl } = req.body;

  // Validasi field wajib
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nama menu wajib diisi' });
  }
  if (!categoryId) {
    return res.status(400).json({ error: 'Kategori wajib dipilih' });
  }
  if (price === undefined || price === null || isNaN(parseFloat(price))) {
    return res.status(400).json({ error: 'Harga wajib diisi dengan angka valid' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO menu (nama_menu, kategori_id, harga, deskripsi, image) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), parseInt(categoryId), parseFloat(price), description || null, imageUrl || null]
    );
    res.status(201).json({
      success: true,
      id:      result.insertId,
      message: 'Menu berhasil ditambahkan'
    });
  } catch (err) {
    console.error('createMenu error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── UPDATE MENU ─────────────────────────────────────────────────────────────
async function updateMenu(req, res) {
  const { id } = req.params;
  const { name, categoryId, price, description, imageUrl } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nama menu wajib diisi' });
  }

  try {
    const [result] = await db.query(
      `UPDATE menu
       SET nama_menu   = ?,
           kategori_id = ?,
           harga       = ?,
           deskripsi   = ?,
           image       = ?,
           updated_at  = NOW()
       WHERE id = ?`,
      [name.trim(), parseInt(categoryId), parseFloat(price), description || null, imageUrl || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    res.json({ success: true, message: 'Menu berhasil diperbarui' });
  } catch (err) {
    console.error('updateMenu error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

// ─── HAPUS MENU (Soft Delete) ─────────────────────────────────────────────────
async function deleteMenu(req, res) {
  const { id } = req.params;
  try {
    // Gunakan soft delete agar data historis masih tersimpan
    const [result] = await db.query(
      'UPDATE menu SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    res.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (err) {
    console.error('deleteMenu error:', err.message);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
}

module.exports = {
  getCategories,
  getMenus,
  getMenuById,
  getMenusByCategory,
  addCategory,
  deleteCategory,
  createMenu,
  updateMenu,
  deleteMenu
};
