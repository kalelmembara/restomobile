<template>
  <div class="card" @click="$emit('click')">

    <!-- ── Image Area ─────────────────────────────── -->
    <div class="card__img-wrap">
      <img
        v-if="item.image_url && !imgError"
        :src="item.image_url"
        :alt="item.name"
        class="card__img"
        @error="imgError = true"
      />
      <div v-else class="card__emoji">
        {{ item.icon || getCategoryEmoji(item.category) }}
      </div>

      <!-- Discount badge -->
      <div v-if="item.discount" class="card__discount">
        -{{ item.discount }}%
      </div>

      <!-- Category pill -->
      <div v-if="item.category" class="card__cat">
        {{ item.category }}
      </div>
    </div>

    <!-- ── Content ────────────────────────────────── -->
    <div class="card__body">
      <h3 class="card__name">{{ item.name }}</h3>
      <p v-if="item.description" class="card__desc">{{ item.description }}</p>

      <!-- Footer: price + buy button -->
      <div class="card__footer">
        <div class="card__price-wrap">
          <span v-if="item.originalPrice" class="card__original">
            {{ formatPrice(item.originalPrice) }}
          </span>
          <span class="card__price">{{ formatPrice(item.price) }}</span>
        </div>
        <button
          class="card__btn"
          type="button"
          :aria-label="'Beli ' + item.name"
          @click.stop="$emit('add', item)"
        >
          <svg class="card__btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
          <span class="card__btn-text">Beli</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import type { MenuItem } from '@/services/menuService';

defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    required: true
  }
});

defineEmits(['click', 'add']);

const imgError = ref(false);

function getCategoryEmoji(category?: string): string {
  const map: Record<string, string> = {
    'Makanan': '🍛', 'Minuman': '🥤', 'Snack': '🍟', 'Dessert': '🍰',
  };
  return (category && map[category]) ? map[category] : '🍽️';
}

const formatPrice = (price: number | string | undefined) => {
  const num = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  return num.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
};
</script>

<style scoped>
/* ── CARD ────────────────────────────────────────────────── */
.card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  border: 1.5px solid #ececf4;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  -webkit-font-smoothing: antialiased;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
.card:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ── IMAGE ───────────────────────────────────────────────── */
.card__img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #f5f5fa, #ebebf5);
  overflow: hidden;
}
.card__img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.card:hover .card__img { transform: scale(1.04); }

.card__emoji {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 60px;
}

/* Discount badge */
.card__discount {
  position: absolute;
  top: 10px; left: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 8px rgba(239,68,68,0.35);
}

/* Category pill */
.card__cat {
  position: absolute;
  bottom: 8px; left: 8px;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(15,23,42,0.55);
  color: rgba(255,255,255,0.95);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* ── BODY ────────────────────────────────────────────────── */
.card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 14px 12px;
  gap: 6px;
}
.card__name {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.55;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── FOOTER ──────────────────────────────────────────────── */
.card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1.5px solid #f1f5f9;
  margin-top: auto;
}
.card__price-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.card__original {
  font-size: 11px;
  color: #cbd5e1;
  text-decoration: line-through;
  font-weight: 500;
  line-height: 1;
  min-height: 14px;
  display: block;
}
.card__price {
  font-size: 16px;
  font-weight: 900;
  color: #6366f1;
  line-height: 1;
  letter-spacing: -0.5px;
}

/* ── BUY BUTTON ──────────────────────────────────────────── */
.card__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: white;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.card__btn:active {
  transform: scale(0.93);
  box-shadow: 0 2px 6px rgba(99,102,241,0.20);
}
.card__btn-icon {
  width: 16px; height: 16px;
}
.card__btn-text {
  font-size: 13px;
  font-weight: 700;
}
</style>
