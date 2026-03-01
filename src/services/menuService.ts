import { MenuItem, Category } from '../types';

const menuItems: MenuItem[] = [
    {
        id: '1',
        name: "Nasi Goreng Spesial",
        description: "Nasi goreng dengan telur, ayam, dan sayuran premium",
        price: 25000,
        originalPrice: 27500,
        icon: "🍛",
        category: "Makanan",
        discount: 10,
    },
    {
        id: '2',
        name: "Mie Ayam Bakso",
        description: "Mie ayam dengan bakso dan pangsit goreng crispy",
        price: 20000,
        icon: "🍜",
        category: "Makanan",
    },
    {
        id: '3',
        name: "Sate Ayam Premium",
        description: "10 tusuk sate ayam dengan bumbu kacang spesial",
        price: 30000,
        originalPrice: 35000,
        icon: "串",
        category: "Makanan",
        discount: 15,
    },
    {
        id: '4',
        name: "Gado-Gado Segar",
        description: "Sayuran segar dengan bumbu kacang dan telur",
        price: 18000,
        icon: "🥗",
        category: "Makanan",
    },
    {
        id: '5',
        name: "Es Teh Manis",
        description: "Minuman teh manis dingin yang menyegarkan",
        price: 5000,
        icon: "🧋",
        category: "Minuman",
    },
    {
        id: '6',
        name: "Jus Jeruk Segar",
        description: "Jus jeruk natural tanpa pemanis buatan",
        price: 12000,
        icon: "🧃",
        category: "Minuman",
    },
    {
        id: '7',
        name: "Kopi Espresso",
        description: "Kopi espresso premium dari biji pilihan",
        price: 15000,
        icon: "☕",
        category: "Minuman",
    },
];

const categories: Category[] = [
    { id: '1', name: 'Semua' },
    { id: '2', name: 'Makanan' },
    { id: '3', name: 'Minuman' },
];

export const menuService = {
    getMenuItems: async (): Promise<MenuItem[]> => {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(menuItems);
            }, 500);
        });
    },
    getCategories: async (): Promise<Category[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(categories);
            }, 500);
        });
    }
};
