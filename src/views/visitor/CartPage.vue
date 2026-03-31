<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import AppLayout from "@/components/layout/AppLayout.vue"
import { useCartStore } from "@/stores/cart"
import { useVisitorStore } from "@/stores/visitor"

/* ── Stores & Router ──────────────────────── */
const router       = useRouter()
const cartStore    = useCartStore()
const visitorStore = useVisitorStore()

/* ── Computed ─────────────────────────────── */
const isEmpty = computed(() => cartStore.items.length === 0)

/* ── Helpers ──────────────────────────────── */
function formatPrice(price: number) {
  return price.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
}

function getCategoryEmoji(type?: string): string {
  const map: Record<string, string> = {
    food: "🍛",
    drink: "🥤",
  }
  return (type && map[type]) ? map[type] : "🍽️"
}

/* ── Actions ──────────────────────────────── */
function increment(id: string) {
  const item = cartStore.items.find(i => i.id === id)
  if (item) cartStore.updateQuantity(id, item.quantity + 1)
}

function decrement(id: string) {
  const item = cartStore.items.find(i => i.id === id)
  if (item) cartStore.updateQuantity(id, item.quantity - 1) // auto removes if 0
}

function removeItem(id: string) {
  cartStore.removeItem(id)
}

function goBack() {
  router.push("/visitor-menu")
}

function goCheckout() {
  router.push("/payment")
}
</script>

<template>
  <AppLayout :show-back-button="true">
    <div class="cart-page">

      <!-- ═══════ HEADER ══════════════════════════════════════ -->
      <div class="cart-header">
        <div class="cart-header__deco cart-header__deco--1"></div>
        <div class="cart-header__deco cart-header__deco--2"></div>
        <div class="cart-header__inner">
          <div>
            <p class="cart-header__sub">{{ visitorStore.visitorName || "Pengunjung" }}</p>
            <h1 class="cart-header__title">🛒 Keranjang</h1>
          </div>
          <div class="cart-header__badge-wrap" v-if="!isEmpty">
            <span class="cart-header__count-badge">{{ cartStore.totalItems }} item</span>
          </div>
        </div>
      </div>

      <!-- ═══════ EMPTY STATE ════════════════════════════════ -->
      <div v-if="isEmpty" class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <h2 class="empty-state__title">Keranjang Kosong</h2>
        <p class="empty-state__desc">Belum ada pesanan yang ditambahkan.<br>Yuk, pilih menu favoritmu!</p>
        <button class="btn-back-menu" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-back-menu__icon">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Lihat Menu
        </button>
      </div>

      <!-- ═══════ CART ITEMS ══════════════════════════════════ -->
      <template v-else>
        <div class="section-label">
          <span class="section-label__text">Pesanan Anda</span>
        </div>

        <div class="cart-list">
          <transition-group name="cart-item" tag="div">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="cart-card"
            >
              <!-- Item image / emoji -->
              <div class="cart-card__img" :class="`cart-card__img--${item.type}`">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="cart-card__photo"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
                <span v-else class="cart-card__emoji">{{ getCategoryEmoji(item.type) }}</span>
              </div>

              <!-- Item info -->
              <div class="cart-card__info">
                <p class="cart-card__name">{{ item.name }}</p>
                <p class="cart-card__unit-price">{{ formatPrice(item.price) }} / pcs</p>
                <p class="cart-card__subtotal">{{ formatPrice(item.price * item.quantity) }}</p>
              </div>

              <!-- Qty controls + delete -->
              <div class="cart-card__controls">
                <!-- Delete -->
                <button
                  class="btn-delete"
                  :aria-label="'Hapus ' + item.name"
                  @click="removeItem(item.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>

                <!-- Stepper -->
                <div class="stepper">
                  <button
                    class="stepper__btn stepper__btn--minus"
                    :aria-label="'Kurangi ' + item.name"
                    @click="decrement(item.id)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M5 12h14"/>
                    </svg>
                  </button>
                  <span class="stepper__qty">{{ item.quantity }}</span>
                  <button
                    class="stepper__btn stepper__btn--plus"
                    :aria-label="'Tambah ' + item.name"
                    @click="increment(item.id)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- ═══════ ORDER SUMMARY ══════════════════════════════ -->
        <div class="summary-card">
          <div class="summary-card__title">Ringkasan Pesanan</div>

          <div class="summary-card__rows">
            <div
              v-for="item in cartStore.items"
              :key="'sum-' + item.id"
              class="summary-row"
            >
              <span class="summary-row__name">{{ item.name }} ×{{ item.quantity }}</span>
              <span class="summary-row__price">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span class="summary-total__label">Total</span>
            <span class="summary-total__value">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
        </div>

        <!-- spacer agar tidak tertutup bottom-bar -->
        <div class="bottom-spacer"></div>

        <!-- ═══════ BOTTOM ACTION BAR ══════════════════════════ -->
        <div class="bottom-bar">
          <div class="bottom-bar__total">
            <span class="bottom-bar__total-label">Total Pembayaran</span>
            <span class="bottom-bar__total-value">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <button id="btn-checkout" class="btn-checkout" @click="goCheckout">
            <span>Checkout</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-checkout__arrow">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </template>

    </div>
  </AppLayout>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── PAGE ─────────────────────────────────────────────────── */
