import { Order, OrderStatus, Transaction } from '../types';
import { transactionService } from './transactionService';

export const orderService = {
    getOrders: async (): Promise<Order[]> => {
        try {
            console.log('🔵 orderService.getOrders called');
            
            // Try to fetch from API first
            const transactions = await transactionService.getTodayTransactions();
            console.log('🟢 getTodayTransactions result:', transactions);
            
            // Convert transactions to orders
            const orders: Order[] = transactions.map((tx: Transaction, index: number) => {
                console.log(`Converting transaction ${index}:`, tx);
                return {
                    id: tx.id || `ORD-${index + 1}`,
                    customer: tx.customerName || 'Unknown',
                    time: tx.time,
                    status: 'completed' as OrderStatus,
                    items: tx.items,
                    total: tx.total,
                    note: tx.note
                };
            });
            
            console.log('✅ Orders converted:', orders);
            return orders;
        } catch (error) {
            console.error('❌ Error in getOrders:', error);
            return [];
        }
    },

    updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
        return true;
    },

    getStats: async () => {
        try {
            console.log('🔵 orderService.getStats called');
            
            // Fetch today's transactions
            const transactions = await transactionService.getTodayTransactions();
            console.log('🟢 Transactions for stats:', transactions);
            
            const todayOrders = transactions.length;
            const totalSales = transactions.reduce((sum: number, tx: Transaction) => sum + tx.total, 0);
            
            console.log('✅ Stats:', { todayOrders, totalSales });
            return { todayOrders, totalSales };
        } catch (error) {
            console.error('❌ Error in getStats:', error);
            return { todayOrders: 0, totalSales: 0 };
        }
    }
};
