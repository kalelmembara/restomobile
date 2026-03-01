# 📡 API Testing & Examples

## Base URL
```
http://localhost:3000/api
```

---

## 1. Create Transaction

### Request
```http
POST /api/transactions
Content-Type: application/json

{
  "date": "2026-02-28",
  "time": "14:30:45",
  "items": [
    {
      "name": "Nasi Goreng Spesial",
      "qty": 2,
      "price": 25000
    },
    {
      "name": "Teh Dingin",
      "qty": 2,
      "price": 5000
    }
  ],
  "total": 60000,
  "paymentMethod": "cash",
  "status": "completed",
  "note": "Tanpa gula, pedas sedang"
}
```

### Response (Success)
```json
{
  "success": true,
  "id": "TRX202602281430",
  "transactionId": "TRX202602281430",
  "message": "Transaction created successfully"
}
```

### Response (Error - Missing Fields)
```json
{
  "error": "Missing required fields",
  "required": ["date", "time", "items", "total", "paymentMethod"]
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-28",
    "time": "14:30:45",
    "items": [
      {"name": "Nasi Goreng Spesial", "qty": 2, "price": 25000},
      {"name": "Teh Dingin", "qty": 2, "price": 5000}
    ],
    "total": 60000,
    "paymentMethod": "cash",
    "note": "Tanpa gula"
  }'
```

---

## 2. Get All Transactions

### Request
```http
GET /api/transactions
```

### Response
```json
[
  {
    "id": 1,
    "transaction_id": "TRX202602281430",
    "date": "2026-02-28",
    "time": "14:30:45",
    "items": "[{\"name\":\"Nasi Goreng Spesial\",\"qty\":2,\"price\":25000},{\"name\":\"Teh Dingin\",\"qty\":2,\"price\":5000}]",
    "total": 60000,
    "payment_method": "cash",
    "status": "completed",
    "note": "Tanpa gula, pedas sedang",
    "created_at": "2026-02-28 14:30:45"
  },
  {
    "id": 2,
    "transaction_id": "TRX202602281445",
    "date": "2026-02-28",
    "time": "14:45:30",
    "items": "[{\"name\":\"Sate Ayam\",\"qty\":1,\"price\":30000}]",
    "total": 30000,
    "payment_method": "transfer",
    "status": "completed",
    "note": null,
    "created_at": "2026-02-28 14:45:30"
  }
]
```

### cURL Example
```bash
curl http://localhost:3000/api/transactions
```

---

## 3. Get Transactions by Date

### Request
```http
GET /api/transactions?date=2026-02-28
```

### Response
```json
[
  {
    "id": 1,
    "transaction_id": "TRX202602281430",
    "date": "2026-02-28",
    "time": "14:30:45",
    "items": "[{\"name\":\"Nasi Goreng Spesial\",\"qty\":2,\"price\":25000}]",
    "total": 60000,
    "payment_method": "cash",
    "status": "completed",
    "note": null,
    "created_at": "2026-02-28 14:30:45"
  }
]
```

### cURL Example
```bash
curl "http://localhost:3000/api/transactions?date=2026-02-28"
```

---

## 4. Get Daily Summary

### Request
```http
GET /api/transactions/daily/summary?date=2026-02-28
```

### Response (With Data)
```json
{
  "totalSales": 150000,
  "transactionCount": 3,
  "topProduct": "Nasi Goreng Spesial"
}
```

### Response (No Data)
```json
{
  "totalSales": 0,
  "transactionCount": 0,
  "topProduct": "-"
}
```

### cURL Example
```bash
curl "http://localhost:3000/api/transactions/daily/summary?date=2026-02-28"
```

---

## 5. Get Weekly Statistics

### Request
```http
GET /api/transactions/stats/weekly
```

### Response
```json
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "data": [150000, 200000, 180000, 220000, 250000, 300000, 280000]
}
```

### Explanation
- Monday (0): Rp 150.000
- Tuesday (1): Rp 200.000
- Wednesday (2): Rp 180.000
- Thursday (3): Rp 220.000
- Friday (4): Rp 250.000
- Saturday (5): Rp 300.000
- Sunday (6): Rp 280.000

### cURL Example
```bash
curl http://localhost:3000/api/transactions/stats/weekly
```

---

## 6. Get Monthly Statistics

### Request
```http
GET /api/transactions/stats/monthly
```

### Response
```json
{
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "data": [600000, 800000, 750000, 900000]
}
```

### Explanation
- Week 1 (1-7): Rp 600.000
- Week 2 (8-14): Rp 800.000
- Week 3 (15-21): Rp 750.000
- Week 4 (22-28): Rp 900.000

