<template>
  <AppLayout :show-back-button="true">
    <div class="stats-page">
      <div class="header">
        <h1>Statistik Penjualan</h1>
        <div class="period-filter">
          <button 
            :class="{ active: period === 'weekly' }"
            @click="setPeriod('weekly')"
          >
            Mingguan
          </button>
          <button 
            :class="{ active: period === 'monthly' }"
            @click="setPeriod('monthly')"
          >
            Bulanan
          </button>
        </div>
      </div>

      <div class="chart-container">
        <Bar
          v-if="chartData.labels.length > 0"
          :data="chartData"
          :options="chartOptions"
        />
        <div v-else class="loading">Memuat data...</div>
      </div>

      <div class="summary-cards">
        <div class="card">
            <h3>Rata-rata Penjualan</h3>
            <p>{{ formatCurrency(averageSales) }}</p>
        </div>
        <div class="card">
            <h3>Total Periode Ini</h3>
            <p>{{ formatCurrency(totalPeriodSales) }}</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { reportService } from '@/services/reportService';
import { useOrderStore } from '@/stores/order';
import { transactionService } from '@/services/transactionService';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const orderStore = useOrderStore();
const period     = ref<'weekly' | 'monthly'>('weekly');
const chartData  = ref({
    labels:   [] as string[],
    datasets: [] as any[]
});

const chartOptions = {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (v: any) =>
                    new Intl.NumberFormat('id-ID', {
                        notation: 'compact', compactDisplay: 'short'
                    }).format(v)
            }
        }
    }
};

/**
 * Inject today's sales dari orderStore ke data index yang sesuai.
 * Dipakai ketika backend mengembalikan 0 untuk hari ini tapi store punya data.
 */
function injectTodayFromStore(labels: string[], data: number[]): number[] {
    if (orderStore.todayTotalSales === 0) return data;

    const result = [...data];
    const now    = new Date();

    if (period.value === 'weekly') {
        // labels: ['Sen','Sel','Rab','Kam','Jum','Sab','Min']
        // dayOfWeek: 0=Sun,1=Mon,...,6=Sat → mapped: Sun=6, Mon=0, ...
        const dayIdx = now.getDay(); // 0=Sun
        const mapped = dayIdx === 0 ? 6 : dayIdx - 1;
        if (result[mapped] === 0) result[mapped] = orderStore.todayTotalSales;
    } else {
        // labels: ['Minggu 1',...,'Minggu 4']
        const weekIdx = Math.min(Math.floor((now.getDate() - 1) / 7), 3);
        if (result[weekIdx] === 0) result[weekIdx] = orderStore.todayTotalSales;
    }
    return result;
}

const loadData = async () => {
    chartData.value = { labels: [], datasets: [] }; // reset → tampilkan loading

    // Auto-sync offline transactions ke backend
    await transactionService.syncOfflineTransactions().catch(() => {});

    const raw = period.value === 'weekly'
        ? await reportService.getWeeklyStats()
        : await reportService.getMonthlyStats();

    // Inject data hari ini dari store jika backend belum punya
    const injectedData = injectTodayFromStore(raw.labels, raw.data);

    chartData.value = {
        labels:   raw.labels,
        datasets: [{
            label:           'Penjualan (IDR)',
            backgroundColor: '#6366f1',
            borderRadius:    8,
            data:            injectedData,
        }]
    };
};

const setPeriod = (p: 'weekly' | 'monthly') => {
    period.value = p;
    loadData();
};

const totalPeriodSales = computed(() => {
    if (!chartData.value.datasets[0]) return 0;
    return (chartData.value.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
});

const averageSales = computed(() => {
    const d = chartData.value.datasets[0]?.data as number[] | undefined;
    if (!d || d.length === 0) return 0;
    return totalPeriodSales.value / d.length;
});

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

onMounted(() => loadData());
</script>

<style scoped>
.stats-page {
    padding: 0 var(--spacing-md) var(--spacing-xl);
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    animation: slideDown 0.6s ease-out;
    flex-wrap: wrap;
    gap: var(--spacing-md);
}

.header h1 {
    font-size: var(--font-size-xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.5px;
}

.period-filter {
    display: flex;
    background: white;
    padding: 4px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-color);
}

.period-filter button {
    border: none;
    background: transparent;
    padding: 8px 16px;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.period-filter button:hover {
    color: var(--primary-color);
}

.period-filter button.active {
    background: var(--primary-color);
    color: white;
    box-shadow: var(--shadow-sm);
}

.chart-container {
    height: 360px;
    background: white;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    margin-bottom: 24px;
    position: relative;
    box-shadow: var(--shadow-sm);
    animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-md);
    animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.card {
    background: white;
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: rgba(99, 102, 241, 0.3);
}

.card h3 {
    margin: 0 0 8px;
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.card p {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
}

/* Specific styling for the summary cards if we want to add color accents */
.card:nth-child(1) .card p { color: var(--primary-color); }
.card:nth-child(2) .card p { color: var(--secondary-color); }

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
