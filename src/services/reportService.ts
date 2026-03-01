export interface DailyStat {
    date: string;
    totalSales: number;
    transactions: number;
}

export interface Transaction {
    id: string;
    time: string;
    items: string[]; // Simplification for display
    total: number;
    status: 'completed' | 'cancelled';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const reportService = {
    async getDailySummary(): Promise<{ totalSales: number; transactionCount: number; topProduct: string }> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`${API_URL}/transactions?date=${today}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const transactions: any[] = await response.json();

            // Hitung total penjualan
            const totalSales = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
            const transactionCount = transactions.length;

            // Hitung produk terlaris
            const productCount: Record<string, number> = {};
            transactions.forEach(tx => {
                if (tx.items && Array.isArray(tx.items)) {
                    tx.items.forEach((item: any) => {
                        const itemName = typeof item === 'string' ? item : item.name;
                        const qty = typeof item === 'string' ? 1 : (item.qty || 1);
                        productCount[itemName] = (productCount[itemName] || 0) + qty;
                    });
                }
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
            console.error('Error fetching daily summary:', error);
            return {
                totalSales: 0,
                transactionCount: 0,
                topProduct: '-'
            };
        }
    },

    async getTodayTransactions(): Promise<Transaction[]> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`${API_URL}/transactions?date=${today}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const transactions: any[] = await response.json();

            return transactions.map(tx => ({
                id: tx.id || `TX${Date.now()}`,
                time: tx.time || '00:00',
                items: Array.isArray(tx.items) 
                    ? tx.items.map((item: any) => typeof item === 'string' ? item : item.name)
                    : [],
                total: tx.total || 0,
                status: tx.status || 'completed'
            }));
        } catch (error) {
            console.error('Error fetching today transactions:', error);
            return [];
        }
    },

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
