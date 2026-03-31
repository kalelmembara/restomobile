/**
 * Menu Management Service
 * API calls untuk dashboard pegawai - menu management
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Menu {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  price: number;
  description?: string;
  image_url?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number
  name: string
}

export const menuManagementService = {
  // ========== CATEGORIES ==========

  async getCategories(): Promise<Category[]> {
    try {
      console.log('📡 Fetching categories...');
      const response = await fetch(`${API_URL}/menus/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Categories loaded:', data);
      return Array.isArray(data) ? data : (data?.data ?? data?.categories ?? []);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  },

  async addCategory(name: string, description?: string, icon?: string): Promise<Category> {
    try {
      console.log(`📝 Adding category: ${name}`);
      
      const response = await fetch(`${API_URL}/menus/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description: description || null, 
          icon: icon || '📌' 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Category added:', data);
      return data;
    } catch (error) {
      console.error('❌ Error adding category:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId: number): Promise<any> {
    try {
      console.log(`🗑️  Deleting category ${categoryId}...`);
      
      const response = await fetch(`${API_URL}/menus/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Category deleted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  },

  // ========== MENUS ==========

  async getMenus(): Promise<Menu[]> {
    try {
      console.log('📡 Fetching menus...');
      const response = await fetch(`${API_URL}/menus`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Menus loaded:', data);
      return Array.isArray(data) ? data : (data?.data ?? data?.menus ?? []);
    } catch (error) {
      console.error('❌ Error fetching menus:', error);
      return [];
    }
  },

  async getMenusByCategory(categoryId: number): Promise<Menu[]> {
    try {
      console.log(`📡 Fetching menus for category ${categoryId}...`);
      const response = await fetch(`${API_URL}/menus/category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Category menus loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching menus by category:', error);
      return [];
    }
  },

  async createMenu(
    name: string,
    categoryId: number,
    price: number,
    description?: string,
    imageUrl?: string
  ): Promise<Menu> {
    try {
      console.log(`📝 Creating menu: ${name}`);
      
      const response = await fetch(`${API_URL}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          price: parseFloat(price.toString()),
          description: description || null,
          imageUrl: imageUrl || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Menu created:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating menu:', error);
      throw error;
    }
  },

  async updateMenu(
    id: number,
    name: string,
    categoryId: number,
    price: number,
    description?: string,
    imageUrl?: string
  ): Promise<any> {
    try {
      console.log(`📝 Updating menu ${id}: ${name}`);
      
      const response = await fetch(`${API_URL}/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          price: parseFloat(price.toString()),
          description: description || null,
          imageUrl: imageUrl || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Menu updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating menu:', error);
      throw error;
    }
  },

  async deleteMenu(id: number): Promise<any> {
    try {
      console.log(`🗑️  Deleting menu ${id}...`);
      
      const response = await fetch(`${API_URL}/menus/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Menu deleted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting menu:', error);
      throw error;
    }
  }
};
