import { Transaction, OrderItem } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// === DEBUG LOGGING ===
console.log('╔════════════════════════════════════════╗');
console.log('║   TRANSACTION SERVICE INITIALIZED      ║');
console.log('╚════════════════════════════════════════╝');
console.log('API_URL:', API_URL);
console.log('BACKEND_URL:', BACKEND_URL);

const STORAGE_KEY = 'pending_transactions';
const HEALTH_CACHE_KEY = 'backend_health_cache';
const HEALTH_CACHE_TTL = 5000; // 5 seconds

// === ENHANCED BACKEND CHECK ===
async function isBackendAvailable(forceCheck = false): Promise<boolean> {
  try {
    // Check cache first (to avoid hammering the health endpoint)
    if (!forceCheck) {
      const cached = localStorage.getItem(HEALTH_CACHE_KEY);
      if (cached) {
        const { available, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < HEALTH_CACHE_TTL) {
          console.log('📦 [isBackendAvailable] Returning cached result:', available);
          return available;
        }
      }
    }

    const healthUrl = `${BACKEND_URL}/health`;
    console.table({
      'Method': 'GET',
      'URL': healthUrl,
      'Timeout': '3000ms'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const startTime = performance.now();
    const response = await fetch(healthUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal
    });
    const endTime = performance.now();

    clearTimeout(timeoutId);

    const isOk = response.ok;
    const roundTripTime = Math.round(endTime - startTime);

    console.log(`✅ [isBackendAvailable] Health Check:
      Status: ${response.status}
      RTT: ${roundTripTime}ms
      OK: ${isOk}`);

    // Cache the result
    localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
      available: isOk,
      timestamp: Date.now()
    }));

    return isOk;
  } catch (error) {
    console.error(`❌ [isBackendAvailable] Failed:
      ${error instanceof Error ? error.name : 'Unknown Error'}
      ${error instanceof Error ? error.message : String(error)}`);

    // Cache negative result
    localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
      available: false,
      timestamp: Date.now()
    }));

    return false;
  }
}

