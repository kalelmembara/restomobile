/**
 * Menu Routes
 */

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Categories endpoints
router.get('/categories', menuController.getCategories);
router.post('/categories', menuController.addCategory);
router.delete('/categories/:id', menuController.deleteCategory);

// Menu endpoints
router.get('/', menuController.getMenus);
router.get('/category/:categoryId', menuController.getMenusByCategory);
router.post('/', menuController.createMenu);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
