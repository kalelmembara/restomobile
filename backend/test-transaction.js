const http = require('http');

// Test data
const testTransaction = {
    date: '2026-02-28',
    time: '18:57:04',
    items: [
        { name: 'Sate Ayam', qty: 2, price: 25000 },
        { name: 'Es Jeruk', qty: 1, price: 5000 },
        { name: 'Gado-Gado', qty: 1, price: 28000 }
    ],
    total: 83000,
    paymentMethod: 'cash',
    status: 'completed',
    note: 'Tanpa gula, pedas sedang',
    customerName: 'Budi Santoso'
};

const postData = JSON.stringify(testTransaction);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/transactions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`\n✅ POST /api/transactions`);
    console.log(`Status: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', JSON.parse(data));
        
        // Now test GET
        setTimeout(() => testGetTransactions(), 1000);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();

function testGetTransactions() {
    const getOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/transactions?date=2026-02-28',
        method: 'GET'
    };

    const getReq = http.request(getOptions, (res) => {
        let data = '';

        console.log(`\n✅ GET /api/transactions?date=2026-02-28`);
        console.log(`Status: ${res.statusCode}`);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            const transactions = JSON.parse(data);
            console.log(`\nFound ${transactions.length} transaction(s):\n`);
            transactions.forEach((tx, i) => {
                console.log(`Transaction ${i + 1}:`);
                console.log(`  - Customer: ${tx.customer_name}`);
                console.log(`  - Items: ${tx.items}`);
                console.log(`  - Total: ${tx.total}`);
                console.log(`  - Note: ${tx.note || '(no note)'}`);
            });
            process.exit(0);
        });
    });

    getReq.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    getReq.end();
}
