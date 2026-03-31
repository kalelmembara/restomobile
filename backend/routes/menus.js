/**
 * Menu Routes
 * Base path: /api/menus
 *
 * PERHATIAN: Urutan route penting!
 * Route spesifik seperti /categories dan /category/:id
 * harus dideklarasikan SEBELUM /:id agar tidak bertabrakan.
 */

const express        = require('express');
const router         = express.Router();
const menuController = require('../controllers/menuController');

// ─── CATEGORY ROUTES ─────────────────────────────────────────────────────────
// GET  /api/menus/categories           → ambil semua kategori
router.get('/categories', menuController.getCategories);

// POST /api/menus/categories           → tambah kategori baru
router.post('/categories', menuController.addCategory);

// DELETE /api/menus/categories/:id     → hapus kategori
router.delete('/categories/:id', menuController.deleteCategory);

// GET /api/menus/category/:categoryId  → menu berdasarkan kategori
router.get('/category/:categoryId', menuController.getMenusByCategory);

// ─── MENU ROUTES ─────────────────────────────────────────────────────────────
// GET    /api/menus                    → semua menu
router.get('/', menuController.getMenus);

// GET    /api/menus/:id                → detail menu by ID
router.get('/:id', menuController.getMenuById);

// POST   /api/menus                    → tambah menu baru
router.post('/', menuController.createMenu);

// PUT    /api/menus/:id                → update menu
router.put('/:id', menuController.updateMenu);

// DELETE /api/menus/:id                → hapus menu
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
