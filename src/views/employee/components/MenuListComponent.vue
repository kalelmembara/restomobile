<template>
  <div class="menu-list">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Memuat data...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="menus.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Tidak ada menu ditemukan</p>
      <small>Mulai dengan menambah menu baru</small>
    </div>

    <!-- Menu Table/Grid -->
    <div v-else class="menu-grid">
      <div v-for="menu in menus" :key="menu.id" class="menu-card">
        <!-- Image -->
        <div class="card-image">
          <img
            v-if="menu.image_url"
            :src="menu.image_url"
            :alt="menu.name"
            class="menu-image"
          />
          <div v-else class="no-image">
            <span>No Image</span>
          </div>
          <span class="badge category-badge">{{ menu.category_icon }} {{ menu.category_name }}</span>
        </div>

        <!-- Content -->
        <div class="card-content">
          <h3 class="menu-name">{{ menu.name }}</h3>
          
          <p v-if="menu.description" class="menu-description">
            {{ truncate(menu.description, 80) }}
          </p>

          <div class="menu-footer">
            <div class="price">
              <span class="currency">Rp</span>
              <span class="amount">{{ formatPrice(menu.price) }}</span>
            </div>

            <!-- Actions -->
            <div class="actions">
              <button class="btn-action btn-edit" @click="$emit('edit', menu)" title="Edit Menu">
                <ion-icon :icon="createOutline" />
              </button>
              <button class="btn-action btn-delete" @click="$emit('delete', menu.id)" title="Hapus Menu">
                <ion-icon :icon="trashOutline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createOutline, trashOutline } from "ionicons/icons";
import { IonSpinner } from "@ionic/vue";
import type { Menu } from "@/services/menuManagementService";

interface Props {
  menus: Menu[];
  isLoading: boolean;
}

interface Emits {
  (e: "edit", menu: Menu): void;
  (e: "delete", menuId: number): void;
}

defineProps<Props>();
defineEmits<Emits>();

function formatPrice(price: number): string {
  return price.toLocaleString("id-ID");
}

function truncate(text: string, length: number): string {
  if (text.length > length) {
    return text.substring(0, length) + "...";
  }
  return text;
}
</script>

<style scoped>
.menu-list {
  min-height: 300px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.empty-state small {
  font-size: var(--font-size-sm);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.menu-card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: var(--shadow-sm);
}

.menu-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  background: var(--bg-color);
  overflow: hidden;
}

.menu-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
}

.category-badge {
  background: rgba(255, 255, 255, 0.95);
  color: var(--primary-color);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.card-content {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-name {
  margin: 0 0 var(--spacing-xs, 4px) 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.menu-description {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  flex: 1;
}

.menu-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currency {
  font-size: 12px;
  color: var(--text-secondary);
}

.amount {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--primary-color);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 18px;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.btn-edit {
  color: var(--primary-color);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.05);
}

.btn-edit:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary-color);
}

.btn-delete {
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-color);
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
