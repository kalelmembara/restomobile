<template>
  <div class="menu-form">
    <form @submit.prevent="submitForm" class="form">
      <!-- Nama Menu -->
      <div class="form-group">
        <label class="label">Nama Menu *</label>
        <input
          v-model="form.name"
          type="text"
          class="input"
          placeholder="Contoh: Nasi Goreng Spesial"
          required
        />
      </div>

      <!-- Kategori -->
      <div class="form-group">
        <label class="label">Kategori *</label>
        <div class="category-select-group">
          <select
            v-model="form.categoryId"
            class="input"
            required
          >
            <option value="">Pilih Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
          <button
            type="button"
            class="btn-add-category"
            @click="showAddCategoryForm = true"
          >
            + Kategori Baru
          </button>
        </div>
      </div>

      <!-- Harga -->
      <div class="form-group">
        <label class="label">Harga (Rp) *</label>
        <input
          v-model.number="form.price"
          type="number"
          class="input"
          placeholder="Contoh: 25000"
          min="0"
          required
        />
      </div>

      <!-- Deskripsi -->
      <div class="form-group">
        <label class="label">Deskripsi (Opsional)</label>
        <textarea
          v-model="form.description"
          class="input textarea"
          placeholder="Deskripsi menu..."
          rows="4"
        />
      </div>

      <!-- Image URL -->
      <div class="form-group">
        <label class="label">URL Gambar (Opsional)</label>
        <input
          v-model="form.imageUrl"
          type="url"
          class="input"
          placeholder="https://example.com/image.jpg"
        />
        <small v-if="form.imageUrl" class="image-preview-label">Preview:</small>
        <div v-if="form.imageUrl" class="image-preview">
          <img :src="form.imageUrl" :alt="form.name" />
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-submit" :disabled="isLoading">
        <ion-icon v-if="!isLoading" :icon="checkmarkOutline" />
        {{ isLoading ? "Menyimpan..." : "✓ Simpan Menu Baru" }}
      </button>
    </form>

    <!-- Add Category Form Modal -->
    <div v-if="showAddCategoryForm" class="modal-overlay" @click="showAddCategoryForm = false">
      <div class="modal-content" @click.stop>
        <h3>Tambah Kategori Baru</h3>
        <input
          v-model="newCategoryForm.name"
          type="text"
          class="input"
          placeholder="Nama kategori (misal: Paket Hemat)"
          @keyup.enter="submitNewCategory"
        />
        <input
          v-model="newCategoryForm.icon"
          type="text"
          class="input"
          placeholder="Icon (emoji, misal: 🎉)"
          maxlength="3"
        />
        <textarea
          v-model="newCategoryForm.description"
          class="input textarea"
          placeholder="Deskripsi (opsional)"
          rows="2"
        />
        <div class="modal-buttons">
          <button @click="showAddCategoryForm = false" class="btn-cancel">
            Batal
          </button>
          <button @click="submitNewCategory" class="btn-submit-modal" :disabled="isLoading">
            Tambah
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { checkmarkOutline } from "ionicons/icons";
import type { Category } from "@/services/menuManagementService";

interface Props {
  categories: Category[];
  isLoading: boolean;
}

interface Emits {
  (e: "submit", data: any): void;
  (e: "add-category", data: any): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  name: "",
  categoryId: "",
  price: null,
  description: "",
  imageUrl: "",
});

const showAddCategoryForm = ref(false);
const newCategoryForm = ref({
  name: "",
  icon: "📌",
  description: "",
});

function submitForm() {
  if (!form.value.name || !form.value.categoryId || form.value.price === null) {
    alert("Harap isi semua field yang wajib!");
    return;
  }

  emit("submit", {
    name: form.value.name,
    categoryId: parseInt(form.value.categoryId),
    price: form.value.price,
    description: form.value.description || null,
    imageUrl: form.value.imageUrl || null,
  });

  // Reset form
  form.value = {
    name: "",
    categoryId: "",
    price: null,
    description: "",
    imageUrl: "",
  };
}

function submitNewCategory() {
  if (!newCategoryForm.value.name.trim()) {
    alert("Nama kategori harus diisi!");
    return;
  }

  emit("add-category", {
    name: newCategoryForm.value.name,
    icon: newCategoryForm.value.icon,
    description: newCategoryForm.value.description,
  });

  newCategoryForm.value = {
    name: "",
    icon: "📌",
    description: "",
  };
  showAddCategoryForm.value = false;
}
</script>

<style scoped>
.menu-form {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
}

.input:focus {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.category-select-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.category-select-group select {
  flex: 1;
}

.btn-add-category {
  padding: var(--spacing-md);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-add-category:hover {
  background: var(--surface-color);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.image-preview-label {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: var(--spacing-sm);
}

.image-preview {
  margin-top: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-width: 200px;
  border: 1px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: var(--spacing-md);
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
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
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.modal-content h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.modal-content .input {
  width: 100%;
  margin-bottom: var(--spacing-md);
}

.modal-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn-cancel {
  flex: 1;
  padding: var(--spacing-md);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--surface-color);
  border-color: var(--text-secondary);
}

.btn-submit-modal {
  flex: 1;
  padding: var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.btn-submit-modal:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-submit-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .menu-form {
    padding: var(--spacing-md);
  }

  .modal-content {
    padding: var(--spacing-lg);
  }
}
</style>
