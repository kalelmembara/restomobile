<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Edit Menu</h2>
        <button class="btn-close" @click="$emit('close')">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>

      <form @submit.prevent="submitForm" class="form">
        <!-- Nama Menu -->
        <div class="form-group">
          <label class="label">Nama Menu *</label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            required
          />
        </div>

        <!-- Kategori -->
        <div class="form-group">
          <label class="label">Kategori *</label>
          <select
            v-model.number="form.categoryId"
            class="input"
            required
          >
            <option value="">Pilih Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Harga -->
        <div class="form-group">
          <label class="label">Harga (Rp) *</label>
          <input
            v-model.number="form.price"
            type="number"
            class="input"
            min="0"
            required
          />
        </div>

        <!-- Deskripsi -->
        <div class="form-group">
          <label class="label">Deskripsi</label>
          <textarea
            v-model="form.description"
            class="input textarea"
            rows="4"
          />
        </div>



        <!-- Buttons -->
        <div class="modal-buttons">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Batal
          </button>
          <button type="submit" class="btn-save" :disabled="isLoading">
            {{ isLoading ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { closeOutline } from "ionicons/icons";
import type { Menu, Category } from "@/services/menuManagementService";

interface Props {
  menu: Menu | null;
  categories: Category[];
  isLoading: boolean;
}

interface Emits {
  (e: "save", data: any): void;
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  name: "",
  categoryId: 0,
  price: 0,
  description: "",
});

watch(
  () => props.menu,
  (newMenu) => {
    if (newMenu) {
      form.value = {
        name: newMenu.name,
        categoryId: newMenu.category_id,
        price: newMenu.price,
        description: newMenu.description || "",
      };
    }
  },
  { immediate: true }
);

function submitForm() {
  emit("save", form.value);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: var(--text-secondary);
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.btn-close:hover {
  color: var(--primary-color);
}

.form {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
}

.label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.input {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  padding: 12px 16px;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.05);
  font-family: var(--font-family);
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

.textarea {
  resize: vertical;
  font-family: var(--font-family);
}



.modal-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-cancel {
  background: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background: var(--border-color);
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
}
</style>
