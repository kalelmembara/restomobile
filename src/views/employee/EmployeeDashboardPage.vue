<template>
  <AppLayout :show-back-button="true" back-button-text="Keluar" @back="logout">
    <div class="dashboard-page">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="greeting">Halo, Pegawai! 👨‍💼</h1>
          <p class="subtitle">Kelola pesanan dan pantau penjualan hari ini</p>
        </div>
      </div>

      <!-- Today's Stats -->
      <div class="stats-grid">
        <div class="stat-large">
          <div class="stat-header">
            <span class="stat-icon">📦</span>
            <span class="stat-label">Pesanan Hari Ini</span>
          </div>
          <h2 class="stat-number">{{ stats.todayOrders }}</h2>
          <p class="stat-compare">+3 dari kemarin</p>
        </div>

        <div class="stat-large">
          <div class="stat-header">
            <span class="stat-icon">💰</span>
            <span class="stat-label">Penjualan</span>
          </div>
          <h2 class="stat-number">{{ formatPrice(stats.totalSales) }}</h2>
          <p class="stat-compare">+10% dari kemarin</p>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="filter-section">
        <h3 class="section-title">Status Pesanan</h3>
        <div class="status-tabs">
          <button 
            v-for="status in statuses" 
            :key="status"
            class="status-tab"
            :class="{ active: selectedStatus === status }"
            @click="selectedStatus = status"
          >
            {{ statusLabels[status] }}
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-section">
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>Tidak ada pesanan {{ statusLabels[selectedStatus]?.toLowerCase() }}</p>
        </div>

        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">{{ order.id }}</span>
              <span class="order-time">{{ order.time }}</span>
            </div>
            <span class="status-badge" :class="order.status.toLowerCase()">
              {{ statusLabels[order.status] }}
            </span>
          </div>

          <div class="order-customer">
            <span class="label">👤</span>
            <span class="name">{{ order.customer }}</span>
          </div>

          <div class="order-items">
            <div v-for="(item, index) in order.items" :key="index" class="item">
              <span>{{ item.name }}</span>
              <span class="qty">× {{ item.qty }}</span>
            </div>
          </div>

          <div v-if="order.note" class="order-note">
            <span class="note-icon">📝</span>
            <span class="note-text">{{ order.note }}</span>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="label">Total:</span>
              <span class="amount">{{ formatPrice(order.total) }}</span>
            </div>
            <button class="action-btn" @click="handleStatusUpdate(order)">
              <span v-if="order.status === 'pending'">Mulai Proses</span>
              <span v-else-if="order.status === 'processing'">Siapkan</span>
              <span v-else-if="order.status === 'ready'">Selesaikan</span>
              <span v-else>Lihat Detail</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3 class="section-title">Tindakan Cepat</h3>
        <button class="action-card" @click="router.push('/manajemen-menu')">
          <span class="icon">🍽️</span>
          <span class="label">Manajemen Menu</span>
        </button>
        <button class="action-card" @click="router.push('/employee-reports')">
          <span class="icon">📊</span>
          <span class="label">Laporan Harian</span>
        </button>
        <button class="action-card" @click="router.push('/employee-stats')">
          <span class="icon">📈</span>
          <span class="label">Statistik Penjualan</span>
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { toastController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';

const router = useRouter();
const selectedStatus = ref<string>('all');
const orders = ref<Order[]>([]);
const stats = ref({ todayOrders: 0, totalSales: 0 });

const statusLabels: Record<string, string> = {
  all: 'Semua',
  pending: 'Tertunda',
  processing: 'Diproses',
  ready: 'Siap',
  completed: 'Selesai'
};

const statuses = ['all', 'pending', 'processing', 'ready', 'completed'];

// ✅ Define confirmed/paid statuses for filtering
const CONFIRMED_STATUSES = ['completed', 'confirmed', 'paid'];

// ✅ Check if an order meets confirmation criteria
const isOrderConfirmed = (order: Order): boolean => {
  // Status check: must be in confirmed statuses
  const statusMatch = CONFIRMED_STATUSES.includes(order.status?.toLowerCase() || '');
  
  // Extended check for future fields (is_confirmed, payment_status)
  const hasConfirmedFlag = (order as any).is_confirmed === true;
  const isPaidStatus = (order as any).payment_status === 'paid';
  
  return statusMatch || hasConfirmedFlag || isPaidStatus;
};

onMounted(async () => {
  console.log('🔵 EmployeeDashboard mounted');
  await loadData();
  
  // Auto-refresh setiap 2 detik
  const refreshInterval = setInterval(async () => {
    console.log('🔄 Auto-refresh triggered');
    try {
      await loadData();
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }, 2000);
  
  // Cleanup interval saat component unmount
  return () => clearInterval(refreshInterval);
});

const loadData = async () => {
  try {
    console.log('📊 loadData started');
    console.log('orderService:', orderService);
    
    const fetchedOrders = await orderService.getOrders() as Order[];
    console.log('📦 Fetched orders (raw):', fetchedOrders);
    
    // ✅ Filter to show only confirmed/paid orders
    const confirmedOrders = fetchedOrders.filter(order => isOrderConfirmed(order));
    console.log('📦 Filtered confirmed orders:', confirmedOrders);
    orders.value = confirmedOrders;
    
    // ✅ Recalculate stats based on filtered orders
    const todayOrders = confirmedOrders.length;
    const totalSales = confirmedOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
    stats.value = { todayOrders, totalSales };
    
    console.log('📈 Calculated stats:', stats.value);
    console.log('✅ loadData completed. Confirmed orders count:', orders.value.length);
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
};

// ✅ Filter orders by confirmation status FIRST, then by selected status tab
const confirmedOrders = computed(() => {
  return orders.value.filter(order => isOrderConfirmed(order));
});

// ✅ Apply tab filter on top of confirmed orders
const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') {
    return confirmedOrders.value;
  }
  return confirmedOrders.value.filter(order => order.status === selectedStatus.value);
});