### cURL Example
```bash
curl http://localhost:3000/api/transactions/stats/monthly
```

---

## Advanced Examples

### Example 1: Multiple Items Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-28",
    "time": "15:30:00",
    "items": [
      {"name": "Nasi Goreng Spesial", "qty": 1, "price": 25000},
      {"name": "Teh Dingin", "qty": 1, "price": 5000},
      {"name": "Ayam Bakar", "qty": 2, "price": 30000},
      {"name": "Nasi Putih", "qty": 2, "price": 5000}
    ],
    "total": 105000,
    "paymentMethod": "transfer",
    "note": "Ayam jangan terlalu matang"
  }'
```

### Example 2: QRIS Payment

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-28",
    "time": "16:00:00",
    "items": [
      {"name": "Gado-Gado", "qty": 1, "price": 18000},
      {"name": "Es Cendol", "qty": 1, "price": 10000}
    ],
    "total": 28000,
    "paymentMethod": "qris"
  }'
```

### Example 3: Bulk Transactions (untuk testing)

```bash
# Transaction 1
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-28","time":"10:00:00","items":[{"name":"Nasi Goreng","qty":1,"price":25000}],"total":25000,"paymentMethod":"cash"}'

# Transaction 2
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-28","time":"11:00:00","items":[{"name":"Sate Ayam","qty":2,"price":30000}],"total":60000,"paymentMethod":"transfer"}'

# Transaction 3
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-28","time":"12:00:00","items":[{"name":"Lumpia","qty":3,"price":10000}],"total":30000,"paymentMethod":"qris"}'

# Check summary
curl "http://localhost:3000/api/transactions/daily/summary?date=2026-02-28"
```

---

## Testing with Postman

### 1. Import Collection

Buat new collection dengan requests:

**POST Create Transaction**
- URL: `{{baseUrl}}/transactions`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: (raw JSON)

**GET Summary**
- URL: `{{baseUrl}}/transactions/daily/summary?date=2026-02-28`
- Method: GET

**GET Weekly Stats**
- URL: `{{baseUrl}}/transactions/stats/weekly`
- Method: GET

### 2. Environment Setup

Set environment variable:
```json
{
  "baseUrl": "http://localhost:3000/api"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "required": ["date", "time", "items", "total", "paymentMethod"]
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create transaction",
  "details": "database error message"
}
```

### 500 Database Error
```json
{
  "error": "Failed to fetch transactions"
}
```

---

## Response Headers (All Requests)

```
Content-Type: application/json
Date: Mon, 28 Feb 2026 14:30:45 GMT
Connection: keep-alive
```

---

## Performance Tips

1. **Get transactions by date** lebih cepat dari get all
   ```bash
   curl "http://localhost:3000/api/transactions?date=2026-02-28"  # ✅ Faster
   curl http://localhost:3000/api/transactions                   # ❌ Slower
   ```

2. **Reuse summary endpoint** untuk dashboard
   ```bash
   # Daripada fetch all transactions, gunakan summary
   curl "http://localhost:3000/api/transactions/daily/summary"  # ✅ Recommended
   ```

3. **Cache statistics** di frontend jika memungkinkan
   - Fetch weekly stats setiap 5 menit
   - Fetch daily summary setiap 1 menit
   - Fetch transactions on-demand

---

## Testing Checklist

- [ ] Create transaction with valid data
- [ ] Create transaction with missing fields (should fail)
- [ ] Get all transactions
- [ ] Get transactions by specific date
- [ ] Get daily summary
- [ ] Get weekly statistics
- [ ] Get monthly statistics
- [ ] Test multiple payment methods (cash, transfer, qris)
- [ ] Test multiple items in single transaction
- [ ] Verify database persists data
- [ ] Test after restarting backend

---

## Common Test Cases

```bash
# Test Case 1: Valid Single Item Transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-28","time":"14:30:45","items":[{"name":"Nasi Goreng","qty":1,"price":25000}],"total":25000,"paymentMethod":"cash"}'

# Expected: success=true, transaction_id returned

# Test Case 2: Missing Payment Method
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-28","time":"14:30:45","items":[{"name":"Nasi Goreng","qty":1,"price":25000}],"total":25000}'

# Expected: error with required fields list

# Test Case 3: Get Today Summary
curl "http://localhost:3000/api/transactions/daily/summary?date=2026-02-28"

# Expected: totalSales > 0, transactionCount > 0, topProduct populated
```

---

**Last Updated:** 2026-02-28
