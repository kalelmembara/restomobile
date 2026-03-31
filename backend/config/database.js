/**
 * config/database.js
 * Konfigurasi koneksi MySQL pool untuk db_resto
 *
 * Digunakan oleh semua controller.
 * Pastikan XAMPP MySQL sudah aktif sebelum menjalankan server.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'db_resto',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  dateStrings:        true,
  timezone:           'local',
  // Reconnect otomatis jika koneksi terputus
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0
});

module.exports = pool;
