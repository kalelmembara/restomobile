/**
 * useOrderStore — Pinia store untuk manajemen pesanan.
 *
 * Aliran data:
 *   PaymentPage (checkout) → addOrder() → localStorage + memory
 *   EmployeeDashboardPage  → orders / filteredByStatus / stats (computed)
 *
 * Jika backend tersedia, pesanan dari API juga di-merge masuk.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Order, OrderStatus, OrderItem } from '@/types';

const STORAGE_KEY = 'order_store_v1';

// ── helpers ──────────────────────────────────────────────────
function now(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function generateId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

function loadFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    // Hanya ambil pesanan hari ini
    const today = new Date().toISOString().split('T')[0];
    return parsed.filter((o: any) => (o.date || '').startsWith(today));
  } catch {
    return [];
  }
}

function saveToStorage(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    console.error('[orderStore] Failed to save to localStorage');
  }
}

// ── store ─────────────────────────────────────────────────────
export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>(loadFromStorage());

  // ── computed ─────────────────────────────────────────────────

  /** Total pesanan hari ini */
  const todayOrderCount = computed(() => orders.value.length);

  /** Total penjualan hari ini */
  const todayTotalSales = computed(() =>
    orders.value.reduce((sum, o) => sum + o.total, 0)
  );

  /**
   * Filter pesanan berdasarkan status tab.
   * 'all' → semua pesanan; selainnya → filter exact match.
   */
  function getFilteredOrders(status: string): Order[] {
    if (status === 'all') return orders.value;
    return orders.value.filter(o => o.status === status);
  }

  // ── actions ───────────────────────────────────────────────────

  /**
   * Tambah pesanan baru (dipanggil dari PaymentPage setelah checkout).
   */
  function addOrder(payload: {
    customer: string;
    items: OrderItem[];
    total: number;
    note?: string;
    externalId?: string;
  }): Order {
    const todayDate = new Date().toISOString().split('T')[0];
    const order = {
      id:       payload.externalId || generateId(),
      customer: payload.customer,
      time:     now(),
      status:   'pending' as OrderStatus,
      items:    payload.items,
      total:    payload.total,
      note:     payload.note,
      date:     todayDate,   // field tambahan untuk filter harian
    };

    // Hindari duplikat (jika externalId sudah ada)
    const exists = orders.value.find(o => o.id === order.id);
    if (!exists) {
      orders.value.unshift(order as unknown as Order); // terbaru di atas
      saveToStorage(orders.value);
    }

    return order as unknown as Order;
  }

  /**
   * Update status pesanan (dipanggil dari tombol di Dashboard).
   */
  function updateOrderStatus(id: string, newStatus: OrderStatus): boolean {
    const order = orders.value.find(o => o.id === id);
    if (!order) return false;
    order.status = newStatus;
    saveToStorage(orders.value);
    return true;
  }

  /**
   * Merge pesanan dari backend API ke store (tanpa duplikat).
   * Dipanggil saat Dashboard dimount / refresh.
   */
  function mergeFromBackend(backendOrders: Order[]): void {
    for (const bo of backendOrders) {
      const exists = orders.value.find(o => o.id === bo.id);
      if (!exists) {
        orders.value.push(bo);
      }
    }
    // Urutkan: terbaru di atas berdasarkan waktu string
    orders.value.sort((a, b) => (b.time > a.time ? 1 : -1));
    saveToStorage(orders.value);
  }

  /** Bersihkan pesanan lama (opsional, dipanggil saat hari berganti) */
  function clearTodayOrders(): void {
    orders.value = [];
    saveToStorage([]);
  }

  return {
    orders,
    todayOrderCount,
    todayTotalSales,
    getFilteredOrders,
    addOrder,
    updateOrderStatus,
    mergeFromBackend,
    clearTodayOrders,
  };
});
