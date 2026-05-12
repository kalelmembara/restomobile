import axios from 'axios'

// ✅ Gunakan URL RELATIF agar Vite proxy aktif (tidak perlu CORS)
// Proxy di vite.config.ts: /api/* → http://localhost:3000/api/*
const API_BASE = '/api'

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
  discount?: number
}

// Sesuai response GET /api/menus/categories
export interface Category {
  id: number
  name: string          // ← backend mengembalikan 'name' (alias nama_kategori)
}

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export const menuService = {

  /** GET /health — cek apakah backend aktif */
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await axios.get('/health', { timeout: 3000 })
      return response.status === 200
    } catch {
      return false
    }
  },

  /** GET /api/menus — ambil semua menu dari db_resto.menu */
  getMenuItems: async (): Promise<MenuItem[]> => {
    try {
      console.log('📡 Fetching menus dari:', API_BASE + '/menus')
      const response = await api.get<MenuItem[]>('/menus')
      console.log('✅ Menu diterima:', response.data?.length ?? 0, 'item')
      return response.data || []
    } catch (error: any) {
      console.error('❌ Gagal ambil menu:', {
        status: error?.response?.status,
        message: error?.response?.data || error.message,
        url: API_BASE + '/menus'
      })
      throw error  // re-throw agar caller bisa handle error state
    }
  },

  /** GET /api/menus/categories — ambil daftar kategori */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>('/menus/categories')
      console.log('✅ Kategori diterima:', response.data?.length ?? 0, 'kategori')
      return response.data || []
    } catch (error: any) {
      console.error('❌ Gagal ambil kategori:', error?.response?.data || error.message)
      return []  // kategori tidak fatal, return kosong
    }
  },

  /** GET /api/menus/category/:id — filter menu berdasarkan kategori_id */
  getMenuByCategory: async (categoryId: number): Promise<MenuItem[]> => {
    try {
      const response = await api.get<MenuItem[]>(`/menus/category/${categoryId}`)
      return response.data || []
    } catch (error: any) {
      console.error('❌ Gagal ambil menu by kategori:', error?.response?.data || error.message)
      return []
    }
  }
}