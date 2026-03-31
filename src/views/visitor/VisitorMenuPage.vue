<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"

import AppLayout from "@/components/layout/AppLayout.vue"
import MenuItemCard from "@/components/common/MenuItemCard.vue"
import ProductDetailModal from "@/components/visitor/ProductDetailModal.vue"

import { useCartStore } from "@/stores/cart"
import { useVisitorStore } from "@/stores/visitor"
import { menuService } from "@/services/menuService"
import type { MenuItem, Category } from "@/services/menuService"

/* ── Stores & Router ────────────────── */
const router       = useRouter()
const cartStore    = useCartStore()
const visitorStore = useVisitorStore()

/* ── State ──────────────────────────── */
const selectedCategory = ref("Semua")
const isLoading        = ref(false)
const loadError        = ref("")
const menus            = ref<MenuItem[]>([])
const categories       = ref<Category[]>([])
const selectedProduct  = ref<MenuItem | null>(null)

/* ── Image helper ───────────────────── */
const BACKEND_IMG = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/images/`

function resolveImage(img?: string): string {
  if (!img) return ''
  if (img.startsWith('http') || img.startsWith('data:')) return img
  if (img.startsWith('/')) return 'http://localhost' + img
  return BACKEND_IMG + img
}

/* ── Load data ──────────────────────── */
onMounted(async () => { await loadData() })

async function loadData() {
  isLoading.value = true
  loadError.value = ""
  try {
    const [menuData, categoryData] = await Promise.all([
      menuService.getMenuItems(),
      menuService.getCategories()
    ])
    menus.value = menuData.map(item => ({
      ...item,
      id:        String(item.id),
      price:     typeof item.price === 'string' ? parseFloat(item.price) : (item.price ?? 0),
      image_url: resolveImage(item.image_url),
    }))
    categories.value = categoryData
    if (menus.value.length === 0) {
      loadError.value = "Belum ada menu tersedia. Pastikan backend berjalan."
    }
  } catch {
    loadError.value = "Gagal memuat menu. Cek koneksi backend (localhost:3000)."
    menus.value = []
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

/* ── Computed ───────────────────────── */
const categoryFilters = computed(() =>
  ["Semua", ...categories.value.map(c => c.name)]
)

const filteredProducts = computed(() =>
  selectedCategory.value === "Semua"
    ? menus.value
    : menus.value.filter(m => m.category === selectedCategory.value)
)

/* ── Add to cart (langsung dari card tombol Beli) ── */
function addToCartDirect(menu: MenuItem) {
  cartStore.addItem({
    id:    String(menu.id),
    name:  menu.name,
    price: menu.price,
    type:  menu.category === "Minuman" ? "drink" : "food",
    image: menu.image_url ?? ""
  })
  // animasi badge sudah otomatis via cartStore.totalItems
}

/* ── Buka detail modal ────────────── */
function openProductDetail(menu: MenuItem) {
  selectedProduct.value = menu
}

/* ── Dari modal "Tambah ke Keranjang" ─ */
function handleAddToCart(payload: { product: MenuItem; quantity: number }) {
  const { product, quantity } = payload
  const existing = cartStore.items.find(i => i.id === String(product.id))
  if (existing) {
    cartStore.updateQuantity(String(product.id), existing.quantity + quantity)
  } else {
    cartStore.addItem({
      id:    String(product.id),
      name:  product.name,
      price: product.price,
      type:  product.category === "Minuman" ? "drink" : "food",
      image: product.image_url ?? ""
    })
    if (quantity > 1) cartStore.updateQuantity(String(product.id), quantity)
  }
  selectedProduct.value = null
}

/* ── Navigasi ke cart ───────────── */
function goToCart() {
  router.push("/cart")
}

function formatPrice(price: number) {
  return price.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
}
</script>

<template>
  <AppLayout :show-back-button="true">
    <div class="page">

      <!-- ═══════ HERO HEADER ═══════════════════════════════════ -->
      <div class="hero">
        <div class="hero__deco hero__deco--1"></div>
        <div class="hero__deco hero__deco--2"></div>
        <div class="hero__top">
          <div>
            <p class="hero__greeting">👋 Halo, {{ visitorStore.visitorName || "Pengunjung" }}!</p>
            <h1 class="hero__title">Menu Spesial</h1>
          </div>
          <!-- Cart shortcut button -->
          <button
            v-if="cartStore.totalItems > 0"
            id="btn-open-cart"
            class="hero__cart-btn"
            @click="goToCart"
          >
            🛒
            <span class="hero__cart-badge">{{ cartStore.totalItems }}</span>
          </button>
        </div>
        <div class="hero__banner">
          <p class="hero__banner-title">Menu Pilihan Hari Ini 🍽️</p>
          <p class="hero__banner-sub">Nikmati cita rasa terbaik dari dapur kami</p>
        </div>
      </div>

      <!-- ═══════ CATEGORY TABS ════════════════════════════════ -->
      <div class="cat-bar">
        <div class="cat-scroll">
          <button
            v-for="cat in categoryFilters"
            :key="cat"
            class="cat-btn"
            :class="{ 'cat-btn--active': selectedCategory === cat }"
            @click="selectedCategory = cat"
          >{{ cat }}</button>
        </div>
      </div>

      <!-- ═══════ LOADING ══════════════════════════════════════ -->
      <div v-if="isLoading" class="state">
        <div class="spinner"></div>
        <p class="state__text">Memuat menu...</p>
      </div>

      <!-- ═══════ ERROR ════════════════════════════════════════ -->
      <div v-else-if="loadError" class="state">
        <div class="state__icon">⚠️</div>
        <p class="state__text">{{ loadError }}</p>
        <button class="btn-primary" @click="loadData">Coba Lagi</button>
      </div>

      <!-- ═══════ MENU CONTENT ══════════════════════════════════ -->
      <template v-else>
        <div class="list-header">
          <span class="list-header__title">
            {{ selectedCategory === 'Semua' ? 'Semua Menu' : selectedCategory }}
          </span>
          <span class="list-header__badge">{{ filteredProducts.length }} item</span>
        </div>

        <div v-if="filteredProducts.length === 0" class="state">
          <div class="state__icon">🍽️</div>
          <p class="state__text">Tidak ada menu di kategori ini.</p>
        </div>

        <div v-else class="menu-grid">
          <MenuItemCard
            v-for="product in filteredProducts"
            :key="product.id"
            :item="product"
            @click="openProductDetail(product)"
            @add="addToCartDirect(product)"
          />
        </div>

        <div class="spacer-bottom"></div>
      </template>

      <!-- ═══════ FAB CART (fixed bottom) ═══════════════════════ -->
      <transition name="fab">
        <button
          v-if="cartStore.totalItems > 0"
          id="btn-view-cart-fab"
          class="fab"
          @click="goToCart"
        >
          <span class="fab__icon">🛒</span>
          <span class="fab__label">Lihat Keranjang</span>
          <span class="fab__right">
            <span class="fab__count">{{ cartStore.totalItems }}</span>
            <span class="fab__price">{{ formatPrice(cartStore.totalPrice) }}</span>
          </span>
        </button>
      </transition>

      <!-- ═══════ PRODUCT DETAIL MODAL ═════════════════════════ -->
      <ProductDetailModal
        v-if="selectedProduct"
        :product="selectedProduct"
        @close="selectedProduct = null"
        @add-to-cart="handleAddToCart"
      />

    </div>
  </AppLayout>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── HERO ────────────────────────────────────────────────── */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #7c3aed 100%);
  padding: 20px 20px 28px;
}
.hero__deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.hero__deco--1 { width: 160px; height: 160px; top: -50px; right: -40px; background: rgba(255,255,255,0.10); }
.hero__deco--2 { width: 100px; height: 100px; bottom: -20px; left: -20px; background: rgba(255,255,255,0.07); }

.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}
.hero__greeting {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.80);
  margin: 0 0 6px;
}
.hero__title {
  font-size: 26px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.8px;
  line-height: 1.15;
}
.hero__cart-btn {
  position: relative;
  width: 44px; height: 44px;
  border-radius: 14px;
  background: rgba(255,255,255,0.18);
  border: 1.5px solid rgba(255,255,255,0.30);
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.hero__cart-btn:active { background: rgba(255,255,255,0.28); }
.hero__cart-badge {
  position: absolute;
  top: -6px; right: -6px;
  min-width: 20px; height: 20px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #6366f1;
}
.hero__banner {
  background: rgba(255,255,255,0.14);
  border: 1.5px solid rgba(255,255,255,0.22);
  border-radius: 16px;
  padding: 14px 16px;
  position: relative;
}
.hero__banner-title { font-size: 15px; font-weight: 700; color: #ffffff; margin: 0 0 4px; }
.hero__banner-sub   { font-size: 12px; color: rgba(255,255,255,0.75); margin: 0; }

/* ── CATEGORY BAR ────────────────────────────────────────── */
.cat-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #ebebf0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.cat-scroll {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.cat-scroll::-webkit-scrollbar { display: none; }

.cat-btn {
  flex-shrink: 0;
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1.5px solid #e0e0eb;
  background: #f5f5fa;
  color: #5a5a7a;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}
.cat-btn:active { transform: scale(0.95); }
.cat-btn--active {
  background: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}

/* ── LIST HEADER ─────────────────────────────────────────── */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 4px;
}
.list-header__title { font-size: 16px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.4px; }
.list-header__badge { font-size: 12px; font-weight: 700; color: #6366f1; background: #eef0ff; padding: 3px 10px; border-radius: 10px; }

/* ── MENU GRID ───────────────────────────────────────────── */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 12px 16px;
}
@media (min-width: 480px) { .menu-grid { grid-template-columns: repeat(2, 1fr); } }

.spacer-bottom { height: 110px; }

/* ── STATES ──────────────────────────────────────────────── */
.state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 14px; padding: 70px 20px; text-align: center;
}
.state__icon { font-size: 48px; }
.state__text { font-size: 14px; color: #64748b; font-weight: 500; margin: 0; max-width: 260px; line-height: 1.6; }

.spinner {
  width: 38px; height: 38px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-primary {
  padding: 11px 28px; border-radius: 22px; border: none;
  background: #6366f1; color: white; font-size: 14px; font-weight: 700;
  font-family: inherit; cursor: pointer;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  transition: transform 0.15s;
}
.btn-primary:active { transform: scale(0.96); }

/* ── FAB CART ────────────────────────────────────────────── */
.fab {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 0 14px;
  height: 54px;
  border-radius: 27px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(99,102,241,0.50);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  max-width: calc(100vw - 32px);
}
.fab:active { transform: translateX(-50%) scale(0.96); }
.fab__icon  { font-size: 20px; }
.fab__label { font-size: 14px; font-weight: 700; }
.fab__right { display: flex; align-items: center; gap: 6px; margin-left: 4px; }
.fab__count {
  min-width: 22px; height: 22px; padding: 0 5px;
  border-radius: 11px; background: white; color: #6366f1;
  font-size: 11px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
}
.fab__price { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85); }

/* FAB transition */
.fab-enter-active, .fab-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fab-enter-from, .fab-leave-to       { opacity: 0; transform: translateX(-50%) translateY(24px); }
</style>