const formatPrice = (price: number) => {
  return price.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

const handleStatusUpdate = async (order: Order) => {
  const statusFlow: OrderStatus[] = ['pending', 'processing', 'ready', 'completed'];
  const currentIndex = statusFlow.indexOf(order.status);
  
  if (currentIndex < statusFlow.length - 1) {
    const nextStatus = statusFlow[currentIndex + 1];
    const success = await orderService.updateOrderStatus(order.id, nextStatus);
    
    if (success) {
      order.status = nextStatus; // Optimistic update or reload data
      // ✅ Recalculate stats based on filtered orders after status update
      const todayOrders = confirmedOrders.value.length;
      const totalSales = confirmedOrders.value.reduce((sum: number, o: Order) => sum + o.total, 0);
      stats.value = { todayOrders, totalSales };

      const toast = await toastController.create({
        message: `Pesanan ${order.id} diperbarui ke ${statusLabels[nextStatus]}`,
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    }
  }
};

const logout = async () => {
  // Logic to clear session if any
  router.push('/');
};
</script>

<style scoped>
/* ========== MODERN EMPLOYEE DASHBOARD ========== */
.dashboard-page {
  padding-bottom: var(--spacing-xl);
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 var(--spacing-md) var(--spacing-lg);
  animation: slideDown 0.6s ease-out;
}

.header-content {
  flex: 1;
}

.greeting {
  font-size: var(--font-size-2xl);
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* Refresh Button */
.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: white;
  font-size: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  flex-shrink: 0;
  margin-top: 4px;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  transform: rotate(180deg);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Grid */
.stats-grid {
  padding: 0 var(--spacing-md) var(--spacing-lg);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.stat-large {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal);
}

.stat-large:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(99, 102, 241, 0.3);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-icon {
  font-size: 20px;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.stat-compare {
  font-size: 11px;
  color: var(--success-color);
  margin: 0;
  font-weight: 600;
}

/* Filter Section */
.filter-section {
  padding: 0 var(--spacing-md) var(--spacing-md);
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.status-tabs::-webkit-scrollbar {
  display: none;
}

.status-tab {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
}

.status-tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.status-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Orders Section */
.orders-section {
  padding: 0 var(--spacing-md) var(--spacing-lg);
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  background: white;
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-color);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Order Card */
.order-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.order-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.order-id {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.order-time {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: monospace;
  background: var(--bg-color);
  padding: 2px 6px;
  border-radius: 4px;
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending { background: #fee2e2; color: #b91c1c; }
.status-badge.processing { background: #e0e7ff; color: #4338ca; }
.status-badge.ready { background: #fef3c7; color: #b45309; }
.status-badge.completed { background: #dcfce7; color: #15803d; }

.order-customer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
}

/* Order Items */
.order-items {
  margin-bottom: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.item:last-child {
  margin-bottom: 0;
}

.qty {
  font-weight: 600;
  color: var(--text-primary);
}

/* Order Note */
.order-note {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  padding: 10px;
  background-color: rgba(249, 240, 216, 0.5);
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.note-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.note-text {
  word-break: break-word;
  line-height: 1.4;
}

/* Order Footer */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-total .label {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
}

.amount {
  font-size: var(--font-size-sm);
  font-weight: 800;
  color: var(--primary-color);
}

.action-btn {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
  font-family: inherit;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgba(99, 102, 241, 0.5);
  background: var(--primary-hover);
}

/* Quick Actions */
.quick-actions {
  padding: 0 var(--spacing-md) 40px;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-family: inherit;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.action-card:hover {
  border-color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.action-card .icon {
  font-size: 24px;
  flex-shrink: 0;
  background: #f0fdf4; /* Light green bg for icon, creating separation */
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.action-card .label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-primary);
}

/* Animations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (min-width: 768px) {
  .dashboard-header,
  .stats-grid,
  .filter-section,
  .orders-section,
  .quick-actions {
    padding-left: 40px;
    padding-right: 40px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
