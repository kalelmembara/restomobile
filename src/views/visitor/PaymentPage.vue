<template>
  <AppLayout :show-back-button="true">
    <div class="payment-page">
      <div class="container">
        <!-- Intro -->
        <section class="section section-intro">
          <div class="title-row">
            <div class="title-icon">
              <ion-icon :icon="receiptOutline" />
            </div>
            <h1 class="title">Konfirmasi Pesanan</h1>
          </div>
          <p class="subtitle">
            Periksa kembali pesanan Anda dan pilih metode pembayaran.
          </p>
        </section>

        <!-- Nama Pelanggan Info -->
        <div class="customer-name-banner">
          <div class="customer-name-label">Nama Pelanggan</div>
          <div class="customer-name-value">{{ visitorStore.visitorName || 'Belum diisi' }}</div>
        </div>

        <!-- Ringkasan Pesanan -->
        <section class="section">
          <div class="section-head">
            <h2 class="section-title">Ringkasan Pesanan</h2>
            <p class="section-desc">Pastikan jumlah dan harga sudah sesuai.</p>
          </div>

          <div class="card order-card">
            <div v-if="cartStore.items.length === 0" class="empty-state">
              <div class="empty-title">Keranjang kosong</div>
              <div class="empty-subtitle">Tambahkan menu terlebih dahulu.</div>
            </div>

            <template v-else>
              <ion-list class="order-list">
                <ion-item
                  v-for="item in cartStore.items"
                  :key="item.id"
                  lines="none"
                  class="order-item"
                >
                  <ion-thumbnail slot="start" class="item-avatar">
                    <div class="item-avatar-inner">
                      {{ getInitials(item.name) }}
                    </div>
                  </ion-thumbnail>

                  <ion-label class="item-label">
                    <div class="item-row">
                      <div class="item-name">
                        {{ item.name }}
                      </div>
                      <div class="item-total-price">
                        {{ formatPrice(item.price * item.quantity) }}
                      </div>
                    </div>
                    <div class="item-meta">
                      {{ item.quantity }} x {{ formatPrice(item.price) }}
                    </div>
                  </ion-label>
                </ion-item>
              </ion-list>

              <div class="summary-divider"></div>

              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span class="summary-value">
                    {{ formatPrice(subtotal) }}
                  </span>
                </div>
                <div class="summary-row summary-row-total">
                  <span>Total Pembayaran</span>
                  <span class="summary-value summary-value-total">
                    {{ formatPrice(total) }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- Metode Pembayaran -->
        <section class="section">
          <div class="section-head">
            <h2 class="section-title">Metode Pembayaran</h2>
            <p class="section-desc">
              Pilih metode pembayaran yang ingin digunakan.
            </p>
          </div>

          <div class="payment-methods">
            <button
              v-for="method in paymentMethods"
              :key="method.value"
              type="button"
              class="method-card"
              :class="{ 'method-card-active': selectedPaymentMethod === method.value }"
              @click="selectPaymentMethod(method.value)"
            >
              <div class="method-icon-wrapper">
                <ion-icon :icon="method.icon" class="method-icon" />
              </div>

              <div class="method-text">
                <div class="method-label">{{ method.label }}</div>
                <div class="method-desc">{{ method.description }}</div>
              </div>

              <div class="method-radio">
                <span class="method-radio-outer">
                  <span
                    class="method-radio-inner"
                    :class="{
                      'method-radio-inner-active':
                        selectedPaymentMethod === method.value,
                    }"
                  >
                    <ion-icon
                      v-if="selectedPaymentMethod === method.value"
                      :icon="checkmarkOutline"
                      class="method-check"
                    />
                  </span>
                </span>
              </div>
            </button>
          </div>
        </section>

        <!-- Catatan Pesanan -->
        <section class="section">
          <div class="section-head">
            <h2 class="section-title">Catatan Pesanan</h2>
            <p class="section-desc">Opsional, untuk instruksi khusus ke dapur.</p>
          </div>

          <textarea
            v-model="note"
            class="note-textarea-fixed"
            placeholder="Contoh: tanpa gula, pedas sedang, saus dipisah, dll."
          />
        </section>

        <!-- Spacer agar konten tidak tertutup bottom bar -->
        <div class="bottom-spacer" />
      </div>

      <!-- Bottom Fixed Payment Bar -->
      <div class="bottom-bar">
        <div class="bottom-inner">
          <div class="bottom-total">
            <div class="bottom-total-label">Total Pembayaran</div>
            <div class="bottom-total-value">
              {{ formatPrice(total) }}
            </div>
          </div>

          <ion-button
            class="bottom-button"
            size="large"
            :disabled="isConfirmDisabled"
            @click="confirmOrder"
          >
            Konfirmasi Pesanan
          </ion-button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { toastController } from "@ionic/vue";