.cart-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── HEADER ───────────────────────────────────────────────── */
.cart-header {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #7c3aed 100%);
  padding: 20px 20px 28px;
}
.cart-header__deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.cart-header__deco--1 { width: 140px; height: 140px; top: -45px; right: -35px; background: rgba(255,255,255,0.10); }
.cart-header__deco--2 { width: 80px;  height: 80px;  bottom: -18px; left: -18px; background: rgba(255,255,255,0.07); }

.cart-header__inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}
.cart-header__sub {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.80);
  margin: 0 0 6px;
}
.cart-header__title {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  margin: 0;
  letter-spacing: -0.8px;
  line-height: 1.15;
}
.cart-header__count-badge {
  display: inline-block;
  background: rgba(255,255,255,0.20);
  border: 1.5px solid rgba(255,255,255,0.30);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 20px;
  padding: 4px 12px;
}

/* ── EMPTY STATE ─────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px 40px;
  text-align: center;
}
.empty-state__icon {
  font-size: 72px;
  line-height: 1;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
.empty-state__title {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.5px;
}
.empty-state__desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.65;
}
.btn-back-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 13px 28px;
  border-radius: 25px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(99,102,241,0.40);
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-back-menu:active { transform: scale(0.96); }
.btn-back-menu__icon { width: 18px; height: 18px; }

/* ── SECTION LABEL ───────────────────────────────────────── */
.section-label {
  padding: 20px 16px 8px;
  display: flex;
  align-items: center;
}
.section-label__text {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: -0.4px;
}

/* ── CART LIST ───────────────────────────────────────────── */
.cart-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── CART CARD ───────────────────────────────────────────── */
.cart-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #ececf4;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cart-card:active { transform: scale(0.98); }

/* Image / emoji */
.cart-card__img {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: linear-gradient(135deg, #f5f5fa, #ebebf5);
}
.cart-card__img--food  { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.cart-card__img--drink { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
.cart-card__photo {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.cart-card__emoji { line-height: 1; }

/* Info */
.cart-card__info {
  flex: 1;
  min-width: 0;
}
.cart-card__name {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 3px;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-card__unit-price {
  font-size: 11px;
  color: #94a3b8;
  margin: 0 0 4px;
}
.cart-card__subtotal {
  font-size: 14px;
  font-weight: 900;
  color: #6366f1;
  margin: 0;
  letter-spacing: -0.4px;
}

/* Controls (delete + stepper) */
.cart-card__controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

/* Delete button */
.btn-delete {
  width: 30px; height: 30px;
  border-radius: 10px;
  border: 1.5px solid #fee2e2;
  background: #fff5f5;
  color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.btn-delete svg { width: 14px; height: 14px; }
.btn-delete:active { background: #fee2e2; transform: scale(0.92); }

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f5f5fa;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #ebebf0;
}
.stepper__btn {
  width: 34px; height: 34px;
  border: none;
  background: transparent;
  color: #6366f1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.stepper__btn svg { width: 14px; height: 14px; }
.stepper__btn:active { background: #e8e8f5; transform: scale(0.9); }
.stepper__btn--minus { border-right: 1.5px solid #ebebf0; }
.stepper__btn--plus  { border-left:  1.5px solid #ebebf0; }
.stepper__qty {
  min-width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: #1a1a2e;
  padding: 0 4px;
  line-height: 34px;
}

/* ── SUMMARY CARD ────────────────────────────────────────── */
.summary-card {
  margin: 20px 16px 0;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #ececf4;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 16px;
}
.summary-card__title {
  font-size: 14px;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}
.summary-card__rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.summary-row__name {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary-row__price {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  flex-shrink: 0;
}
.summary-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin: 12px 0;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary-total__label {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}
.summary-total__value {
  font-size: 20px;
  font-weight: 900;
  color: #6366f1;
  letter-spacing: -0.8px;
}

/* ── BOTTOM BAR ──────────────────────────────────────────── */
.bottom-spacer { height: 110px; }

.bottom-bar {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 100;
  padding: 14px 16px 22px;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid #ebebf0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 12px;
}
.bottom-bar__total { flex: 1; }
.bottom-bar__total-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: block;
}
.bottom-bar__total-value {
  font-size: 20px;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: -0.6px;
  display: block;
  margin-top: 2px;
}

/* Checkout button */
.btn-checkout {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 22px;
  height: 52px;
  border-radius: 26px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99,102,241,0.45);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-checkout:active {
  transform: scale(0.96);
  box-shadow: 0 4px 14px rgba(99,102,241,0.30);
}
.btn-checkout__arrow { width: 18px; height: 18px; }

/* ── TRANSITIONS ─────────────────────────────────────────── */
.cart-item-enter-active, .cart-item-leave-active {
  transition: all 0.3s ease;
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.96);
}
.cart-item-move {
  transition: transform 0.3s ease;
}
</style>
