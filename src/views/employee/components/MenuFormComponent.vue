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



      <!-- Submit Button -->
      <button type="submit" class="btn-submit" :disabled="isLoading">
        <ion-icon v-if="!isLoading" :icon="checkmarkOutline" />
        {{ isLoading ? "Menyimpan..." : "✓ Simpan Menu Baru" }}
      </button>
    </form>

    <!-- Add Category Form Modal -->
    <div v-if="showAddCategoryForm" class="modal-overlay" @click="showAddCategoryForm = false">
      <div class="modal-content" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <h3>Tambah Kategori Baru</h3>
          <button class="modal-close" @click="showAddCategoryForm = false" type="button">✕</button>
        </div>
        <!-- Modal Body -->
        <div class="modal-body">
          <input
            v-model="newCategoryForm.name"
            type="text"
            class="input"
            placeholder="Nama kategori"
            @keyup.enter="submitNewCategory"
          />
          <textarea
            v-model="newCategoryForm.description"
            class="input textarea"
            placeholder="Deskripsi (opsional)"
            rows="2"
          />
        </div>
        <!-- Modal Footer -->
        <div class="modal-buttons">
          <button type="button" @click="showAddCategoryForm = false" class="btn-cancel">
            Batal
          </button>
          <button type="button" @click="submitNewCategory" class="btn-submit-modal" :disabled="isLoading">
            {{ isLoading ? "Menambahkan..." : "Tambah" }}
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
});

const showAddCategoryForm = ref(false);
const newCategoryForm = ref({
  name: "",
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
  });

  // Reset form
  form.value = {
    name: "",
    categoryId: "",
    price: null,
    description: "",
  };
}

function submitNewCategory() {
  if (!newCategoryForm.value.name.trim()) {
    alert("Nama kategori harus diisi!");
    return;
  }

  emit("add-category", {
    name: newCategoryForm.value.name,
    description: newCategoryForm.value.description,
  });

  newCategoryForm.value = {
    name: "",
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
/* ── MODAL OVERLAY ────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── MODAL CONTENT ────────────────────────────────────── */
.modal-content {
  background: #ffffff;
  border-radius: 20px;
  max-width: 420px;
  width: 100%;
  box-shadow:
    0 25px 60px rgba(15, 23, 42, 0.20),
    0 8px 24px rgba(99, 102, 241, 0.10);
  overflow: hidden;
  animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

/* ── MODAL HEADER ─────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ── MODAL BODY ───────────────────────────────────────── */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 24px;
}

/* Override: input di dalam modal tidak pakai margin-bottom */
.modal-body .input {
  margin-bottom: 0;
}

/* ── MODAL BUTTONS ────────────────────────────────────── */
.modal-buttons {
  display: flex;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f1f5f9;
}

/* ─ Tombol Batal ─ */
.btn-cancel {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  background: #f1f5f9;
  color: #334155;                      /* ← teks slate-700, selalu terlihat */
  border: 1.5px solid #cbd5e1;         /* ← border slate-300 */
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.btn-cancel:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
  color: #1e293b;
  transform: translateY(-1px);
}

.btn-cancel:active {
  background: #cbd5e1;
  transform: scale(0.97);
}

/* ─ Tombol Tambah ─ */
.btn-submit-modal {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.18s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  white-space: nowrap;
}

.btn-submit-modal:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.btn-submit-modal:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.30);
}

.btn-submit-modal:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 768px) {
  .menu-form {
    padding: var(--spacing-md);
  }

  .modal-content {
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .modal-buttons {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit-modal {
    flex: unset;
    width: 100%;
  }
}
</style>
