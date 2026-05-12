<template>
  <AppLayout :show-back-button="true">
    <div class="menu-page">
      <div class="menu-page-wrapper">
        <!-- Header -->
        <div class="header">
          <h1>Manajemen Menu</h1>
          <p>Kelola menu makanan dan minuman di restoran Anda</p>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            <ion-icon :icon="tab.icon" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- TAB 1: Tambah Menu -->
        <div v-if="activeTab === 'add-menu'" class="tab-panel">
          <MenuFormComponent
            @submit="handleAddMenu"
            :categories="categoriesFromComposableAsArray"
            :is-loading="isLoading"
            @add-category="handleAddCategory"
          />
        </div>

        <!-- TAB 2: Daftar Menu -->
        <div v-if="activeTab === 'menu-list'" class="tab-panel">
          <div class="list-header">
            <h2>Daftar Menu</h2>
            <div class="filter-wrapper">
              <select v-model="filterCategory" class="filter-select">
                <option value="">Semua Kategori</option>
                <option v-for="cat in categoriesFromComposableAsArray" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
          </div>
          <MenuListComponent
            :menus="filteredMenus"
            :is-loading="isLoading"
            @edit="handleEditMenu"
            @delete="handleDeleteMenu"
          />
        </div>

        <!-- TAB 3: Kelola Kategori -->
        <div v-if="activeTab === 'categories'" class="tab-panel">
          <div class="list-header">
            <h2>Kelola Kategori</h2>
          </div>
          <CategoryManagementComponent
            :categories="categoriesFromComposableAsArray"
            :is-loading="isLoading"
            @add="handleAddCategory"
          />
        </div>

        <!-- Edit Modal -->
        <MenuEditModal
          v-if="showEditModal"
          :menu="selectedMenu"
          :categories="categoriesFromComposableAsArray"
          :is-loading="isLoading"
          @save="handleUpdateMenu"
          @close="showEditModal = false"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  restaurantOutline,
  addOutline,
  createOutline,
  pricetagsOutline,
} from "ionicons/icons";
import { toastController } from "@ionic/vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MenuFormComponent from "./components/MenuFormComponent.vue";
import MenuListComponent from "./components/MenuListComponent.vue";
import MenuEditModal from "./components/MenuEditModal.vue";
import CategoryManagementComponent from "./components/CategoryManagementComponent.vue";
import { menuManagementService, type Menu } from "@/services/menuManagementService";
import type { Category } from "@/services/menuManagementService";
import { clearMenuCache } from "@/composables/useMenuData";

const activeTab = ref("add-menu");
const filterCategory = ref("");
const isLoading = ref(false);
const showEditModal = ref(false);
const selectedMenu = ref<Menu | null>(null);

// Fetch langsung dari service (endpoint sama dengan Visitor) agar data pasti masuk ke ref lokal
const localMenus = ref<Menu[]>([]);
const localCategories = ref<Category[]>([]);

const tabs = [
  { value: "add-menu", label: "Tambah Menu", icon: addOutline },
  { value: "menu-list", label: "Daftar Menu", icon: createOutline },
  { value: "categories", label: "Kategori", icon: pricetagsOutline },
];

const filteredMenus = computed((): Menu[] => {
  const list = localMenus.value ?? [];
  if (!filterCategory.value) return [...list];
  const categoryId = Number(filterCategory.value);
  if (Number.isNaN(categoryId)) return [...list];
  return list.filter((m) => Number(m.category_id) === categoryId);
});

const categoriesFromComposableAsArray = computed(() => [...localCategories.value]);

onMounted(async () => {
  await loadData();
});

