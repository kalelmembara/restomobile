const db = require('../db');

// Generate transaction ID
function generateTransactionId() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.getTime().toString().slice(-6);
  return `TRX${dateStr}${timeStr}`;
}

// Create new transaction
function createTransaction(req, res) {
  const { date, time, items, total, paymentMethod, status = 'completed', note, customerName } = req.body;

  // Validasi input
  if (!date || !time || !items || total === undefined || !paymentMethod) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['date', 'time', 'items', 'total', 'paymentMethod']
    });
  }

  const transactionId = generateTransactionId();
  const itemsJson = JSON.stringify(items);

  const sql = `
    INSERT INTO transactions (transaction_id, date, time, items, total, payment_method, status, note, customer_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [transactionId, date, time, itemsJson, total, paymentMethod, status, note, customerName || 'Unknown'], function(err) {
    if (err) {
      console.error('Error creating transaction:', err);
      return res.status(500).json({ error: 'Failed to create transaction', details: err.message });
    }

    res.status(201).json({
      success: true,
      id: transactionId,
      transactionId: transactionId,
      message: 'Transaction created successfully'
    });
  });
}

// Get all transactions
function getTransactions(req, res) {
  const { date } = req.query;

  // ✅ Define confirmed statuses
  const CONFIRMED_STATUSES = ['completed', 'confirmed', 'paid'];
  const placeholders = CONFIRMED_STATUSES.map(() => '?').join(',');

  let sql = `SELECT * FROM transactions WHERE status IN (${placeholders}) ORDER BY created_at DESC`;
  let params = [...CONFIRMED_STATUSES];

  if (date) {
    sql = `SELECT * FROM transactions WHERE date = ? AND status IN (${placeholders}) ORDER BY created_at DESC`;
    params = [date, ...CONFIRMED_STATUSES];
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    // Parse items JSON
    const transactions = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));

    res.json(transactions);
  });
}

// Get daily summary
function getDailySummary(req, res) {
  const { date } = req.query;
  const queryDate = date || new Date().toISOString().split('T')[0];

  // ✅ Include all confirmed statuses
  const CONFIRMED_STATUSES = ['completed', 'confirmed', 'paid'];
  const placeholders = CONFIRMED_STATUSES.map(() => '?').join(',');

  const sql = `
    SELECT 
      date,
      COUNT(*) as transactionCount,
      SUM(total) as totalSales,
      GROUP_CONCAT(DISTINCT items) as itemsList
    FROM transactions
    WHERE date = ? AND status IN (${placeholders})
    GROUP BY date
  `;

  db.get(sql, [queryDate, ...CONFIRMED_STATUSES], (err, row) => {
    if (err) {
      console.error('Error fetching daily summary:', err);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }

    if (!row) {
      return res.json({
        totalSales: 0,
        transactionCount: 0,
        topProduct: '-'
      });
    }

    // Calculate top product
    let topProduct = '-';
    if (row.itemsList) {
      const productCount = {};
      try {
        const allItems = row.itemsList.split(',').map(item => JSON.parse(item)).flat();
        allItems.forEach(item => {
          productCount[item.name] = (productCount[item.name] || 0) + item.qty;
        });
        topProduct = Object.entries(productCount).length > 0
          ? Object.entries(productCount).sort((a, b) => b[1] - a[1])[0][0]
          : '-';
      } catch (e) {
        console.error('Error parsing items:', e);
      }
    }

    res.json({
      totalSales: row.totalSales || 0,
      transactionCount: row.transactionCount || 0,
      topProduct: topProduct
    });
  });
}

// Get weekly statistics
function getWeeklyStats(req, res) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [0, 0, 0, 0, 0, 0, 0];

  // ✅ Include all confirmed statuses
  const CONFIRMED_STATUSES = ['completed', 'confirmed', 'paid'];
  const placeholders = CONFIRMED_STATUSES.map(() => '?').join(',');

  const sql = `
    SELECT 
      strftime('%w', date) as dayOfWeek,
      SUM(total) as dailyTotal
    FROM transactions
    WHERE status IN (${placeholders})
      AND date >= date('now', '-7 days')
    GROUP BY dayOfWeek
  `;

  db.all(sql, CONFIRMED_STATUSES, (err, rows) => {
    if (err) {
      console.error('Error fetching weekly stats:', err);
      return res.status(500).json({ error: 'Failed to fetch weekly stats' });
    }

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        const dayIndex = parseInt(row.dayOfWeek);
        // SQLite: Sunday=0, Monday=1... but we want Monday=0
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        data[adjustedIndex] = row.dailyTotal || 0;
      });
    }

    res.json({ labels, data });
  });
}

// Get monthly statistics
function getMonthlyStats(req, res) {
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const data = [0, 0, 0, 0];

  // ✅ Include all confirmed statuses
  const CONFIRMED_STATUSES = ['completed', 'confirmed', 'paid'];
  const placeholders = CONFIRMED_STATUSES.map(() => '?').join(',');

  const sql = `
    SELECT 
      CAST((strftime('%d', date) - 1) / 7 AS INTEGER) as week,
      SUM(total) as weeklyTotal
    FROM transactions
    WHERE status IN (${placeholders})
      AND date >= date('now', '-30 days')
    GROUP BY week
  `;

  db.all(sql, CONFIRMED_STATUSES, (err, rows) => {
    if (err) {
      console.error('Error fetching monthly stats:', err);
      return res.status(500).json({ error: 'Failed to fetch monthly stats' });
    }

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        if (row.week < 4) {
          data[row.week] = row.weeklyTotal || 0;
        }
      });
    }

    res.json({ labels, data });
  });
}

module.exports = {
  createTransaction,
  getTransactions,
  getDailySummary,
  getWeeklyStats,
  getMonthlyStats
};
