#!/usr/bin/env node

/**
 * Check and Delete All Test Data - More Aggressive
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'resto.db');
const db = new sqlite3.Database(dbPath);

console.log('═══════════════════════════════════════════════');
console.log('🔍 Checking All Transactions in Database');
console.log('═══════════════════════════════════════════════\n');

db.all('SELECT transaction_id, customer_name, items FROM transactions ORDER BY transaction_id DESC', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    process.exit(1);
  }

  console.log(`📊 Total data: ${rows.length}\n`);
  
  // Parse dan identify test data
  const toDelete = [];
  
  rows.forEach((row, idx) => {
    console.log(`${idx + 1}. Transaction ID: ${row.transaction_id}`);
    console.log(`   Customer: ${row.customer_name}`);
    
    // Parse items
    let itemsDisplay = row.items;
    let itemsStr = row.items.toLowerCase();
    try {
      const items = JSON.parse(row.items);
      itemsDisplay = items.map(i => `${i.name} (${i.qty}x)`).join(', ');
      // Juga convert items list ke string untuk lebih mudah di-search
      itemsStr = items.map(i => i.name).join(' ').toLowerCase();
    } catch (e) {
      // Biarkan as-is
    }
    console.log(`   Items: ${itemsDisplay}\n`);
    
    // Check if it's test data - LEBIH AGGRESSIVE
    // Check customer name
    const customerStr = (row.customer_name || '').toLowerCase();
    
    // Check items names
    const combined = `${customerStr} ${itemsStr}`;
    
    const isTestData = combined.includes('test') || 
                       combined.includes('offline') ||
                       combined.includes('debug') ||
                       combined.includes('sample') ||
                       combined.includes('terminal') ||
                       customerStr === 'unknown' && itemsStr.includes('test'); // Unknown + Test item = test data
    
    if (isTestData) {
      toDelete.push({
        id: row.transaction_id,
        name: row.customer_name,
        items: itemsDisplay
      });
    }
  });
  
  console.log('═══════════════════════════════════════════════\n');
  
  if (toDelete.length === 0) {
    console.log('✅ Tidak ada data test! Semua data valid.');
    db.close();
    process.exit(0);
  }
  
  console.log(`⚠️  Found ${toDelete.length} test transactions to DELETE:\n`);
  
  toDelete.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.name} - ${item.items}`);
  });
  
  console.log(`\n🗑️  Deleting...\n`);
  
  // Delete them
  let deleted = 0;
  
  toDelete.forEach(item => {
    db.run('DELETE FROM transactions WHERE transaction_id = ?', [item.id], function(err) {
      if (err) {
        console.error(`❌ Error deleting ${item.id}: ${err.message}`);
      } else {
        console.log(`✅ Deleted: ${item.id}`);
        deleted++;
      }
      
      // After all deleted
      if (deleted === toDelete.length) {
        console.log(`\n🎉 Successfully deleted ${deleted} records!\n`);
        console.log('═══════════════════════════════════════════════');
        console.log('✅ Database cleaned! Remaining valid data only.');
        console.log('═══════════════════════════════════════════════');
        db.close();
        process.exit(0);
      }
    });
  });
});
