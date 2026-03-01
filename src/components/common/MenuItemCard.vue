<template>
  <div class="menu-item" @click="$emit('click')">
    <div class="item-image">
      <img v-if="item.image || item.image_url" :src="item.image || item.image_url || 'https://via.placeholder.com/220'" :alt="item.name" class="item-img-src" />
      <span v-else class="item-emoji">{{ item.icon || '🍽️' }}</span>
      <div v-if="item.discount" class="discount-badge">-{{ item.discount }}%</div>
    </div>
    <div class="item-content">
      <h3 class="item-name">{{ item.name }}</h3>
      <p class="item-desc">{{ item.description }}</p>
      <div class="item-footer">
        <div class="price-section">
          <span v-if="item.originalPrice" class="original-price">
            {{ formatPrice(item.originalPrice) }}
          </span>
          <span class="item-price">{{ formatPrice(item.price) }}</span>
        </div>
        <button class="add-btn" @click.stop="$emit('add', item)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { type Menu } from '@/services/menuManagementService';

// Support both old MenuItem and new Menu interfaces
interface MenuItem extends Partial<Menu> {
  icon?: string;
  discount?: number;
  originalPrice?: number;
  image?: string;
}

defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    required: true
  }
});

defineEmits(['click', 'add']);

const formatPrice = (price: number) => {
  return price.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};
</script>

<style scoped>
/* Menu Item Card */
.menu-item {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-item:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(99, 102, 241, 0.3);
}

.item-image {
  position: relative;
  width: 100%;
  height: 220px;
  background: #f8fafc;
  overflow: hidden;
}

.item-img-src {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-item:hover .item-img-src {
  transform: scale(1.05);
}

.item-emoji {
  font-size: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, var(--danger-color), var(--warning-color));
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 800;
  box-shadow: var(--shadow-sm);
  z-index: 2;
}

.item-content {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-name {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.5px;
}

.item-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.original-price {
  font-size: 12px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
}

.item-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: -0.5px;
}

.add-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, var(--primary-hover), #7c3aed);
}

.add-btn svg {
  width: 24px;
  height: 24px;
}
</style>
