/**
 * Composable untuk mengelola data menu bersama
 * Digunakan oleh VisitorMenuPage dan ManajemenMenuPage
 */

import { ref, readonly } from 'vue';
import { menuManagementService, type Menu, type Category } from '@/services/menuManagementService';

// Shared state
const categories = ref<Category[]>([]);
const menus = ref<Menu[]>([]);
const isLoading = ref(false);
const lastFetchTime = ref<number>(0);
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Load menu data from API
 * Uses cache if data was fetched within CACHE_DURATION
 */
export async function loadMenuData(forceRefresh = false) {
  const now = Date.now();
  const isCacheValid = !forceRefresh && (now - lastFetchTime.value) < CACHE_DURATION;
  
  if (isCacheValid && menus.value.length > 0) {
    console.log('💾 [useMenuData] Using cached menu data');
    return { categories: categories.value, menus: menus.value };
  }
  
  isLoading.value = true;
  try {
    console.log('📡 [useMenuData] Fetching fresh menu data...');
    const [catsData, menusData] = await Promise.all([
      menuManagementService.getCategories(),
      menuManagementService.getMenus(),
    ]);
    
    categories.value = catsData;
    menus.value = menusData;
    lastFetchTime.value = Date.now();
    
    console.log('✅ [useMenuData] Menu data loaded:', {
      categories: catsData.length,
      menus: menusData.length,
      timestamp: new Date().toISOString()
    });
    
    return { categories: catsData, menus: menusData };
  } catch (error) {
    console.error('❌ [useMenuData] Error loading menu data:', error);
    throw error;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Get menu data (readonly to prevent accidental mutations)
 */
export function useMenuData() {
  return {
    categories: readonly(categories),
    menus: readonly(menus),
    isLoading: readonly(isLoading),
    loadMenuData,
    // Expose internal refs for reactive updates (used by admin page)
    _categories: categories,
    _menus: menus,
    _isLoading: isLoading,
  };
}

/**
 * Clear cached menu data (useful for testing or when data changes)
 */
export function clearMenuCache() {
  console.log('🗑️  [useMenuData] Clearing menu cache');
  categories.value = [];
  menus.value = [];
  lastFetchTime.value = 0;
}

/**
 * Manually update menus (for when admin adds/edits menu)
 */
export function updateMenus(newMenus: Menu[]) {
  console.log('📝 [useMenuData] Updating menus:', newMenus.length);
  menus.value = newMenus;
  lastFetchTime.value = Date.now();
}

/**
 * Manually update categories
 */
export function updateCategories(newCategories: Category[]) {
  console.log('📝 [useMenuData] Updating categories:', newCategories.length);
  categories.value = newCategories;
  lastFetchTime.value = Date.now();
}
