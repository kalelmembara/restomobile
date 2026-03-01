<!-- COMPLETE FIXED SCRIPT SECTION FOR EmployeeDashboardPage.vue -->
<!-- This is the <script setup> section with all the filtering logic implemented -->

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

/**
 * ✅ Check if an order meets confirmation criteria
 * 
 * Returns true if ANY of these conditions are met:
 * 1. Status is in CONFIRMED_STATUSES (completed, confirmed, paid)
 * 2. Order has is_confirmed flag set to true
 * 3. Order has payment_status = 'paid'
 */
const isOrderConfirmed = (order: Order): boolean => {
  // Status check: must be in confirmed statuses (case-insensitive)
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

/**
 * ✅ Load data and filter to show only confirmed/paid orders
 * Also recalculates stats based on filtered orders
 */
const loadData = async () => {
  try {
    console.log('📊 loadData started');
    console.log('orderService:', orderService);
    
    const fetchedOrders = await orderService.getOrders() as Order[];
    console.log('📦 Fetched orders (raw):', fetchedOrders);
    
    // ✅ FILTER: Show only confirmed/paid orders
    const confirmedOrders = fetchedOrders.filter(order => isOrderConfirmed(order));
    console.log('📦 Filtered confirmed orders:', confirmedOrders);
    orders.value = confirmedOrders;
    
    // ✅ STATS: Recalculate based on filtered orders
    const todayOrders = confirmedOrders.length;
    const totalSales = confirmedOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
    stats.value = { todayOrders, totalSales };
    
    console.log('📈 Calculated stats:', stats.value);
    console.log('✅ loadData completed. Confirmed orders count:', orders.value.length);
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
};

/**
 * ✅ Reactive computed: Filter orders by confirmation status
 * Used as base for further filtering and stats calculation
 */
const confirmedOrders = computed(() => {
  return orders.value.filter(order => isOrderConfirmed(order));
});

/**
 * ✅ Reactive computed: Apply tab filter on top of confirmed orders
 * 
 * Two-layer filtering:
 * 1. First layer: Only confirmed/paid orders (done by loadData)
 * 2. Second layer: Filter by selected status tab (pending, processing, ready, completed)
 */
const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') {
    return confirmedOrders.value;
  }
  return confirmedOrders.value.filter(order => order.status === selectedStatus.value);
});

const formatPrice = (price: number) => {
  return price.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

/**
 * ✅ Handle status update and recalculate stats
 * Stats are recalculated based on filtered confirmed orders
 */
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
