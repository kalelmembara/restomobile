#!/usr/bin/env node

/**
 * Backend Diagnostic Script
 * Untuk troubleshoot koneksi antara frontend dan backend
 * 
 * Run: node backend-diagnostics.js
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Color codes untuk terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function divider() {
  log('cyan', '═══════════════════════════════════════════════════');
}

/**
 * Test 1: Ping backend health endpoint
 */
async function testHealthEndpoint() {
  return new Promise((resolve) => {
    log('blue', '\n📡 TEST 1: Backend Health Check');
    log('cyan', `URL: ${BACKEND_URL}/health`);

    const startTime = Date.now();
    const request = http.get(`${BACKEND_URL}/health`, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let data = '';
      res.on('data', (chunk) => { data += chunk; });

      res.on('end', () => {
        const status = res.statusCode;
        const statusEmoji = status === 200 ? '✅' : '❌';

        log('yellow', `Status: ${statusEmoji} ${status} ${res.statusMessage}`);
        log('yellow', `Response Time: ${responseTime}ms`);

        if (status === 200) {
          try {
            const json = JSON.parse(data);
            log('green', `✅ Backend Response:`);
            console.log(JSON.stringify(json, null, 2));
            resolve({ success: true, status, data: json, responseTime });
          } catch (e) {
            log('yellow', `Response: ${data}`);
            resolve({ success: true, status, data, responseTime });
          }
        } else {
          log('red', `Response: ${data}`);
          resolve({ success: false, status, data, responseTime });
        }
      });
    });

    request.on('error', (err) => {
      log('red', `❌ Connection Error: ${err.message}`);
      log('red', `   Code: ${err.code}`);
      
      if (err.code === 'ECONNREFUSED') {
        log('red', '   → Backend tidak berjalan atau port salah');
      } else if (err.code === 'ENOTFOUND') {
        log('red', '   → Hostname tidak valid');
      }

      resolve({ success: false, error: err.message, code: err.code });
    });

    request.on('timeout', () => {
      request.destroy();
      log('red', '⏱️ Request Timeout (3000ms)');
      resolve({ success: false, error: 'Timeout' });
    });

    request.setTimeout(3000);
  });
}

/**
 * Test 2: Test POST endpoint
 */
