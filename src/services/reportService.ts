/**
 * reportService.ts
 * Mengambil data laporan dan statistik dari backend API.
 *
 * Kolom MySQL (tabel transaksi):
 *   id (auto-increment) | transaction_id | tanggal | waktu | items |
 *   total | payment_method | status | catatan | nama_pelanggan | created_at
 */

export interface DailyStat {
  date: string;
  totalSales: number;
  transactions: number;
}

export interface Transaction {
  id:           string;
  time:         string;
  customerName: string;
  items:        string[];   // nama item saja, untuk display
  total:        number;
  status:       'completed' | 'cancelled' | 'pending';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/** Peta baris MySQL (snake_case) → Transaction frontend */
function mapRow(tx: any): Transaction {
  let rawItems: any[] = [];
  try {
    rawItems = typeof tx.items === 'string'
      ? JSON.parse(tx.items)
      : (Array.isArray(tx.items) ? tx.items : []);
  } catch { rawItems = []; }

  return {
    // MySQL: transaction_id = "TRX...", id = auto-increment angka
    id:           tx.transaction_id || String(tx.id || ''),
    time:         tx.waktu          || tx.time      || '-',
    customerName: tx.nama_pelanggan || tx.customerName || '-',
    items:        rawItems.map((i: any) => (typeof i === 'string' ? i : (i?.name || '-'))),
    total:        Number(tx.total)  || 0,
    status:       (tx.status as any) || 'completed',
  };
}

export const reportService = {

  /**
   * Ringkasan harian dari endpoint khusus /daily/summary.
   * @param date Format YYYY-MM-DD, default hari ini
   */
  async getDailySummary(date?: string): Promise<{ totalSales: number; transactionCount: number; topProduct: string }> {
    const d = date || new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(`${API_URL}/transactions/daily/summary?date=${d}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        totalSales:       Number(data.totalSales)       || 0,
        transactionCount: Number(data.transactionCount) || 0,
        topProduct:       data.topProduct               || '-',
      };
    } catch (err) {
      console.error('[reportService] getDailySummary error:', err);
      return { totalSales: 0, transactionCount: 0, topProduct: '-' };
    }
  },

  /**
   * Daftar transaksi untuk tanggal tertentu.
   * @param date Format YYYY-MM-DD, default hari ini
   */
  async getTodayTransactions(date?: string): Promise<Transaction[]> {
    const d = date || new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(`${API_URL}/transactions?date=${d}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any[] = await res.json();
      return data.map(mapRow);
    } catch (err) {
      console.error('[reportService] getTodayTransactions error:', err);
      return [];
    }
  },

  /** Statistik penjualan 7 hari terakhir */
  async getWeeklyStats(): Promise<{ labels: string[]; data: number[] }> {
    const fallback = {
      labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
      data:   [0, 0, 0, 0, 0, 0, 0],
    };
    try {
      const res = await fetch(`${API_URL}/transactions/stats/weekly`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data || fallback;
    } catch (err) {
      console.error('[reportService] getWeeklyStats error:', err);
      return fallback;
    }
  },

  /** Statistik penjualan 4 minggu terakhir */
  async getMonthlyStats(): Promise<{ labels: string[]; data: number[] }> {
    const fallback = {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      data:   [0, 0, 0, 0],
    };
    try {
      const res = await fetch(`${API_URL}/transactions/stats/monthly`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data || fallback;
    } catch (err) {
      console.error('[reportService] getMonthlyStats error:', err);
      return fallback;
    }
  },
};
