/**
 * MySQL Database Connection
 * Menghubungkan backend ke db_resto di phpMyAdmin (MySQL)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Buat connection pool agar lebih efisien
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'db_resto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  // Nonaktifkan STRICT_TRANS_TABLES agar TIMESTAMP '' tidak error
  // Ini langsung di-set tiap koneksi baru via connectionLimit init query
  timezone: 'local'
});

// Set SQL mode untuk setiap koneksi baru di pool
// agar MySQL tidak reject TIMESTAMP value '' (masalah umum di XAMPP)
const originalQuery = pool.query.bind(pool);

async function initConnection(conn) {
  await conn.query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
}

// Override getConnection untuk inject sql_mode
const _getConnection = pool.getConnection.bind(pool);
pool.getConnection = async function(...args) {
  const conn = await _getConnection(...args);
  await conn.query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
  return conn;
};

// Test koneksi saat startup
pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database:', process.env.DB_NAME || 'db_resto');
    conn.release();
  })
  .catch(err => {
    console.error('Gagal koneksi MySQL:', err.message);
    console.error('   Pastikan XAMPP/MySQL sudah berjalan dan db_resto ada');
  });

module.exports = pool;
