/**
 * FRONTEND DIAGNOSTICS - for Browser Console
 * 
 * Copy-paste ke Browser DevTools Console (F12) untuk diagnostic
 * 
 * USAGE:
 * 1. Buka aplikasi di http://localhost:5173
 * 2. Tekan F12 untuk buka DevTools
 * 3. Klik tab "Console"
 * 4. Copy-paste kode ini dan tekan Enter
 */

(async function diagnoseBackendConnection() {
  const API_URL = 'http://localhost:3000/api';
  const HEALTH_URL = 'http://localhost:3000/health';

  console.log('%c╔════════════════════════════════════════╗', 'color: cyan; font-weight: bold;');
  console.log('%c║  RESTO APP - FRONTEND DIAGNOSTICS      ║', 'color: cyan; font-weight: bold;');
  console.log('%c╚════════════════════════════════════════╝', 'color: cyan; font-weight: bold;');

  // Test 1: Health Check
  console.log('\n%c🔵 TEST 1: Backend Health Check', 'color: blue; font-weight: bold;');
  console.log(`%cURL: ${HEALTH_URL}`, 'color: cyan;');

  try {
    const startTime = performance.now();
    const healthResponse = await fetch(HEALTH_URL);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log(`%c✅ Status: ${healthResponse.status} ${healthResponse.statusText}`, 'color: green;');
      console.log(`%cResponse Time: ${responseTime}ms`, 'color: green;');
      console.log('%cData:', 'color: green;', data);
    } else {
      console.log(`%c⚠️ Status: ${healthResponse.status} ${healthResponse.statusText}`, 'color: orange;');
    }
  } catch (error) {
    console.log(`%c❌ Error: ${error.message}`, 'color: red; font-weight: bold;');
    console.log(`%cError Type: ${error.name}`, 'color: red;');
    if (error.message.includes('CORS')) {
      console.log('%c→ CORS ISSUE DETECTED!', 'color: red; font-weight: bold;');
    } else if (error.message.includes('Failed')) {
      console.log('%c→ Connection refused or backend not running', 'color: red; font-weight: bold;');
    }
  }

  // Test 2: POST Endpoint
  console.log('\n%c🟠 TEST 2: Test POST Endpoint', 'color: blue; font-weight: bold;');
  console.log(`%cURL: POST ${API_URL}/transactions`, 'color: cyan;');

  const testPayload = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('id-ID'),
    items: [{ name: 'Test Item', qty: 1, price: 10000 }],
    total: 10000,
    paymentMethod: 'cash',
    customerName: 'Diagnostic Test'
  };

  console.log('%cPayload:', 'color: cyan;', testPayload);

  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`%c✅ Status: ${response.status} ${response.statusText}`, 'color: green;');

    const responseData = await response.json();
    console.log('%cResponse:', 'color: green;', responseData);

    if (responseData.id || responseData.transactionId) {
      console.log(`%c✅ Transaction created: ${responseData.id || responseData.transactionId}`, 'color: green; font-weight: bold;');
    }
  } catch (error) {
    console.log(`%c❌ Error: ${error.message}`, 'color: red; font-weight: bold;');
  }

  // Test 3: GET Endpoint
  console.log('\n%c🟢 TEST 3: Test GET Endpoint', 'color: blue; font-weight: bold;');
  console.log(`%cURL: GET ${API_URL}/transactions`, 'color: cyan;');

  try {
    const response = await fetch(`${API_URL}/transactions`);

    console.log(`%c✅ Status: ${response.status}`, 'color: green;');

    const data = await response.json();

    if (Array.isArray(data)) {
      console.log(`%c✅ Found ${data.length} transactions`, 'color: green;');
      if (data.length > 0) {
        console.log('%cLatest transaction:', 'color: green;', data[0]);
      }
    } else {
      console.log('%cResponse:', 'color: green;', data);
    }
  } catch (error) {
    console.log(`%c❌ Error: ${error.message}`, 'color: red;');
  }

  // Test 4: Check Environment Variables
  console.log('\n%c⚙️ TEST 4: Environment Configuration', 'color: blue; font-weight: bold;');
  console.log(`%cVITE_API_URL: ${import.meta.env.VITE_API_URL || 'Not set'}`, 'color: cyan;');

  // Test 5: Check localStorage
  console.log('\n%c💾 TEST 5: LocalStorage Status', 'color: blue; font-weight: bold;');

  const pendingTransactions = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
  console.log(`%cPending Transactions: ${pendingTransactions.length}`, 'color: cyan;');

  if (pendingTransactions.length > 0) {
    console.log('%c⚠️ There are offline transactions waiting to sync!', 'color: orange; font-weight: bold;');
    console.log('%cData:', 'color: orange;', pendingTransactions);
  }

  // Test 6: Network Request Headers
  console.log('\n%c🔒 TEST 6: CORS Headers Check', 'color: blue; font-weight: bold;');

  try {
    const response = await fetch(HEALTH_URL);
    const corsOrigin = response.headers.get('access-control-allow-origin');
    const corsHeaders = response.headers.get('access-control-allow-headers');
    const corsMethods = response.headers.get('access-control-allow-methods');

    console.log(`%cAccess-Control-Allow-Origin: ${corsOrigin || 'Not set'}`, 'color: cyan;');
    console.log(`%cAccess-Control-Allow-Headers: ${corsHeaders || 'Not set'}`, 'color: cyan;');
    console.log(`%cAccess-Control-Allow-Methods: ${corsMethods || 'Not set'}`, 'color: cyan;');

    if (corsOrigin === '*' || corsOrigin === location.origin) {
      console.log('%c✅ CORS is properly configured', 'color: green; font-weight: bold;');
    }
  } catch (error) {
    console.log(`%c⚠️ Could not check CORS headers: ${error.message}`, 'color: orange;');
  }

  // Final Summary
  console.log('\n%c═══════════════════════════════════════', 'color: cyan;');
  console.log('%c📋 SUMMARY', 'color: cyan; font-weight: bold;');
  console.log('%c═══════════════════════════════════════', 'color: cyan;');
  console.log('%cIf all tests passed green (✅), backend is working!', 'color: green; font-weight: bold;');
  console.log('%cIf any test failed, check the error messages above.', 'color: yellow;');

  console.log('\n%cℹ️ Need more help?', 'color: blue; font-weight: bold;');
  console.log('%cOpen file: DIAGNOSTIK_BACKEND_OFFLINE.md', 'color: blue;');
  console.log('%cOr run: node backend-diagnostics.js', 'color: blue;');
})();

// Helper: Quick test function
globalThis.testBackend = async () => {
  console.log('\nQuick test - calling health endpoint...');
  try {
    const res = await fetch('http://localhost:3000/health');
    const data = await res.json();
    console.log('✅ Backend is working!', data);
  } catch (err) {
    console.error('❌ Backend error:', err.message);
  }
};

console.log('\n%c💡 Tip: Type testBackend() untuk quick check', 'color: blue; font-weight: bold;');
