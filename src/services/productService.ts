export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: 'food' | 'drink';
    description?: string;
}

const mockFoods: Product[] = [
    { id: 'f1', name: 'Nasi Goreng Spesial', price: 25000, image: 'https://via.placeholder.com/150', category: 'food', description: 'Nasi goreng dengan telur, ayam, dan kerupuk.' },
    { id: 'f2', name: 'Mie Goreng Jawa', price: 22000, image: 'https://via.placeholder.com/150', category: 'food', description: 'Mie goreng bumbu jawa asli.' },
    { id: 'f3', name: 'Ayam Bakar Madu', price: 30000, image: 'https://via.placeholder.com/150', category: 'food', description: 'Ayam bakar dengan olesan madu manis gurih.' },
    { id: 'f4', name: 'Sate Ayam', price: 28000, image: 'https://via.placeholder.com/150', category: 'food', description: 'Sate ayam 10 tusuk dengan bumbu kacang.' },
    { id: 'f5', name: 'Gado-Gado', price: 20000, image: 'https://via.placeholder.com/150', category: 'food', description: 'Sayuran segar dengan bumbu kacang.' },
];

const mockDrinks: Product[] = [
    { id: 'd1', name: 'Es Teh Manis', price: 5000, image: 'https://via.placeholder.com/150', category: 'drink', description: 'Teh manis dingin segar.' },
    { id: 'd2', name: 'Es Jeruk', price: 7000, image: 'https://via.placeholder.com/150', category: 'drink', description: 'Perasan jeruk asli.' },
    { id: 'd3', name: 'Kopi Tubruk', price: 8000, image: 'https://via.placeholder.com/150', category: 'drink', description: 'Kopi hitam panas tradisional.' },
    { id: 'd4', name: 'Jus Alpukat', price: 15000, image: 'https://via.placeholder.com/150', category: 'drink', description: 'Jus alpukat kental dengan susu coklat.' },
];

export const productService = {
    getFoods(): Promise<Product[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockFoods), 500); // Simulate network delay
        });
    },
    getDrinks(): Promise<Product[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockDrinks), 500);
        });
    },
    getAllProducts(): Promise<Product[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockFoods, ...mockDrinks]), 500);
        });
    }
};
