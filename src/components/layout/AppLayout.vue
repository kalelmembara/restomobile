<template>
  <ion-page>
    <ion-content :fullscreen="true" class="app-layout">
      <!-- Shared Background -->
      <div class="bg-gradient"></div>
      
      <!-- Shared Floating Blobs -->
      <FloatingBlobs :show-third="showThirdBlob" />

      <!-- Optional Back Button -->
      <button v-if="showBackButton" class="back-btn" @click="handleBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span v-if="backButtonText">{{ backButtonText }}</span>
      </button>

      <!-- Page Content Slot -->
      <div class="content-container" :class="{ 'with-back-btn': showBackButton }">
        <slot></slot>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import FloatingBlobs from './FloatingBlobs.vue';

const router = useRouter();

const props = defineProps({
  showBackButton: {
    type: Boolean,
    default: false
  },
  backButtonText: {
    type: String,
    default: ''
  },
  showThirdBlob: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['back']);

const handleBack = () => {
  if (props.showBackButton) {
    emit('back'); // Allow parent to handle back
    router.back();
  }
};
</script>

<style scoped>
.app-layout {
  --background: var(--bg-color);
  background: var(--bg-color);
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.05) 0%, transparent 40%);
  z-index: -1;
  pointer-events: none;
}

.back-btn {
  position: fixed;
  top: var(--spacing-md);
  left: var(--spacing-md);
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  padding: 8px 16px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.back-btn:hover {
  background: white;
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateX(-2px);
  box-shadow: var(--shadow-md);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.content-container {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-bottom: var(--spacing-xl);
}

.content-container.with-back-btn {
  padding-top: 70px; /* Space for fixed back button */
}
</style>
