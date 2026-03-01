-- RestaurantApp Database Schema
-- Created: 2026-02-28
-- Description: Database untuk aplikasi manajemen restoran

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,  -- Format: YYYY-MM-DD
  time TEXT NOT NULL,  -- Format: HH:MM:SS
  items TEXT NOT NULL,  -- JSON format: [{"name":"...", "qty":..., "price":...}, ...]
  total REAL NOT NULL,  -- Total harga transaksi
  payment_method TEXT NOT NULL,  -- cash, transfer, qris
  status TEXT DEFAULT 'completed',  -- completed, cancelled
  note TEXT,  -- Catatan pesanan (opsional)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_payment_method (payment_method),
  INDEX idx_status (status)
);

-- =====================================================
-- DAILY SUMMARY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL,  -- Format: YYYY-MM-DD
  total_sales REAL DEFAULT 0,  -- Total penjualan hari itu
  transaction_count INTEGER DEFAULT 0,  -- Jumlah transaksi
  top_product TEXT,  -- Produk terlaris
  cash_sales REAL DEFAULT 0,  -- Penjualan via cash
  transfer_sales REAL DEFAULT 0,  -- Penjualan via transfer
  qris_sales REAL DEFAULT 0,  -- Penjualan via QRIS
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SAMPLE INSERT QUERIES
-- =====================================================

-- Insert sample transaction
INSERT INTO transactions (
  transaction_id,
  date,
  time,
  items,
  total,
  payment_method,
  status,
  note
) VALUES (
  'TRX202602281430',
  '2026-02-28',
  '14:30:45',
  '[{"name":"Nasi Goreng Spesial","qty":2,"price":25000},{"name":"Teh Dingin","qty":2,"price":5000}]',
  60000,
  'cash',
  'completed',
  'Tanpa gula, pedas sedang'
);

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get daily summary
SELECT 
  date,
  COUNT(*) as transaction_count,
  SUM(total) as total_sales,
  GROUP_CONCAT(DISTINCT items) as items_list
FROM transactions
WHERE date = '2026-02-28' AND status = 'completed'
GROUP BY date;

-- Get revenue by payment method
SELECT 
  payment_method,
  COUNT(*) as transaction_count,
  SUM(total) as total_sales
FROM transactions
WHERE date = '2026-02-28' AND status = 'completed'
GROUP BY payment_method;

-- Get weekly statistics
SELECT 
  strftime('%w', date) as day_of_week,
  SUM(total) as daily_total
FROM transactions
WHERE status = 'completed'
  AND date >= date('now', '-7 days')
GROUP BY day_of_week
ORDER BY day_of_week;

-- Get monthly statistics
SELECT 
  CAST((strftime('%d', date) - 1) / 7 AS INTEGER) as week,
  SUM(total) as weekly_total
FROM transactions
WHERE status = 'completed'
  AND date >= date('now', '-30 days')
GROUP BY week
ORDER BY week;

-- Get top products of the day
-- Note: Requires parsing JSON, so this is pseudo-SQL
-- In real implementation, use backend code to parse JSON
SELECT 
  date,
  GROUP_CONCAT(items) as items_json
FROM transactions
WHERE date = '2026-02-28' AND status = 'completed'
GROUP BY date;

-- Get transaction by date range
SELECT * FROM transactions
WHERE date BETWEEN '2026-02-01' AND '2026-02-28'
ORDER BY date DESC, time DESC;

-- Get transaction statistics
SELECT 
  DATE(created_at) as transaction_date,
  COUNT(*) as total_transactions,
  AVG(total) as avg_transaction_value,
  MIN(total) as min_transaction_value,
  MAX(total) as max_transaction_value,
  SUM(total) as total_revenue
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Clear old transactions (older than 90 days)
DELETE FROM transactions
WHERE date < date('now', '-90 days');

-- Count total transactions
SELECT COUNT(*) as total_transactions FROM transactions;

-- Get database size info
SELECT 
  (SELECT COUNT(*) FROM transactions) as transaction_count,
  (SELECT SUM(total) FROM transactions WHERE status = 'completed') as total_revenue
FROM transactions LIMIT 1;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(date);
