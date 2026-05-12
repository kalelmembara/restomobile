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
const errorType        = ref<"backend" | "empty" | "">("")  // tipe error untuk tampilan berbeda
const menus            = ref<MenuItem[]>([])
const categories       = ref<Category[]>([])
const selectedProduct  = ref<MenuItem | null>(null)

/* ── Image helper ───────────────────── */
// Gunakan URL relatif → Vite proxy forward ke http://localhost:3000/images/...
function resolveImage(img?: string): string {
  if (!img) return ""
  if (img.startsWith("http") || img.startsWith("data:")) return img
  if (img.startsWith("/images/")) return img           // sudah relatif
  if (img.startsWith("/")) return img                  // path absolut lain
  return `/images/${img}`                              // nama file saja → prepend /images/
}

/* ── Load data ──────────────────────── */
onMounted(async () => { await loadData() })

async function loadData() {
  isLoading.value  = true
  loadError.value  = ""
  errorType.value  = ""

  try {
    // Fetch menu & kategori secara paralel
    const [menuData, categoryData] = await Promise.all([
      menuService.getMenuItems(),
      menuService.getCategories()
    ])

    // Normalisasi data menu
    menus.value = menuData.map(item => ({
      ...item,
      id:        String(item.id),
      price:     typeof item.price === "string" ? parseFloat(item.price) : (item.price ?? 0),
      image_url: resolveImage(item.image_url),
    }))

    // Jika backend kembalikan kategori → pakai itu
    // Jika tidak → derive dari data menu (fallback)
    if (categoryData.length > 0) {
      categories.value = categoryData
    } else {
      const uniqueCats = [...new Set(menus.value.map(m => m.category).filter(Boolean))]
      categories.value = uniqueCats.map((name, i) => ({ id: i + 1, name }))
    }

    // Cek apakah menu benar-benar kosong
    if (menus.value.length === 0) {
      errorType.value = "empty"
      loadError.value = "Menu belum tersedia di database."
    }

  } catch (err: any) {
    // Bedakan: network error (backend mati) vs server error
    const isNetworkError = !err?.response
    errorType.value = "backend"
    if (isNetworkError) {
      loadError.value = "Tidak bisa terhubung ke server. Pastikan backend berjalan di port 3000."
    } else {
      const status = err?.response?.status
      const msg    = err?.response?.data?.message || err.message
      loadError.value = `Server error (${status}): ${msg}`
    }
    menus.value      = []
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

function selectCategory(cat: string) {
  selectedCategory.value = cat
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
            @click="selectCategory(cat)"
          >{{ cat }}</button>
        </div>
      </div>

      <!-- ═══════ LOADING ══════════════════════════════════════ -->
      <div v-if="isLoading" class="state">
        <div class="spinner"></div>
        <p class="state__text">Memuat menu dari server...</p>
        <p class="state__hint">Menghubungkan ke backend...</p>
      </div>

      <!-- ═══════ ERROR — Backend Offline ═════════════════════ -->
      <div v-else-if="loadError && errorType === 'backend'" class="state">
        <div class="state__icon">🔌</div>
        <p class="state__title">Backend Tidak Aktif</p>
        <p class="state__text">{{ loadError }}</p>
        <div class="state__steps">
          <p class="state__steps-title">Cara menjalankan backend:</p>
          <code class="state__code">cd backend<br>node server.js</code>
        </div>
        <button class="btn-primary" @click="loadData">
          🔄 Coba Lagi
        </button>
      </div>

      <!-- ═══════ ERROR — Menu Kosong ══════════════════════════ -->
      <div v-else-if="loadError && errorType === 'empty'" class="state">
        <div class="state__icon">🍽️</div>
        <p class="state__title">Belum Ada Menu</p>
        <p class="state__text">Database kosong. Tambahkan menu melalui dashboard admin.</p>
        <button class="btn-primary" @click="loadData">
          🔄 Refresh
        </button>
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
          <div class="state__icon">🔍</div>
          <p class="state__text">Tidak ada menu di kategori "{{ selectedCategory }}".</p>
          <button class="btn-secondary" @click="selectCategory('Semua')">
            Lihat Semua Menu
          </button>
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
@media (min-width: 768px) { .menu-grid { grid-template-columns: repeat(3, 1fr); } }

.spacer-bottom { height: 110px; }

/* ── STATES ──────────────────────────────────────────────── */
.state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; padding: 60px 24px; text-align: center;
}
.state__icon  { font-size: 52px; line-height: 1; }
.state__title { font-size: 16px; font-weight: 800; color: #1a1a2e; margin: 0; }
.state__text  { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; max-width: 280px; line-height: 1.65; }
.state__hint  { font-size: 12px; color: #94a3b8; margin: 0; }

/* Step-by-step cara start backend */
.state__steps {
  background: #f8f9ff;
  border: 1.5px solid #e0e3f8;
  border-radius: 14px;
  padding: 14px 20px;
  text-align: left;
  width: 100%;
  max-width: 320px;
}
.state__steps-title {
  font-size: 11px;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}
.state__code {
  display: block;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  color: #1e293b;
  background: #e8eaf6;
  border-radius: 8px;
  padding: 10px 14px;
  line-height: 1.8;
  white-space: pre;
}

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
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: white; font-size: 14px; font-weight: 700;
  font-family: inherit; cursor: pointer;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  transition: transform 0.15s;
}
.btn-primary:active { transform: scale(0.96); }

.btn-secondary {
  padding: 10px 24px; border-radius: 22px;
  border: 1.5px solid #6366f1;
  background: transparent;
  color: #6366f1; font-size: 13px; font-weight: 700;
  font-family: inherit; cursor: pointer;
  transition: background 0.15s;
}
.btn-secondary:active { background: #eef0ff; }

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