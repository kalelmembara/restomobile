# RestaurantApp Backend API

Backend API untuk aplikasi manajemen restoran berbasis Ionic Vue.

## Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Konfigurasi Environment

Edit file `.env`:
```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Jalankan Server

**Development Mode (dengan auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health`
- Response: `{ status: "OK", message: "Backend is running" }`

### Transactions

#### 1. Create Transaction
- **Method**: `POST`
- **URL**: `/api/transactions`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
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
- **Response**:
```json
{
  "success": true,
  "id": "TRX20260228143045",
  "transactionId": "TRX20260228143045",
  "message": "Transaction created successfully"
}
```

#### 2. Get All Transactions
- **Method**: `GET`
- **URL**: `/api/transactions`
- **Response**: Array of transactions

#### 3. Get Transactions by Date
- **Method**: `GET`
- **URL**: `/api/transactions?date=2026-02-28`
- **Response**: Array of transactions for specific date

#### 4. Get Daily Summary
- **Method**: `GET`
- **URL**: `/api/transactions/daily/summary?date=2026-02-28`
- **Response**:
```json
{
  "totalSales": 250000,
  "transactionCount": 5,
  "topProduct": "Nasi Goreng Spesial"
}
```

#### 5. Get Weekly Statistics
- **Method**: `GET`
- **URL**: `/api/transactions/stats/weekly`
- **Response**:
```json
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "data": [150000, 200000, 180000, 220000, 250000, 300000, 280000]
}
```

#### 6. Get Monthly Statistics
- **Method**: `GET`
- **URL**: `/api/transactions/stats/monthly`
- **Response**:
```json
{
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "data": [500000, 650000, 600000, 700000]
}
```

## Database Schema

### transactions table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  items TEXT NOT NULL,  -- JSON string
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,  -- cash/transfer/qris
  status TEXT DEFAULT 'completed',  -- completed/cancelled
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Integration

### 1. Environment Configuration
Edit `.env.local` di frontend:
```
VITE_API_URL=http://localhost:3000/api
```

### 2. Using Transaction Service
```typescript
import { transactionService } from '@/services/transactionService';

// Create transaction
const result = await transactionService.createTransaction(
  items,
  total,
  paymentMethod,
  note
);

// Get daily summary
const summary = await transactionService.getDailySummary();

// Get weekly stats
const weeklyStats = await transactionService.getWeeklyStats();
```

### 3. Using Report Service
```typescript
import { reportService } from '@/services/reportService';

// Get daily summary
const summary = await reportService.getDailySummary();

// Get transactions
const transactions = await reportService.getTodayTransactions();

// Get stats
const weeklyStats = await reportService.getWeeklyStats();
```

## Testing dengan cURL

### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-28",
    "time": "14:30:45",
    "items": [{"name": "Nasi Goreng", "qty": 1, "price": 25000}],
    "total": 25000,
    "paymentMethod": "cash",
    "status": "completed"
  }'
```

### Get Daily Summary
```bash
curl http://localhost:3000/api/transactions/daily/summary?date=2026-02-28
```

### Get Weekly Stats
```bash
curl http://localhost:3000/api/transactions/stats/weekly
```

## Troubleshooting

### CORS Error
Pastikan `FRONTEND_URL` di `.env` sesuai dengan URL frontend:
```
FRONTEND_URL=http://localhost:5173
```

### Database Error
Pastikan folder `backend` memiliki write permission untuk membuat file `resto.db`

### Port Already in Use
Ganti PORT di `.env`:
```
PORT=3001
```

## Production Deployment

1. Set `NODE_ENV=production` di `.env`
2. Update `FRONTEND_URL` ke domain frontend
3. Gunakan database production (MySQL/PostgreSQL)
4. Setup reverse proxy (Nginx/Apache)
5. Use SSL/TLS certificates

## License

MIT
