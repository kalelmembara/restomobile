<template>
  <AppLayout :show-back-button="true">
    <div class="menu-page-content">
      <!-- Header -->
      <div class="menu-header">
        <div class="header-content">
          <h1 class="header-title">Menu Spesial</h1>
          <p class="header-subtitle">Halo, {{ visitorStore.visitorName || 'Pengunjung' }}! 👋</p>
        </div>
      </div>

      <!-- Welcome & Filter Section -->
      <div class="welcome-banner">
        <div class="banner-content">
          <h2 class="banner-title">Menu Pilihan Hari Ini</h2>
          <p class="banner-subtitle">Nikmati cita rasa terbaik dari dapur kami</p>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="category-filter">
        <button 
          v-for="cat in categories" 
          :key="cat"
          :class="['category-btn', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Menu Items Grid -->
      <div class="menu-container">
        <MenuItemCard
          v-for="product in filteredProducts"
          :key="product.id"
          :item="product"
          @click="openProductDetail(product)"
          @add="openProductDetail(product)"
        />
      </div>

      <!-- Shopping Cart FAB -->
      <div v-if="cartStore.totalItems > 0" class="fab-cart" @click="showCart = true">
        <div class="fab-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <div class="fab-badge">{{ cartStore.totalItems }}</div>
      </div>

      <!-- Product Detail Modal -->
      <ProductDetailModal
        v-if="selectedProduct"
        :product="selectedProduct"
        @close="selectedProduct = null"
        @add-to-cart="handleAddToCart"
      />

      <!-- Cart Modal -->
      <div v-if="showCart" class="cart-modal-overlay" @click="showCart = false">
        <div class="cart-modal" @click.stop>
          <div class="cart-header">
            <h2>Keranjang Belanja</h2>
            <button class="cart-close" @click="showCart = false">✕</button>
          </div>
          <div class="cart-items">
            <div v-if="cartStore.items.length === 0" class="empty-cart">
              <p>Keranjang masih kosong</p>
            </div>
            <div v-else>
              <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                <div class="cart-item-info">
                    <!-- Use image if available, else usage placeholder or emoji logic if adapted -->
                   <!-- For now simplifying display -->
                  <div class="cart-item-details">
                    <h4>{{ item.name }}</h4>
                    <p>{{ formatPrice(item.price) }}</p>
                  </div>
                </div>
                <div class="cart-item-actions">
                  <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="remove-btn">−</button>
                  <span class="item-qty">{{ item.quantity }}</span>
                  <button @click="cartStore.addItem(item)" class="add-btn">+</button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="cartStore.items.length > 0" class="cart-footer">
            <div class="total-section">
              <span>Total Harga:</span>
              <span class="total-price">{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <button class="checkout-btn" @click="goToPayment">
              <span>Lanjutkan Pembayaran</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";
import MenuItemCard from "@/components/common/MenuItemCard.vue";
import ProductDetailModal from "@/components/visitor/ProductDetailModal.vue";
import { useCartStore } from "@/stores/cart";
import { useVisitorStore } from "@/stores/visitor";
import { menuManagementService, type Menu } from "@/services/menuManagementService";
import { useMenuData } from "@/composables/useMenuData";

const router = useRouter();
const cartStore = useCartStore();
const visitorStore = useVisitorStore();
const { loadMenuData, menus: sharedMenus, categories: sharedCategories, isLoading: sharedIsLoading } = useMenuData();

const selectedCategory = ref("Semua");
const showCart = ref(false);
const menus = ref<Menu[]>([]);
const categories = ref<any[]>([]);
const selectedProduct = ref<Menu | null>(null);

console.log('🔧 [VisitorMenuPage] Component initialized');

onMounted(async () => {
  console.log('🔄 [VisitorMenuPage] Component mounted, loading data...');
  await loadData();
});

async function loadData() {
  try {
    const data = await loadMenuData();
    menus.value = data.menus;
    categories.value = data.categories;
    console.log('✅ [VisitorMenuPage] Data loaded successfully');
  } catch (error) {
    console.error('❌ [VisitorMenuPage] Error loading data:', error);
    menus.value = [];
    categories.value = [];
  }
}

const filteredProducts = computed(() => {
  console.log('🔍 [VisitorMenuPage] Filtering - selectedCategory:', selectedCategory.value, 'total menus:', menus.value.length);
  
  if (selectedCategory.value === "Semua") {
    console.log('ℹ️  [VisitorMenuPage] Showing all menus');
    return menus.value;
  }
  
  // Filter by category - match by category_id
  const categoryObj = categories.value.find(c => c.name === selectedCategory.value);
  if (!categoryObj) {
    console.warn('⚠️  [VisitorMenuPage] Category not found:', selectedCategory.value);
    return [];
  }
  
  const filtered = menus.value.filter(m => m.category_id === categoryObj.id);
  console.log(`📊 [VisitorMenuPage] Filtered by "${selectedCategory.value}": ${filtered.length} items`);
  return filtered;
});

const openProductDetail = (menu: Menu) => {
    console.log('👁️  [VisitorMenuPage] Opening product detail:', menu.name);
    selectedProduct.value = menu;
};

const handleAddToCart = (payload: { product: Menu; quantity: number }) => {
    const { product, quantity } = payload;
    console.log('🛒 [VisitorMenuPage] Adding to cart:', product.name, 'qty:', quantity);
    
    const existing = cartStore.items.find(i => i.id === product.id);
    if(existing) {
        cartStore.updateQuantity(product.id, existing.quantity + quantity);
    } else {
         // Add item to cart
         cartStore.addItem({
             id: product.id,
             name: product.name,
             price: product.price,
             type: product.category_name || `Category ${product.category_id}`,
             image: product.image_url || ''
         });
         // If qty > 1, update it immediately
         if (quantity > 1) {
             cartStore.updateQuantity(product.id, quantity);
         }
    }
    
    selectedProduct.value = null;
    showCart.value = true;
    console.log('✅ [VisitorMenuPage] Item added to cart');
};

const formatPrice = (price: number) => {
  return price.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

const goToPayment = () => {
  if (cartStore.items.length === 0) {
    return;
  }
  showCart.value = false;
  router.push("/payment");
};
</script>

<style scoped>
/* Reuse existing styles */
.menu-page-content {
  padding-bottom: 100px;
}
.menu-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 0 var(--spacing-md) var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  animation: slideDown 0.6s ease-out;
  margin-top: -16px; 
  padding-top: var(--spacing-xl); 
}
.header-content { flex: 1; }
.header-title { font-size: var(--font-size-lg); font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.5px; }
.header-subtitle { font-size: var(--font-size-sm); color: var(--text-secondary); margin: 4px 0 0 0; }

.welcome-banner { padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md); animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
.banner-content { text-align: left; }
.banner-title { font-size: var(--font-size-xl); font-weight: 900; color: var(--text-primary); margin: 0 0 8px 0; letter-spacing: -0.8px; }
.banner-subtitle { font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; font-weight: 500; }

.category-filter { padding: 0 var(--spacing-md) var(--spacing-md); display: flex; gap: 12px; overflow-x: auto; scroll-behavior: smooth; scrollbar-width: none; }
.category-filter::-webkit-scrollbar { display: none; }
.category-btn { padding: 10px 18px; border: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.8); border-radius: var(--radius-full); color: var(--text-primary); font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all var(--transition-normal); font-family: inherit; }
.category-btn:hover { border-color: var(--primary-color); background: rgba(99, 102, 241, 0.05); }
.category-btn.active { background: var(--primary-color); color: #ffffff; border-color: transparent; box-shadow: var(--shadow-md); }

.menu-container { 
  padding: 0 var(--spacing-md) 80px; 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: var(--spacing-lg); 
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both; 
}

@media (max-width: 640px) {
  .menu-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.fab-cart { position: fixed; bottom: 30px; right: 20px; width: 56px; height: 56px; border-radius: 50%; background: var(--primary-color); box-shadow: var(--shadow-lg); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 40; transition: all var(--transition-normal); animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fab-cart:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5); }
.fab-cart:active { transform: scale(0.95); }
.fab-icon { color: white; display: flex; align-items: center; justify-content: center; }
.fab-icon svg { width: 28px; height: 28px; }
.fab-badge { position: absolute; top: -8px; right: -8px; background: var(--secondary-color); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4); }

