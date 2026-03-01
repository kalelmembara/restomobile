#!/usr/bin/env node

/**
 * Clean Database - Remove test transactions
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'resto.db');
const db = new sqlite3.Database(dbPath);

console.log('═══════════════════════════════════════');
console.log('🧹 DATABASE CLEANUP - Remove Test Data');
console.log('═══════════════════════════════════════\n');

// Get all transactions
db.all('SELECT id, transaction_id, customer_name, items, total FROM transactions ORDER BY id DESC', (err, allTransactions) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }
  
  console.log(`📊 Total transactions: ${allTransactions.length}\n`);
  
  // Identify test transactions
  const testKeywords = ['test', 'offline', 'debug', 'sample'];
  const testTransactions = [];
  
  allTransactions.forEach((tx, idx) => {
    const itemsStr = (tx.items || '').toLowerCase();
    const customerStr = (tx.customer_name || '').toLowerCase();
    const combined = `${itemsStr} ${customerStr}`;
    
    const isTest = testKeywords.some(keyword => combined.includes(keyword));
    
    if (isTest) {
      console.log(`${idx + 1}. Transaction ID: ${tx.transaction_id}`);
      console.log(`   Customer: ${tx.customer_name}`);
      console.log(`   Items: ${tx.items}`);
      console.log(`   Total: Rp ${tx.total.toLocaleString('id-ID')}\n`);
      testTransactions.push(tx.transaction_id);
    }
  });
  
  if (testTransactions.length === 0) {
    console.log('✅ Tidak ada data test ditemukan!');
    db.close();
    process.exit(0);
  }
  
  console.log(`⚠️  Found ${testTransactions.length} test transactions to delete\n`);
  
  // Delete test transactions
  let deleted = 0;
  const deleteQuery = (id) => {
    return new Promise((resolve) => {
      db.run('DELETE FROM transactions WHERE transaction_id = ?', [id], function(err) {
        if (err) {
          console.error(`❌ Error deleting ${id}:`, err.message);
        } else {
          console.log(`✅ Deleted: ${id}`);
          deleted++;
        }
        resolve();
      });
    });
  };
  
  // Delete all test transactions sequentially
  (async () => {
    for (const id of testTransactions) {
      await deleteQuery(id);
    }
    
    console.log(`\n✅ Successfully deleted ${deleted} test transactions\n`);
    
    // Show remaining transactions
    db.all('SELECT transaction_id, customer_name, items, total FROM transactions ORDER BY transaction_id DESC LIMIT 5', (err, remaining) => {
      if (!err && remaining.length > 0) {
        console.log('🟢 Valid transactions (remaining):');
        remaining.forEach((tx, idx) => {
          console.log(`${idx + 1}. ${tx.customer_name} - Rp ${tx.total.toLocaleString('id-ID')}`);
        });
      }
      
      console.log('\n═══════════════════════════════════════');
      console.log('✅ Database cleanup completed!');
      console.log('═══════════════════════════════════════');
      
      db.close();
      process.exit(0);
    });
  })();
});