async function loadData(_forceRefresh = false) {
  isLoading.value = true;
  try {
    // Panggil API sama persis seperti VisitorMenuPage (menuManagementService.getMenus + getCategories)
    const [menusData, categoriesData] = await Promise.all([
      menuManagementService.getMenus(),
      menuManagementService.getCategories(),
    ]);
    localMenus.value = Array.isArray(menusData) ? [...menusData] : [];
    localCategories.value = Array.isArray(categoriesData) ? [...categoriesData] : [];
  } catch (error) {
    console.error("❌ [ManajemenMenuPage] Error loading data:", error);
    showToast("Gagal memuat data", "danger");
    localMenus.value = [];
    localCategories.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function handleAddMenu(formData: any) {
  isLoading.value = true;
  try {
    await menuManagementService.createMenu(
      formData.name,
      formData.categoryId,
      formData.price,
      formData.description
    );
    showToast("✅ Menu berhasil ditambahkan!", "success");
    clearMenuCache();
    await loadData(true);
    activeTab.value = "menu-list";
  } catch (error: any) {
    showToast(error.message || "Gagal menambahkan menu", "danger");
  } finally {
    isLoading.value = false;
  }
}

async function handleEditMenu(menu: Menu) {
  selectedMenu.value = menu;
  showEditModal.value = true;
}

async function handleUpdateMenu(formData: any) {
  if (!selectedMenu.value) return;
  
  isLoading.value = true;
  try {
    await menuManagementService.updateMenu(
      selectedMenu.value.id,
      formData.name,
      formData.categoryId,
      formData.price,
      formData.description
    );
    showToast("✅ Menu berhasil diperbarui!", "success");
    showEditModal.value = false;
    clearMenuCache();
    await loadData(true);
  } catch (error: any) {
    showToast(error.message || "Gagal memperbarui menu", "danger");
  } finally {
    isLoading.value = false;
  }
}

async function handleDeleteMenu(menuId: number) {
  const confirm = await showConfirm("Hapus menu ini?", "Data akan dihapus permanen.");
  if (!confirm) return;

  isLoading.value = true;
  try {
    await menuManagementService.deleteMenu(menuId);
    showToast("✅ Menu berhasil dihapus!", "success");
    clearMenuCache();
    await loadData(true);
  } catch (error: any) {
    showToast(error.message || "Gagal menghapus menu", "danger");
  } finally {
    isLoading.value = false;
  }
}

async function handleAddCategory(categoryData?: any) {
  isLoading.value = true;
  try {
    await loadData(true);
    showToast("✅ Kategori berhasil ditambahkan!", "success");
  } catch (error: any) {
    console.error("❌ [ManajemenMenuPage] Error loading categories:", error);
    showToast(error.message || "Gagal menambahkan kategori", "danger");
  } finally {
    isLoading.value = false;
  }
}

async function showToast(message: string, color: string) {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: "top",
    color,
  });
  await toast.present();
}

async function showConfirm(header: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Using window.confirm for simplicity
    // In production, use ion-alert instead
    resolve(window.confirm(`${header}\n\n${message}`));
  });
}
</script>

<style scoped>
.menu-page {
  padding: 0 var(--spacing-md) var(--spacing-xl);
}

.menu-page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.header {
  margin-bottom: var(--spacing-lg);
  animation: slideDown 0.6s ease-out;
}

.header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.header p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Tabs Container */
.tabs-container {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  background: var(--surface-color);
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
  animation: slideDown 0.6s ease-out 0.1s both;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-sm);
}

/* Tab Panel */
.tab-panel {
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* List Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.list-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* Filter Wrapper */
.filter-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-select {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: var(--font-family);
  min-width: 180px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.05);
}

.filter-select:hover {
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
}

.filter-select:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .menu-page {
    padding: 0 var(--spacing-md) var(--spacing-lg);
  }

  .header h1 {
    font-size: var(--font-size-xl);
  }

  .tabs-container {
    gap: var(--spacing-xs);
  }

  .tab-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .tab-btn span {
    display: none;
  }

  .tab-btn ion-icon {
    font-size: 18px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-select {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  .menu-page {
    padding: 0 var(--spacing-sm) var(--spacing-lg);
  }

  .header h1 {
    font-size: var(--font-size-lg);
  }

  .header p {
    font-size: 12px;
  }

  .tabs-container {
    padding: var(--spacing-xs);
  }

  .tab-btn {
    padding: 6px 10px;
  }
}
</style>