async function testPostEndpoint() {
  return new Promise((resolve) => {
    log('blue', '\n🔵 TEST 2: Test POST /api/transactions');

    const testData = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('id-ID'),
      items: [
        { name: 'Tes Item', qty: 1, price: 50000 }
      ],
      total: 50000,
      paymentMethod: 'cash',
      customerName: 'Diagnostik Test',
      note: 'Test data - safe to ignore'
    };

    log('cyan', `POST: ${API_URL}/transactions`);
    log('yellow', `Payload: ${JSON.stringify(testData, null, 2)}`);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/transactions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });

      res.on('end', () => {
        const status = res.statusCode;
        const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';

        log('yellow', `Status: ${statusEmoji} ${status} ${res.statusMessage}`);

        try {
          const json = JSON.parse(data);
          log('green', `✅ Response:`);
          console.log(JSON.stringify(json, null, 2));
          resolve({ success: true, status, data: json });
        } catch (e) {
          log('yellow', `Response: ${data}`);
          resolve({ success: true, status, data });
        }
      });
    });

    req.on('error', (err) => {
      log('red', `❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.write(JSON.stringify(testData));
    req.end();
  });
}

/**
 * Test 3: Test GET endpoint
 */
async function testGetEndpoint() {
  return new Promise((resolve) => {
    log('blue', '\n🟢 TEST 3: Test GET /api/transactions');

    log('cyan', `GET: ${API_URL}/transactions`);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/transactions',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });

      res.on('end', () => {
        const status = res.statusCode;
        const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';

        log('yellow', `Status: ${statusEmoji} ${status}`);

        try {
          const json = JSON.parse(data);
          if (Array.isArray(json)) {
            log('green', `✅ Found ${json.length} transactions`);
            if (json.length > 0) {
              log('yellow', `Latest transaction:`);
              console.log(JSON.stringify(json[0], null, 2));
            }
          } else {
            console.log(JSON.stringify(json, null, 2));
          }
          resolve({ success: true, status, count: Array.isArray(json) ? json.length : 0 });
        } catch (e) {
          log('yellow', `Response: ${data}`);
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      log('red', `❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

/**
 * Test 4: Check CORS Configuration
 */
async function testCorsConfiguration() {
  return new Promise((resolve) => {
    log('blue', '\n🔒 TEST 4: CORS Configuration Check');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
      }
    };

    const req = http.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      const corsHeaders = res.headers['access-control-allow-headers'];

      log('cyan', `Origin in request: ${FRONTEND_URL}`);
      log('cyan', `CORS Allow-Origin: ${corsHeader || '❌ Not set'}`);
      log('cyan', `CORS Allow-Headers: ${corsHeaders || '❌ Not set'}`);

      if (corsHeader) {
        if (corsHeader === '*' || corsHeader === FRONTEND_URL) {
          log('green', '✅ CORS is properly configured');
          resolve({ success: true });
        } else {
          log('red', `❌ CORS origin mismatch! Expected: ${FRONTEND_URL}, Got: ${corsHeader}`);
          resolve({ success: false });
        }
      } else {
        log('red', '❌ CORS header not found');
        resolve({ success: false });
      }
    });

    req.on('error', (err) => {
      log('red', `❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

/**
 * Summary Report
 */
function printSummary(results) {
  divider();
  log('bright', '\n📋 SUMMARY REPORT');
  divider();

  const tests = [
    { name: 'Health Check', result: results.health },
    { name: 'POST Endpoint', result: results.post },
    { name: 'GET Endpoint', result: results.get },
    { name: 'CORS Config', result: results.cors }
  ];

  tests.forEach((test) => {
    const emoji = test.result?.success ? '✅' : '❌';
    log('cyan', `${emoji} ${test.name}`);
  });

  console.log();

  // Recommendations
  if (!results.health?.success) {
    divider();
    log('red', '\n⚠️ PROBLEM DETECTED: Backend is not running');
    log('yellow', '\nSolutions:');
    log('cyan', '1. Open terminal di folder "backend"');
    log('cyan', '2. Run: npm start (atau npm run dev)');
    log('cyan', '3. Tunggu sampai terlihat: 🚀 Server running at http://localhost:3000');
    log('cyan', '4. Cek port 3000 tidak digunakan oleh aplikasi lain');
  }

  if (results.health?.success && !results.post?.success) {
    divider();
    log('red', '\n⚠️ PROBLEM DETECTED: POST endpoint not working');
    log('yellow', '\nCheck:');
    log('cyan', '1. Controller di backend/controllers/transactionController.js');
    log('cyan', '2. Routes di backend/routes/transactions.js');
    log('cyan', '3. Database connection di backend/db.js');
  }

  if (!results.cors?.success) {
    divider();
    log('red', '\n⚠️ PROBLEM DETECTED: CORS may be misconfigured');
    log('yellow', '\nConfigure di backend/server.js:');
    log('cyan', `app.use(cors({\n  origin: '${FRONTEND_URL}',\n  credentials: true\n}));`);
  }

  divider();
  log('green', '\n✅ All tests passed! Backend is working correctly.\n');
  divider();
}

/**
 * Main execution
 */
async function main() {
  log('cyan', '\n╔════════════════════════════════════════════════════╗');
  log('cyan', '║        RESTO APP - BACKEND DIAGNOSTICS              ║');
  log('cyan', '╚════════════════════════════════════════════════════╝');

  log('yellow', `\nBackend URL: ${BACKEND_URL}`);
  log('yellow', `Frontend URL: ${FRONTEND_URL}`);
  log('yellow', `API Endpoint: ${API_URL}`);

  divider();
  log('blue', '\n🚀 Starting diagnostic tests...\n');

  try {
    const [health, post, get, cors] = await Promise.all([
      testHealthEndpoint(),
      testPostEndpoint(),
      testGetEndpoint(),
      testCorsConfiguration()
    ]);

    printSummary({
      health,
      post,
      get,
      cors
    });

  } catch (error) {
    log('red', `\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run
main().catch(console.error);