import {
  cashOutline,
  cardOutline,
  qrCodeOutline,
  receiptOutline,
  checkmarkOutline,
} from "ionicons/icons";
import AppLayout from "@/components/layout/AppLayout.vue";
import { useCartStore } from "@/stores/cart";
import { useVisitorStore } from "@/stores/visitor";
import { useOrderStore } from "@/stores/order";
import { transactionService } from "@/services/transactionService";

const router = useRouter();
const cartStore = useCartStore();
const visitorStore = useVisitorStore();
const orderStore = useOrderStore();

const selectedPaymentMethod = ref<"cash" | "transfer" | "qris" | null>(null);
const note = ref("");
const isLoading = ref(false);

const paymentMethods = [
  {
    value: "cash",
    label: "Cash",
    description: "Bayar tunai langsung kepada kasir.",
    icon: cashOutline,
  },
  {
    value: "transfer",
    label: "Transfer Bank",
    description: "Pembayaran via mobile banking atau ATM.",
    icon: cardOutline,
  },
  {
    value: "qris",
    label: "QRIS",
    description: "Scan QRIS untuk pembayaran instan.",
    icon: qrCodeOutline,
  },
] as const;

const isCartEmpty = computed(() => cartStore.items.length === 0);

const subtotal = computed(() => cartStore.totalPrice);
const total = computed(() => subtotal.value);

const isConfirmDisabled = computed(
  () => isCartEmpty.value || !selectedPaymentMethod.value || isLoading.value
);

const formatPrice = (price: number) =>
  price.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const selectPaymentMethod = (value: "cash" | "transfer" | "qris") => {
  selectedPaymentMethod.value = value;
};

onMounted(() => {
  if (isCartEmpty.value) {
    router.replace("/visitor-menu");
  }
});

watch(
  () => cartStore.items.length,
  (newLength) => {
    if (newLength === 0) {
      router.replace("/visitor-menu");
    }
  }
);

