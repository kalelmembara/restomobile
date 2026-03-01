// 🧪 QUICK TEST SCRIPT - Copy-paste ini di browser console (F12)
// Test backend, API, dan database connection

console.log('🧪 Starting quick test...\n');

// Test 1: Health Check
console.log('1️⃣ Testing /health endpoint...');
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Health check passed:', data);
    
    // Test 2: Get Transactions
    console.log('\n2️⃣ Testing GET /api/transactions...');
    return fetch('http://localhost:3000/api/transactions');
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Get transactions passed:');
    console.log(`   Database has ${data.length} transaction(s)`);
    if (data.length > 0) {
      console.log('   First transaction:', data[0]);
    } else {
      console.log('   ⚠️ Database empty - no orders yet');
    }
    
    // Test 3: Today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n3️⃣ Testing GET /api/transactions?date=${today}...`);
    return fetch(`http://localhost:3000/api/transactions?date=${today}`);
  })
  .then(r => r.json())
  .then(data => {
    console.log(`✅ Get today's transactions passed: ${data.length} order(s)`);
    
    // Test 4: Create dummy transaction
    console.log('\n4️⃣ Testing POST /api/transactions (creating test order)...');
    
    const testTransaction = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('id-ID'),
      items: [
        { name: 'Nasi Goreng', qty: 1, price: 25000 },
        { name: 'Kopi Tubruk', qty: 1, price: 8000 }
      ],
      total: 33000,
      paymentMethod: 'cash',
      status: 'completed',
      customerName: 'Test Customer',
      note: 'No sugar'
    };
    
    return fetch('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTransaction)
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Create transaction passed:');
    console.log('   Transaction ID:', data.id);
    console.log('   Message:', data.message);
    
    // Test 5: Verify it was saved
    console.log('\n5️⃣ Verifying transaction was saved...');
    return fetch('http://localhost:3000/api/transactions');
  })
  .then(r => r.json())
  .then(data => {
    console.log(`✅ Database now has ${data.length} transaction(s)`);
    console.log('Latest transaction:', data[0]);
    
    console.log('\n✅ ALL TESTS PASSED! Backend is working correctly.\n');
    console.log('📋 Next steps:');
    console.log('   1. Refresh Employee Dashboard (Ctrl+R or F5)');
    console.log('   2. See if order appears with customer name "Test Customer"');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    console.error('Make sure:');
    console.error('  ✓ Backend is running (npm run dev in backend/ folder)');
    console.error('  ✓ Port 3000 is accessible');
    console.error('  ✓ No CORS errors');
  });