.cart-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: flex-end; animation: fadeIn 0.3s ease; }
.cart-modal { background: white; width: 100%; max-height: 85vh; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.cart-header { padding: var(--spacing-md); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; }
.cart-header h2 { font-size: var(--font-size-lg); font-weight: 800; color: var(--text-primary); margin: 0; }
.cart-close { width: 32px; height: 32px; border-radius: 8px; background: var(--bg-color); border: none; color: var(--text-secondary); font-size: 16px; cursor: pointer; transition: all var(--transition-normal); }
.cart-close:hover { background: var(--border-color); color: var(--text-primary); }
.cart-items { flex: 1; overflow-y: auto; padding: var(--spacing-md); }
.empty-cart { display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-secondary); font-size: var(--font-size-sm); }
.cart-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-color); border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid transparent; transition: all var(--transition-fast); }
.cart-item:hover { border-color: var(--primary-color); background: white; box-shadow: var(--shadow-sm); }
.cart-item-info { display: flex; align-items: center; gap: 12px; flex: 1; }
.cart-item-details h4 { margin: 0; font-size: var(--font-size-sm); font-weight: 700; color: var(--text-primary); }
.cart-item-details p { margin: 4px 0 0 0; font-size: 12px; color: var(--primary-color); font-weight: 600; }
.cart-item-actions { display: flex; align-items: center; gap: 8px; }
.cart-item-actions button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-color); background: white; color: var(--text-primary); cursor: pointer; font-weight: 700; transition: all var(--transition-fast); }
.cart-item-actions button:hover { border-color: var(--primary-color); color: var(--primary-color); }
.item-qty { min-width: 24px; text-align: center; font-weight: 700; color: var(--text-primary); }
.cart-footer { padding: var(--spacing-md); border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px; background: white; }
.total-section { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 700; color: var(--text-primary); }
.total-price { color: var(--primary-color); font-size: 18px; }
.checkout-btn { background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); padding: 14px 20px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all var(--transition-normal); box-shadow: var(--shadow-md); }
.checkout-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); background: var(--primary-hover); }
.checkout-btn svg { width: 18px; height: 18px; }

@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
