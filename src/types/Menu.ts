// ==========================
//  TIPE DATA MENU & CATEGORY
// ==========================

// Tipe data untuk 1 item menu
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;

  // Optional
  originalPrice?: number; 
  icon?: string;
}

// Tipe data kategori (sesuai backend)
export interface Category {
  id: number;
  nama_kategori: string;
}

// Jika kamu ingin array, tinggal import interface di file lain:
// import type { MenuItem, Category } from '@/types/Menu';