<template>
  <AppLayout :show-back-button="true">
    <div class="report-page">
      <div class="header">
        <h1>Laporan Harian</h1>
        <p>{{ currentDate }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Penjualan</h3>
          <p class="value">{{ formatCurrency(summary.totalSales) }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Transaksi</h3>
          <p class="value">{{ summary.transactionCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Produk Terlaris</h3>
          <p class="value highlight">{{ summary.topProduct }}</p>
        </div>
      </div>

      <div class="transactions-section">
        <h2>Riwayat Transaksi</h2>
        <div class="date-filter">
             <input type="date" v-model="selectedDate" @change="loadData" />
        </div>
        
        <div v-if="transactions.length === 0" class="empty-tx">
            <p>Tidak ada transaksi pada tanggal ini.</p>
        </div>
        <div class="transactions-list">
            <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
                <div class="tx-info">
                    <span class="tx-id">{{ tx.id }}</span>
                    <span class="tx-time">{{ tx.time }}</span>
                </div>
                <div class="tx-details">
                    <p class="tx-customer">👤 {{ tx.customerName }}</p>
                    <p>{{ tx.items.join(', ') }}</p>
                    <span :class="['status', tx.status]">{{ tx.status }}</span>
                </div>
                <div class="tx-total">
                    {{ formatCurrency(tx.total) }}
                </div>
            </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { reportService } from '@/services/reportService';
import type { Transaction } from '@/services/reportService';
import { useOrderStore } from '@/stores/order';
import { transactionService } from '@/services/transactionService';

const orderStore  = useOrderStore();
const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const isLoading    = ref(false);

const summary = ref({
    totalSales:       0,
    transactionCount: 0,
    topProduct:       '-',
});

const transactions = ref<Transaction[]>([]);

/** Jadikan data orderStore (Pinia) sebagai fallback untuk hari ini */
function buildFallbackFromStore(): { sum: typeof summary.value; txs: Transaction[] } {
    const orders = orderStore.orders;
    const totalSales       = orders.reduce((s, o) => s + o.total, 0);
    const transactionCount = orders.length;

    // Hitung produk terlaris dari store
    const cnt: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => { cnt[i.name] = (cnt[i.name] || 0) + i.qty; }));
    const sorted     = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
    const topProduct = sorted.length > 0 ? sorted[0][0] : '-';

    const txs: Transaction[] = orders.map(o => ({
        id:           o.id,
        time:         o.time,
        customerName: o.customer,
        items:        o.items.map(i => i.name),
        total:        o.total,
        status:       'completed',
    }));

    return { sum: { totalSales, transactionCount, topProduct }, txs };
}

const loadData = async () => {
    isLoading.value = true;
    try {
        // 1. Coba sync offline transactions dulu
        await transactionService.syncOfflineTransactions();

        // 2. Ambil dari backend
        const [sum, txs] = await Promise.all([
            reportService.getDailySummary(selectedDate.value),
            reportService.getTodayTransactions(selectedDate.value),
        ]);

        // 3. Jika hari ini dan backend tidak ada data, pakai orderStore
        const isToday = selectedDate.value === new Date().toISOString().split('T')[0];
        if (sum.transactionCount === 0 && txs.length === 0 && isToday && orderStore.orders.length > 0) {
            const fallback = buildFallbackFromStore();
            summary.value      = fallback.sum;
            transactions.value = fallback.txs;
        } else {
            summary.value      = sum;
            transactions.value = txs;
        }
    } catch (err) {
        console.error('[DailyReport] loadData error:', err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => loadData());

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
</script>

<style scoped>
.report-page {
    padding: 0 var(--spacing-md) var(--spacing-xl);
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    margin-bottom: var(--spacing-lg);
    animation: slideDown 0.6s ease-out;
}

.header h1 {
    font-size: var(--font-size-2xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -1px;
}

.header p {
    color: var(--text-secondary);
    margin: 4px 0 0;
    font-size: var(--font-size-sm);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
    animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.stat-card {
    background: white;
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: rgba(99, 102, 241, 0.3);
}

.stat-card h3 {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-card .value {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
}

.stat-card .value.highlight {
    color: var(--primary-color);
    font-size: var(--font-size-lg);
}

.transactions-section {
    animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.transactions-section h2 {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.date-filter {
    margin-bottom: var(--spacing-md);
}

.date-filter input {
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-family: inherit;
    color: var(--text-primary);
    background: white;
    font-size: var(--font-size-sm);
    transition: all var(--transition-fast);
}

.date-filter input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.transactions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.transaction-item {
    background: white;
    padding: 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all var(--transition-normal);
}

.transaction-item:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: var(--shadow-sm);
    transform: translateX(4px);
}

.tx-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 80px;
}

.tx-id {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
}

.tx-time {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: monospace;
}

.tx-details {
    flex: 1;
    padding: 0 var(--spacing-lg);
}

.tx-details p {
    margin: 0 0 6px;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: 500;
}

.status {
    font-size: 10px;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    text-transform: capitalize;
    font-weight: 700;
    letter-spacing: 0.5px;
    display: inline-block;
}

.status.completed { background-color: #dcfce7; color: #166534; }
.status.cancelled { background-color: #fee2e2; color: #991b1b; }
.status.pending { background-color: #ffedd5; color: #9a3412; }

.tx-customer {
    font-size: 11px;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0 0 4px;
}

.empty-tx {
    text-align: center;
    padding: 24px;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    background: white;
    border-radius: var(--radius-md);
    border: 2px dashed var(--border-color);
    margin-bottom: 12px;
}

.tx-total {
    font-weight: 800;
    color: var(--primary-color);
    font-size: var(--font-size-sm);
    white-space: nowrap;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
