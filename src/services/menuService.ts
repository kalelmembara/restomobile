import axios from 'axios'

// ✅ Ambil base URL dari .env.local (VITE_API_URL=http://localhost:3000/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ─── INTERFACES ───────────────────────────────────────────────────────────────

// Sesuai kolom yang dikembalikan backend dari tabel db_resto.menu
export interface MenuItem {
  id: string | number
  name: string          // ← nama_menu
  description: string   // ← deskripsi
  price: number         // ← harga
  image_url?: string    // ← image
  category: string      // ← nama_kategori dari JOIN
  category_id?: number
  stok?: number
  status?: string
  icon?: string
  originalPrice?: number
}

// Sesuai response GET /api/menus/categories
export interface Category {
  id: number
  name: string          // ← backend mengembalikan 'name' (alias nama_kategori)
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export const menuService = {

  /** GET /api/menus — ambil semua menu dari db_resto.menu */
  getMenuItems: async (): Promise<MenuItem[]> => {
    try {
      const response = await axios.get<MenuItem[]>(`${API_URL}/menus`)
      return response.data || []
    } catch (error: any) {
      console.error('❌ Gagal ambil menu:', error?.response?.data || error.message)
      return []
    }
  },

  /** GET /api/menus/categories — ambil daftar kategori */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await axios.get<Category[]>(`${API_URL}/menus/categories`)
      return response.data || []
    } catch (error: any) {
      console.error('❌ Gagal ambil kategori:', error?.response?.data || error.message)
      return []
    }
  },

  /** GET /api/menus/category/:id — filter menu berdasarkan kategori_id */
  getMenuByCategory: async (categoryId: number): Promise<MenuItem[]> => {
    try {
      const response = await axios.get<MenuItem[]>(`${API_URL}/menus/category/${categoryId}`)
      return response.data || []
    } catch (error: any) {
      console.error('❌ Gagal ambil menu by kategori:', error?.response?.data || error.message)
      return []
    }
  }
}