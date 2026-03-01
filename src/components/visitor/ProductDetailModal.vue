<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <div class="product-image-container">
        <img :src="product.image_url || 'https://via.placeholder.com/400'" :alt="product.name" class="product-image" />
      </div>

      <div class="product-details">
        <h2>{{ product.name }}</h2>
        <p class="description">{{ product.description }}</p>
        <p class="price">{{ formatCurrency(product.price) }}</p>

        <div class="quantity-control">
          <button @click="decreaseQty" :disabled="quantity <= 1">-</button>
          <span>{{ quantity }}</span>
          <button @click="increaseQty">+</button>
        </div>

        <div class="total-price">
           Total: {{ formatCurrency(product.price * quantity) }}
        </div>

        <button class="add-to-cart-btn" @click="addToCart">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type Menu } from '@/services/menuManagementService';

// Define props - accept Menu interface which is more comprehensive
const props = defineProps<{
  product: Menu;
}>();

const emit = defineEmits(['close', 'add-to-cart']);

const quantity = ref(1);

const increaseQty = () => {
    quantity.value++;
};

const decreaseQty = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

const addToCart = () => {
    emit('add-to-cart', { product: props.product, quantity: quantity.value });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: white;
  padding: 0; /* Removing padding to let image bleed */
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 20px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  z-index: 10;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: white;
  transform: scale(1.1);
}

.product-image-container {
  width: 100%;
  height: 240px;
  background: #f1f5f9;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  padding: 24px;
}

.product-details h2 {
    margin: 0 0 8px;
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 800;
    line-height: 1.2;
}

.description {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
}

.price {
    font-weight: 800;
    color: var(--primary-color);
    font-size: 24px;
    margin: 0 0 20px;
}

.quantity-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin: 20px 0 24px;
    background: var(--bg-color);
    padding: 8px;
    border-radius: var(--radius-full);
}

.quantity-control button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: white;
    cursor: pointer;
    font-weight: bold;
    font-size: 18px;
    color: var(--primary-color);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
}

.quantity-control button:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
}

.quantity-control button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.quantity-control span {
    font-weight: 800;
    font-size: 18px;
    color: var(--text-primary);
    min-width: 24px;
    text-align: center;
}

.total-price {
    margin-bottom: 16px;
    font-weight: 700;
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;
}

.add-to-cart-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-md);
}

.add-to-cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.add-to-cart-btn:active {
    transform: translateY(0);
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