// Get pending transactions from localStorage
function getPendingTransactions(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save pending transactions to localStorage
function savePendingTransactions(transactions: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

// Add pending transaction
function addPendingTransaction(transaction: any): string {
  const transactions = getPendingTransactions();
  const id = `OFFLINE_${Date.now()}`;
  transactions.push({ 
    ...transaction, 
    id,
    savedAt: new Date().toISOString(),
    syncAttempts: 0 
  });
  savePendingTransactions(transactions);
  console.log(`📦 Saved to offline queue: ${id}`);
  return id;
}

// Sync pending transactions to backend
async function syncPendingTransactions(): Promise<{ synced: number; failed: number }> {
  const pending = getPendingTransactions();
  
  if (pending.length === 0) {
    console.log('✅ No pending transactions to sync');
    return { synced: 0, failed: 0 };
  }

  console.log(`🔄 Attempting to sync ${pending.length} pending transactions...`);

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const tx = pending[i];
    
    try {
      // Remove offline ID and sync attempts before sending
      const { id, savedAt, syncAttempts, ...txData } = tx;
      
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Synced: ${id} → ${result.id || result.transactionId}`);
        synced++;
        // Remove from pending
        pending.splice(i, 1);
        i--;
      } else {
        failed++;
        tx.syncAttempts = (tx.syncAttempts || 0) + 1;
      }
    } catch (error) {
      failed++;
      tx.syncAttempts = (tx.syncAttempts || 0) + 1;
      console.warn(`⚠️ Sync failed for ${tx.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  savePendingTransactions(pending);
  console.log(`📊 Sync result: ${synced} synced, ${failed} failed`);

  return { synced, failed };
}

export const transactionService = {
  // Check backend status
  async checkBackendStatus(): Promise<{ available: boolean; message: string }> {
    const available = await isBackendAvailable();
    return {
      available,
      message: available ? 'Backend ready' : 'Backend tidak tersedia'
    };
  },

  // Sync any pending offline transactions
  async syncOfflineTransactions(): Promise<{ synced: number; failed: number }> {
    console.log('\n🔄 [syncOfflineTransactions] Starting sync...');
    const result = await syncPendingTransactions();
    return result;
  },

  // Get pending transactions from offline queue
  getPendingTransactions(): any[] {
    return getPendingTransactions();
  },

  // Simpan transaksi baru ke database
  async createTransaction(
    items: OrderItem[],
    total: number,
    paymentMethod: 'cash' | 'transfer' | 'qris',
    note?: string,
    customerName?: string
  ): Promise<{ success: boolean; transactionId?: string; message: string; isOffline?: boolean; errorCategory?: string }> {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const transaction = {
      date,
      time,
      items,
      total,
      paymentMethod,
      status: 'completed',
      note: note || undefined,
      customerName: customerName || 'Unknown'
    };

    console.log('═══════════════════════════════════════');
    console.log('📝 [createTransaction] STEP 1: PREPARING');
    console.log('═══════════════════════════════════════');
    console.table({
      'Customer': customerName,
      'Items': items.length,
      'Total': total,
      'Date': date,
      'Time': time
    });

    // === STRATEGY: TRY BACKEND FIRST, FALLBACK ONLY IF NETWORK ERROR ===
    console.log('\n🔵 [createTransaction] STEP 2: ATTEMPTING BACKEND');
    console.log('───────────────────────────────────────');
    console.log(`📤 POST to: ${API_URL}/transactions`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`\n✅ [createTransaction] RESPONSE RECEIVED`);
      console.log('───────────────────────────────────────');
      console.table({
        'Status': response.status,
        'StatusText': response.statusText,
        'Headers-ContentType': response.headers.get('content-type')
      });

      // ✅ SUCCESS CASES (2xx)
      if (response.ok) {
        const data = await response.json();
        const transactionId = data.id || data.transactionId || `TRX${Date.now()}`;

        console.log(`\n🎉 [createTransaction] SUCCESS!`);
        console.log('═══════════════════════════════════════');
        console.log(`Transaction ID: ${transactionId}`);
        console.log('═══════════════════════════════════════');

        return {
          success: true,
          transactionId,
          message: '✅ Pesanan berhasil disimpan ke server!',
          isOffline: false
        };
      }

      // ❌ CLIENT ERRORS (4xx) - Validation/Authorization errors
      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || `Client error: ${response.status}`;

        console.error(`\n❌ [createTransaction] VALIDATION ERROR`);
        console.error('═══════════════════════════════════════');
        console.error(`Status: ${response.status}`);
        console.error(`Message: ${errorMsg}`);
        console.error('═══════════════════════════════════════');

        return {
          success: false,
          message: `❌ Validasi gagal: ${errorMsg}`,
          isOffline: false
        };
      }

      // ❌ SERVER ERRORS (5xx) - Server is having issues
      if (response.status >= 500) {
        console.error(`\n❌ [createTransaction] SERVER ERROR`);
        console.error('═══════════════════════════════════════');
        console.error(`Server error ${response.status} - Falling back to offline mode`);

        // Fallback ke offline jika server error
        const id = addPendingTransaction(transaction);
        return {
          success: true,
          transactionId: id,
          message: '⚠️ Server sedang bermasalah. Pesanan disimpan lokal dan akan dikirim saat server aktif.',
          isOffline: true
        };
      }

    } catch (error) {
      // === NETWORK ERROR - Jenis error apa? ===
      const isNetworkError = error instanceof TypeError && (
        error.message.includes('fetch') ||
        error.message.includes('CORS') ||
        error.message.includes('Failed')
      );

      const isTimeoutError = error instanceof DOMException && error.name === 'AbortError';
      
      // Determine error category for better diagnostics
      let errorCategory = 'Unknown';
      let errorDetails = '';
      
      if (isNetworkError) {
        if (error.message.includes('CORS')) {
          errorCategory = 'CORS_ERROR';
          errorDetails = 'Frontend URL tidak di-whitelist di CORS config backend';
        } else if (error.message.includes('Failed')) {
          errorCategory = 'CONNECTION_REFUSED';
          errorDetails = 'Backend tidak berjalan atau port salah';
        } else {
          errorCategory = 'NETWORK_ERROR';
          errorDetails = 'Masalah koneksi network (firewall/proxy?)';
        }
      } else if (isTimeoutError) {
        errorCategory = 'TIMEOUT';
        errorDetails = 'Backend tidak merespons dalam 10 detik';
      }

      console.error(`\n⚠️ [createTransaction] REQUEST FAILED`);
      console.error('═══════════════════════════════════════');
      console.error(`Error Type: ${error instanceof Error ? error.name : 'Unknown'}`);
      console.error(`Error Msg: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Category: ${errorCategory}`);
      console.error(`Details: ${errorDetails}`);
      console.error(`Network Error: ${isNetworkError}`);
      console.error(`Timeout: ${isTimeoutError}`);
      console.error('═══════════════════════════════════════');

      // FALLBACK: Simpan ke offline jika network error atau timeout
      if (isNetworkError || isTimeoutError) {
        console.log(`\n📦 [createTransaction] STEP 3: FALLBACK TO OFFLINE`);
        console.log('═══════════════════════════════════════');

        const id = addPendingTransaction(transaction);

        console.log(`✅ Saved to localStorage with ID: ${id}`);
        console.log(`📌 Error Category: ${errorCategory}`);
        console.log(`📌 Diagnostics: ${errorDetails}`);
        console.log('═══════════════════════════════════════');

        return {
          success: true,
          transactionId: id,
          message: `⚠️ Backend tidak terhubung (${errorCategory}). Pesanan disimpan lokal dan akan dikirim otomatis saat backend aktif.`,
          isOffline: true,
          errorCategory
        };
      }

      // Jika error yang tidak terduga
      return {
        success: false,
        message: `❌ Error tidak terduga: ${error instanceof Error ? error.message : String(error)}`,
        isOffline: false,
        errorCategory: 'UNEXPECTED_ERROR'
      };
    }

    // Fallback return (should never reach here)
    return {
      success: false,
      message: 'Unknown error occurred',
      isOffline: false
    };
  },

  // Ambil semua transaksi

  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${API_URL}/transactions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map snake_case from API to camelCase for frontend
      const mappedData = data.map((tx: any) => ({
        id: tx.id,
        date: tx.date,
        time: tx.time,
        items: typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items,
        total: tx.total,
        paymentMethod: tx.payment_method || tx.paymentMethod,
        status: tx.status,
        note: tx.note,
        customerName: tx.customer_name || tx.customerName
      }));
      
      return mappedData || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  // Ambil transaksi hari ini
  async getTodayTransactions(): Promise<Transaction[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('🔵 getTodayTransactions called for date:', today);
      console.log('API_URL:', API_URL);
      
      const url = `${API_URL}/transactions?date=${today}`;
      console.log('📡 Fetching from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🟢 API response data:', data);
      
      // Map snake_case from API to camelCase for frontend
      const mappedData = data.map((tx: any) => ({
        id: tx.id,
        date: tx.date,
        time: tx.time,
        items: typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items,
        total: tx.total,
        paymentMethod: tx.payment_method || tx.paymentMethod,
        status: tx.status,
        note: tx.note,
        customerName: tx.customer_name || tx.customerName
      }));
      
      console.log('🔄 Mapped data:', mappedData);
      
      return mappedData || [];
    } catch (error) {
      console.error('❌ Error fetching today transactions:', error);
      return [];
    }
  },

  // Hitung ringkasan harian
  async getDailySummary(): Promise<{
    totalSales: number;
    transactionCount: number;
    topProduct: string;
  }> {
    try {
      // Use getTodayTransactions to get properly mapped data
      const transactions = await this.getTodayTransactions();

      // Hitung total penjualan
      const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0);
      const transactionCount = transactions.length;

      // Hitung produk terlaris
      const productCount: Record<string, number> = {};
      transactions.forEach(tx => {
        tx.items.forEach(item => {
          productCount[item.name] = (productCount[item.name] || 0) + item.qty;
        });
      });

      const topProduct = Object.entries(productCount).length > 0
        ? Object.entries(productCount).sort((a, b) => b[1] - a[1])[0][0]
        : '-';

      return {
        totalSales,
        transactionCount,
        topProduct
      };
    } catch (error) {
      console.error('Error calculating daily summary:', error);
      return {
        totalSales: 0,
        transactionCount: 0,
        topProduct: '-'
      };
    }
  },

  // Ambil statistik mingguan
  async getWeeklyStats(): Promise<{ labels: string[]; data: number[] }> {
    try {
      const response = await fetch(`${API_URL}/transactions/stats/weekly`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [0, 0, 0, 0, 0, 0, 0] };
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0, 0, 0, 0, 0, 0, 0]
      };
    }
  },

  // Ambil statistik bulanan
  async getMonthlyStats(): Promise<{ labels: string[]; data: number[] }> {
    try {
      const response = await fetch(`${API_URL}/transactions/stats/monthly`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [0, 0, 0, 0] };
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [0, 0, 0, 0]
      };
    }
  }
};
