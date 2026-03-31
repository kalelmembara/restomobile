/**
 * Transaction Controller - MySQL Version
 * Database: db_resto (tabel: transaksi)
 */

const db = require('../config/database');

// ─── HELPER: Generate Transaction ID ─────────────────────────────────────────
function generateTransactionId() {
  const date    = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.getTime().toString().slice(-6);
  return `TRX${dateStr}${timeStr}`;
}

// ─── CREATE TRANSACTION ───────────────────────────────────────────────────────
async function createTransaction(req, res) {
  const { date, time, items, total, paymentMethod, status = 'completed', note, customerName } = req.body;

  if (!date || !time || !items || total === undefined || !paymentMethod) {
    return res.status(400).json({
      error:    'Field tidak lengkap',
      required: ['date', 'time', 'items', 'total', 'paymentMethod']
    });
  }

  const transactionId = generateTransactionId();
  const itemsJson     = JSON.stringify(items);

  try {
    await db.query(
      `INSERT INTO transaksi (transaction_id, tanggal, waktu, items, total, payment_method, status, catatan, nama_pelanggan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, date, time, itemsJson, total, paymentMethod, status, note || null, customerName || 'Guest']
    );

    res.status(201).json({
      success:       true,
      id:            transactionId,
      transactionId: transactionId,
      message:       'Transaksi berhasil dibuat'
    });
  } catch (err) {
    console.error('createTransaction error:', err.message);
    res.status(500).json({ error: 'Gagal membuat transaksi', details: err.message });
  }
}

// ─── GET ALL TRANSACTIONS ─────────────────────────────────────────────────────
async function getTransactions(req, res) {
  const { date } = req.query;

  try {
    let sql    = `SELECT * FROM transaksi WHERE status IN ('completed','confirmed','paid') ORDER BY created_at DESC`;
    let params = [];

    if (date) {
      sql    = `SELECT * FROM transaksi WHERE tanggal = ? AND status IN ('completed','confirmed','paid') ORDER BY created_at DESC`;
      params = [date];
    }

    const [rows] = await db.query(sql, params);

    const transactions = (rows || []).map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }));

    res.json(transactions);
  } catch (err) {
    console.error('getTransactions error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data transaksi', details: err.message });
  }
}

// ─── GET DAILY SUMMARY ────────────────────────────────────────────────────────
async function getDailySummary(req, res) {
  const { date }    = req.query;
  const queryDate   = date || new Date().toISOString().split('T')[0];

  try {
    const [rows] = await db.query(
      `SELECT
         tanggal,
         COUNT(*)   AS transactionCount,
         SUM(total) AS totalSales,
         GROUP_CONCAT(items SEPARATOR '|||') AS itemsList
       FROM transaksi
       WHERE tanggal = ? AND status IN ('completed','confirmed','paid')
       GROUP BY tanggal`,
      [queryDate]
    );

    if (!rows || rows.length === 0) {
      return res.json({ totalSales: 0, transactionCount: 0, topProduct: '-' });
    }

    const row        = rows[0];
    let topProduct   = '-';

    if (row.itemsList) {
      try {
        const productCount = {};
        row.itemsList.split('|||').forEach(jsonStr => {
          const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
          (Array.isArray(parsed) ? parsed : [parsed]).forEach(item => {
            productCount[item.name] = (productCount[item.name] || 0) + (item.qty || 1);
          });
        });
        const sorted = Object.entries(productCount).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) topProduct = sorted[0][0];
      } catch (e) {
        console.error('Error parsing items:', e);
      }
    }

    res.json({
      totalSales:       parseFloat(row.totalSales) || 0,
      transactionCount: parseInt(row.transactionCount) || 0,
      topProduct:       topProduct
    });
  } catch (err) {
    console.error('getDailySummary error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil summary harian', details: err.message });
  }
}

// ─── GET WEEKLY STATS ─────────────────────────────────────────────────────────
async function getWeeklyStats(req, res) {
  const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const data   = [0, 0, 0, 0, 0, 0, 0];

  try {
    const [rows] = await db.query(
      `SELECT
         DAYOFWEEK(tanggal) AS dayOfWeek,
         SUM(total)         AS dailyTotal
       FROM transaksi
       WHERE status IN ('completed','confirmed','paid')
         AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DAYOFWEEK(tanggal)`
    );

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        // MySQL DAYOFWEEK: 1=Sunday, 2=Monday, ... 7=Saturday
        // Kita mau: 0=Senin, 1=Selasa, ..., 5=Sabtu, 6=Minggu
        const dayIndex     = parseInt(row.dayOfWeek); // 1-7
        const adjustedIdx  = dayIndex === 1 ? 6 : dayIndex - 2; // Sunday=6, Mon=0
        if (adjustedIdx >= 0 && adjustedIdx < 7) {
          data[adjustedIdx] = parseFloat(row.dailyTotal) || 0;
        }
      });
    }

    res.json({ labels, data });
  } catch (err) {
    console.error('getWeeklyStats error:', err.message);
    res.json({ labels, data }); // Return zero data on error
  }
}

// ─── GET MONTHLY STATS ────────────────────────────────────────────────────────
async function getMonthlyStats(req, res) {
  const labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
  const data   = [0, 0, 0, 0];

  try {
    const [rows] = await db.query(
      `SELECT
         FLOOR((DAY(tanggal) - 1) / 7) AS week,
         SUM(total) AS weeklyTotal
       FROM transaksi
       WHERE status IN ('completed','confirmed','paid')
         AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY week`
    );

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        const weekIdx = parseInt(row.week);
        if (weekIdx < 4) data[weekIdx] = parseFloat(row.weeklyTotal) || 0;
      });
    }

    res.json({ labels, data });
  } catch (err) {
    console.error('getMonthlyStats error:', err.message);
    res.json({ labels, data });
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getDailySummary,
  getWeeklyStats,
  getMonthlyStats
};
