<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <div class="product-image-container">
        <img 
          :src="product.image || 'https://via.placeholder.com/400'" 
          :alt="product.name" 
          class="product-image" 
        />
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
import { ref } from 'vue'
import type { Menu } from "@/types/Menu"

// === Props ===
const props = defineProps<{
  product: Menu
}>()

const emit = defineEmits(['close', 'add-to-cart'])

const quantity = ref(1)

// === Quantity Logic ===
const increaseQty = () => quantity.value++

const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--
}

// === Emit Add To Cart ===
const addToCart = () => {
  emit('add-to-cart', { product: props.product, quantity: quantity.value })
}

// === Format Price ===
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(value)
}
</script>

<style scoped>
/* (CSS kamu tetap sama, tidak perlu diubah) */
</style>