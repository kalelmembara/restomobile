<template>
  <div class="categories-container">
    <!-- Add Category Form -->
    <div class="add-category-section">
      <h3>Tambah Kategori Baru</h3>
      <form @submit.prevent="submitNewCategory" class="category-form">
        <input
          v-model="newCategory.name"
          type="text"
          class="input"
          placeholder="Nama Kategori"
          required
        />
        <input
          v-model="newCategory.description"
          type="text"
          class="input"
          placeholder="Deskripsi"
        />
        <button
          type="submit"
          class="btn-add"
          :disabled="isLoading"
        >
          {{ isLoading ? "Menambahkan..." : "Tambah Kategori" }}
        </button>
      </form>
    </div>

    <!-- Categories List -->
    <div class="categories-list-section">
      <h3>Daftar Kategori</h3>
      <div v-if="isLoadingCategories" class="loading">
        <ion-spinner />
        <p>Memuat kategori...</p>
      </div>
      <div v-else-if="categories.length === 0" class="empty-state">
        <span style="font-size: 48px">📭</span>
        <p>Tidak ada kategori</p>
      </div>
      <div v-else class="categories-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card">
          <div class="category-info">
            <h4>{{ cat.name }}</h4>
            <p v-if="cat.description">{{ cat.description }}</p>
          </div>
          <button
            class="btn-delete"
            @click="deleteCategory(cat.id)"
            :disabled="isLoading"
            title="Hapus kategori"
          >
            <ion-icon :icon="trashOutline" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IonSpinner, IonIcon, toastController } from "@ionic/vue";
import { trashOutline } from "ionicons/icons";
import { menuManagementService } from "@/services/menuManagementService";
import type { Category } from "@/services/menuManagementService";

interface Props {
  categories: Category[];
  isLoading: boolean;
}

interface Emits {
  (e: "add"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const newCategory = ref({
  name: "",
  description: "",
});

const isLoadingCategories = ref(false);

async function submitNewCategory() {
  if (!newCategory.value.name.trim()) {
    const toast = await toastController.create({
      message: "Nama kategori tidak boleh kosong",
      duration: 2000,
      color: "warning",
    });
    toast.present();
    return;
  }

  try {
    isLoadingCategories.value = true;
    await menuManagementService.addCategory(
      newCategory.value.name.trim(),
      newCategory.value.description.trim() || undefined
    );

    const toast = await toastController.create({
      message: "✅ Kategori berhasil ditambahkan!",
      duration: 2000,
      color: "success",
    });
    toast.present();

    newCategory.value = {
      name: "",
      description: "",
    };

    emit("add");
  } catch (error: any) {
    console.error("❌ Error adding category:", error);
    const toast = await toastController.create({
      message: error.message || "Gagal menambahkan kategori",
      duration: 2000,
      color: "danger",
    });
    toast.present();
  } finally {
    isLoadingCategories.value = false;
  }
}

async function deleteCategory(categoryId: number) {
  const confirmed = confirm(
    "Apakah Anda yakin ingin menghapus kategori ini?\n\nMenu yang termasuk dalam kategori ini juga akan dihapus."
  );

  if (!confirmed) return;

  try {
    isLoadingCategories.value = true;
    await menuManagementService.deleteCategory(categoryId);

    const toast = await toastController.create({
      message: "✅ Kategori berhasil dihapus!",
      duration: 2000,
      color: "success",
    });
    toast.present();

    emit("add");
  } catch (error: any) {
    console.error("❌ Error deleting category:", error);
    const toast = await toastController.create({
      message: error.message || "Gagal menghapus kategori",
      duration: 2000,
      color: "danger",
    });
    toast.present();
  } finally {
    isLoadingCategories.value = false;
  }
}
</script>

<style scoped>
.categories-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-lg);
  min-height: 400px;
}

h3 {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Add Category Section */
.add-category-section {
  background: var(--surface-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.input {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  padding: 12px 16px;
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.05);
  outline: none;
}

.input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.input:hover {
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
}

.input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
}

.btn-add {
  padding: var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
}

.btn-add:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}



/* Categories List Section */
.categories-list-section {
  background: var(--surface-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-state p {
  margin: 0;
  color: var(--text-primary);
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.category-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.category-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}



.category-info {
  flex: 1;
  min-width: 0;
}

.category-info h4 {
  margin: 0 0 4px 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.category-info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-delete {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
  color: var(--danger-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 18px;
  flex-shrink: 0;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .categories-container {
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
  }

  h3 {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .categories-container {
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .add-category-section,
  .categories-list-section {
    padding: var(--spacing-md);
  }

  .btn-add {
    padding: 10px var(--spacing-md);
  }
}
</style>
