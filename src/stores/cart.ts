import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export interface CartItem {
    id: string;
    // We'll use the product structure from the service later, but for now simple props
    name: string;
    price: number;
    quantity: number;
    image?: string;
    type: 'food' | 'drink';
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>([]);

    // Initialize from localStorage
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
        try {
            items.value = JSON.parse(savedCart);
        } catch (e) {
            console.error('Failed to parse cart from localStorage', e);
        }
    }

    // Persist to localStorage
    watch(items, (newItems) => {
        localStorage.setItem('cart_items', JSON.stringify(newItems));
    }, { deep: true });

    const totalItems = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    function addItem(product: Omit<CartItem, 'quantity'>) {
        const existingItem = items.value.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            items.value.push({ ...product, quantity: 1 });
        }
    }

    function removeItem(id: string) {
        const index = items.value.findIndex(item => item.id === id);
        if (index > -1) {
            items.value.splice(index, 1);
        }
    }

    function updateQuantity(id: string, quantity: number) {
        const item = items.value.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                removeItem(id);
            } else {
                item.quantity = quantity;
            }
        }
    }

    function clearCart() {
        items.value = [];
    }

    return {
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    };
});
