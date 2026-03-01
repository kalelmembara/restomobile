/**
 * Initialize Database Schema untuk Menu Management
 * Run: node setup-menu-schema.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'resto.db');
const db = new sqlite3.Database(dbPath);

console.log('═══════════════════════════════════════════════');
console.log('📊 Setting up Menu Management Database Schema');
console.log('═══════════════════════════════════════════════\n');

// Create categories table
const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

// Create menus table
const createMenusTable = `
CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
)
`;

db.serialize(() => {
  // Create categories table
  db.run(createCategoriesTable, (err) => {
    if (err) {
      console.error('❌ Error creating categories table:', err.message);
    } else {
      console.log('✅ Categories table created/exists');
    }
  });

  // Create menus table
  db.run(createMenusTable, (err) => {
    if (err) {
      console.error('❌ Error creating menus table:', err.message);
    } else {
      console.log('✅ Menus table created/exists');
    }
  });

  // Insert default categories if not exist
  const defaultCategories = [
    { name: 'Makanan', description: 'Menu utama makanan', icon: '🍗' },
    { name: 'Minuman', description: 'Menu minuman', icon: '🥤' },
    { name: 'Snack', description: 'Menu snack/cemilan', icon: '🍕' },
    { name: 'Dessert', description: 'Menu dessert/penutup', icon: '🍰' },
    { name: 'Paket Hemat', description: 'Paket promosi', icon: '💰' }
  ];

  console.log('\n📝 Inserting default categories...\n');

  defaultCategories.forEach((cat) => {
    db.run(
      'INSERT OR IGNORE INTO menu_categories (name, description, icon) VALUES (?, ?, ?)',
      [cat.name, cat.description, cat.icon],
      function(err) {
        if (err) {
          console.error(`❌ Error inserting ${cat.name}:`, err.message);
        } else if (this.changes > 0) {
          console.log(`✅ Added category: ${cat.name}`);
        } else {
          console.log(`✓ Category already exists: ${cat.name}`);
        }
      }
    );
  });

  // Show all categories
  setTimeout(() => {
    db.all('SELECT * FROM menu_categories ORDER BY name', (err, rows) => {
      if (!err && rows.length > 0) {
        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ All Categories:');
        console.log('═══════════════════════════════════════════════');
        rows.forEach((cat, idx) => {
          console.log(`${idx + 1}. ${cat.icon} ${cat.name}`);
        });
      }
      
      console.log('\n✅ Database schema setup completed!');
      db.close();
    });
  }, 500);
});
