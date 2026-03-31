const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'resto.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      note TEXT,
      customer_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err);
    } else {
      console.log('Transactions table ready');
    }
  });

  // Create daily summary view
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      total_sales REAL DEFAULT 0,
      transaction_count INTEGER DEFAULT 0,
      top_product TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating daily_summary table:', err);
    } else {
      console.log('Daily summary table ready');
    }
  });

  // ========== MENU MANAGEMENT (tabel menus + menu_categories) ==========
  // Dibuat otomatis saat server start agar halaman menu bisa menampilkan data
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating menu_categories table:', err);
    } else {
      console.log('Menu categories table ready');
    }
  });

  db.run(`
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
  `, (err) => {
    if (err) {
      console.error('Error creating menus table:', err);
    } else {
      console.log('Menus table ready');
      seedMenuData();
    }
  });
}

/**
 * Seed data menu & kategori jika masih kosong
 * Memastikan halaman visitor-menu dan manajemen-menu menampilkan data
 */
function seedMenuData() {
  const defaultCategories = [
    { name: 'Makanan', description: 'Menu utama makanan', icon: '🍗' },
    { name: 'Minuman', description: 'Menu minuman', icon: '🥤' },
    { name: 'Snack', description: 'Menu snack/cemilan', icon: '🍕' },
  ];

  db.serialize(() => {
    defaultCategories.forEach((cat) => {
      db.run(
        'INSERT OR IGNORE INTO menu_categories (name, description, icon) VALUES (?, ?, ?)',
        [cat.name, cat.description, cat.icon]
      );
    });

    db.get('SELECT COUNT(*) as count FROM menus', (err, row) => {
      if (err) return console.error('Error checking menus:', err);
      if (row && row.count > 0) {
        console.log('Menu data already exists, skip seed');
        return;
      }

      const defaultMenus = [
        { name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000, desc: 'Nasi goreng dengan telur, ayam, dan kerupuk.' },
        { name: 'Mie Goreng Jawa', category: 'Makanan', price: 22000, desc: 'Mie goreng bumbu jawa asli.' },
        { name: 'Ayam Bakar Madu', category: 'Makanan', price: 30000, desc: 'Ayam bakar dengan olesan madu manis gurih.' },
        { name: 'Sate Ayam', category: 'Makanan', price: 28000, desc: 'Sate ayam dengan bumbu kacang.' },
        { name: 'Gado-Gado', category: 'Makanan', price: 20000, desc: 'Sayuran segar dengan bumbu kacang.' },
        { name: 'Es Teh Manis', category: 'Minuman', price: 5000, desc: 'Teh dingin dengan es.' },
        { name: 'Es Jeruk', category: 'Minuman', price: 7000, desc: 'Jeruk segar dengan es.' },
        { name: 'Kopi Tubruk', category: 'Minuman', price: 8000, desc: 'Kopi tubruk tradisional.' },
        { name: 'Jus Alpukat', category: 'Minuman', price: 15000, desc: 'Jus alpukat segar.' },
      ];

      defaultMenus.forEach((m) => {
        db.run(
          `INSERT INTO menus (name, category_id, price, description, is_active)
           SELECT ?, (SELECT id FROM menu_categories WHERE name = ? LIMIT 1), ?, ?, 1`,
          [m.name, m.category, m.price, m.desc]
        );
      });
      console.log('✅ Menu seed data inserted');
    });
  });
}

module.exports = db;
