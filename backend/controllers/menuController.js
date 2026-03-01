/**
 * Menu Controller
 * CRUD operations untuk menus
 */

const db = require('../db');

// Get all categories
function getCategories(req, res) {
  db.all(
    'SELECT id, name, icon, description FROM menu_categories ORDER BY name',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }
      res.json(rows || []);
    }
  );
}

// Add new category
function addCategory(req, res) {
  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run(
    'INSERT INTO menu_categories (name, description, icon) VALUES (?, ?, ?)',
    [name, description || null, icon || '📌'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Category already exists' });
        }
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      res.status(201).json({
        success: true,
        id: this.lastID,
        name,
        description: description || null,
        icon: icon || '📌'
      });
    }
  );
}

// Get all menus with category info
function getMenus(req, res) {
  const sql = `
    SELECT 
      m.id,
      m.name,
      m.price,
      m.description,
      m.image_url,
      m.is_active,
      m.category_id,
      c.name as category_name,
      c.icon as category_icon,
      m.created_at,
      m.updated_at
    FROM menus m
    JOIN menu_categories c ON m.category_id = c.id
    ORDER BY c.name, m.name
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    res.json(rows || []);
  });
}

// Get menus by category
function getMenusByCategory(req, res) {
  const categoryId = req.params.categoryId;

  if (!categoryId) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  const sql = `
    SELECT 
      m.id,
      m.name,
      m.price,
      m.description,
      m.image_url,
      m.is_active,
      m.category_id,
      c.name as category_name
    FROM menus m
    JOIN menu_categories c ON m.category_id = c.id
    WHERE m.category_id = ? AND m.is_active = 1
    ORDER BY m.name
  `;

  db.all(sql, [categoryId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    res.json(rows || []);
  });
}

// Create new menu
function createMenu(req, res) {
  const { name, categoryId, price, description, imageUrl } = req.body;

  // Validate required fields
  if (!name || !categoryId || price === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'categoryId', 'price']
    });
  }

  // Validate price is number
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  db.run(
    'INSERT INTO menus (name, category_id, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
    [name, categoryId, parseFloat(price), description || null, imageUrl || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      res.status(201).json({
        success: true,
        id: this.lastID,
        name,
        categoryId,
        price,
        description: description || null,
        imageUrl: imageUrl || null
      });
    }
  );
}

// Update menu
function updateMenu(req, res) {
  const menuId = req.params.id;
  const { name, categoryId, price, description, imageUrl } = req.body;

  if (!menuId) {
    return res.status(400).json({ error: 'Menu ID is required' });
  }

  if (!name || !categoryId || price === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'categoryId', 'price']
    });
  }

  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  db.run(
    `UPDATE menus 
     SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, categoryId, parseFloat(price), description || null, imageUrl || null, menuId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      res.json({
        success: true,
        message: 'Menu updated successfully'
      });
    }
  );
}

// Delete menu
function deleteMenu(req, res) {
  const menuId = req.params.id;

  if (!menuId) {
    return res.status(400).json({ error: 'Menu ID is required' });
  }

  db.run(
    'DELETE FROM menus WHERE id = ?',
    [menuId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      res.json({
        success: true,
        message: 'Menu deleted successfully'
      });
    }
  );
}

// Delete category
function deleteCategory(req, res) {
  const categoryId = req.params.id;

  if (!categoryId) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  db.run(
    'DELETE FROM menu_categories WHERE id = ?',
    [categoryId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    }
  );
}

module.exports = {
  getCategories,
  addCategory,
  getMenus,
  getMenusByCategory,
  createMenu,
  updateMenu,
  deleteMenu,
  deleteCategory
};