const confirmOrder = async () => {
  if (!selectedPaymentMethod.value) return;
  
  if (isLoading.value) return; // Prevent double click
  
  isLoading.value = true;

  try {
    // DEBUG: Log nama pelanggan
    const customerName = visitorStore.visitorName || 'Unknown';
    console.log('🔵 confirmOrder - visitorStore.visitorName:', visitorStore.visitorName);
    console.log('🟢 confirmOrder - Using customerName:', customerName);
    
    // Prepare transaction data
    const orderItems = cartStore.items.map(item => ({
      name: item.name,
      qty: item.quantity,
      price: item.price
    }));

    // Save transaction to database with customer name
    const result = await transactionService.createTransaction(
      orderItems,
      total.value,
      selectedPaymentMethod.value,
      note.value || undefined,
      customerName
    );

    if (result.success) {
      // ✅ Simpan ke Pinia orderStore agar Dashboard langsung update
      orderStore.addOrder({
        customer: customerName,
        items:    orderItems,
        total:    total.value,
        note:     note.value || undefined,
        externalId: result.transactionId,
      });

      // Show success toast with appropriate message
      const toastColor = result.isOffline ? 'warning' : 'success';
      const toastMessage = result.isOffline
        ? `⚠️ Pesanan disimpan lokal\n(Backend sedang offline)\nID: ${result.transactionId}`
        : `✅ Pesanan berhasil!\nID: ${result.transactionId}`;

      const toast = await toastController.create({
        message: toastMessage,
        duration: 4000,
        position: 'top',
        color: toastColor
      });
      await toast.present();

      // Clear cart after successful transaction
      cartStore.clearCart();
      
      // Clear visitor name for next customer
      visitorStore.clearVisitor();

      // Reset form
      selectedPaymentMethod.value = null;
      note.value = "";

      // Navigate back to menu
      setTimeout(() => {
        router.push("/visitor-menu");
      }, 2000);
    } else {
      // Show error toast with helpful information
      let errorMessage = result.message;
      
      // Provide helpful guidance based on error type
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Backend')) {
        errorMessage = `❌ Koneksi error!\n\nPastikan backend running:\ncd backend && npm run dev\n\nError: ${result.message}`;
      } else if (errorMessage.includes('Network')) {
        errorMessage = `❌ Network error!\nCinta internet connection & backend status`;
      }

      const toast = await toastController.create({
        message: errorMessage,
        duration: 5000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
    
    const toast = await toastController.create({
      message: `❌ Error!\n${errorMessage}`,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.payment-page {
  --primary-color: #3b82f6;
  background: radial-gradient(circle at top, #eef2ff 0, #f8fafc 38%, #f9fafb 100%);
  min-height: 100vh;
}

.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 250px;
}

.section {
  margin-bottom: 16px;
}

.section-intro {
  margin-bottom: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 4px;
}

.title-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.subtitle {
  margin: 6px 4px 0;
  font-size: 13px;
  color: #64748b;
}

.section-head {
  margin: 0 4px 8px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.section-desc {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #64748b;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 10px 0 10px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  border: none;
}

.order-list {
  padding: 6px 0;
  background: transparent !important;
  --background: transparent !important;
  --border-color: transparent !important;
}

.order-item {
  --background: #ffffff;
  --min-height: 68px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  --border-radius: 18px;
  --border-color: transparent !important;
  margin: 4px 10px;
  border: none !important;
}

.item-avatar {
  --size: 42px;
  --border-radius: 14px;
}

.item-avatar-inner {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.03em;
}

.item-label {
  margin: 0;
}

.item-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.item-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.item-total-price {
  font-size: 14px;
  font-weight: 800;
  color: var(--primary-color);
  white-space: nowrap;
}

.item-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.summary-divider {
  height: 1px;
  margin: 6px 14px;
  background: rgba(148, 163, 184, 0.15);
}

.summary {
  padding: 6px 14px 10px;
}

.summary-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
  color: #4b5563;
}

.summary-row-total {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px dashed rgba(148, 163, 184, 0.7);
}

.summary-value {
  font-weight: 700;
  color: #111827;
}

.summary-value-total {
  font-size: 18px;
  font-weight: 900;
  color: var(--primary-color);
}

.empty-state {
  padding: 18px 16px;
  text-align: center;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.empty-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.method-card {
  width: 100%;
  border-radius: 16px;
  padding: 14px 14px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.18s ease;
}

.method-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.method-card-active {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.95);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.method-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.method-icon {
  font-size: 22px;
}

.method-text {
  flex: 1;
  min-width: 0;
}

.method-label {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.method-desc {
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}

.method-radio {
  flex-shrink: 0;
}

.method-radio-outer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.9);
  transition: border-color 0.2s ease;
}

.method-radio-inner {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.method-radio-inner-active {
  background: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
}

.method-check {
  color: #ffffff;
  font-size: 9px;
}

.note-textarea-fixed {
  width: 100%;
  height: 100px;
  max-height: 100px;
  min-height: 100px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2), 0 2px 6px rgba(0, 0, 0, 0.03);
  font-family: inherit;
  font-size: 14px;
  color: #111827;
  overflow-y: auto;
  resize: none;
  box-sizing: border-box;
}

.note-textarea-fixed::placeholder {
  color: #9ca3af;
}

.note-textarea-fixed:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.1), 0 2px 6px rgba(0, 0, 0, 0.03);
}

.customer-name-banner {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-left: 4px solid #3b82f6;
}

.customer-name-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 4px;
}

.customer-name-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}


.bottom-spacer {
  height: 180px;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px 16px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(18px);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  z-index: 1000;
}

.bottom-inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bottom-total {
  flex: 1;
}

.bottom-total-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
}

.bottom-total-value {
  margin-top: 2px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}

.bottom-button {
  --background: #3b82f6;
  --background-hover: #2563eb;
  --border-radius: 999px;
  --box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  font-weight: 800;
  letter-spacing: 0.01em;
  text-transform: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.bottom-button:hover:not(.button-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

.bottom-button.button-disabled {
  --background: rgba(148, 163, 184, 0.8);
  --box-shadow: none;
}

@media (max-width: 480px) {
  .bottom-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .bottom-total {
    text-align: left;
  }
}
</style>

