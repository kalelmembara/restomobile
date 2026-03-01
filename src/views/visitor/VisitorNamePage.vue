<template>
  <AppLayout :show-back-button="true">
    <div class="onboarding-container">
      <!-- Premium Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 33%"></div>
        </div>
        <div class="progress-text">
          <span class="progress-step">Langkah 1</span>
          <span class="progress-label">dari 3</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper">
        <!-- Step Header -->
        <div class="step-header">
          <h1 class="welcome-title">Siapa nama Anda?</h1>
          <p class="welcome-subtitle">Kami ingin tahu nama Anda agar pengalaman Anda lebih personal dan menyenangkan</p>
        </div>

        <!-- Icon Section -->
        <div class="icon-section">
          <div class="icon-container">
            <div class="icon-glow"></div>
            <div class="icon-blob">👤</div>
          </div>
        </div>

        <!-- Input Section - Modern Design -->
        <div class="input-section">
          <div class="input-container">
            <input
              v-model="nameInput"
              type="text"
              class="modern-input"
              placeholder="Masukkan nama lengkap Anda"
              @keyup.enter="goToMenu"
              maxlength="50"
            />
            <div class="input-border"></div>
            <div class="input-label">Nama Lengkap</div>
          </div>
          <div class="char-count">{{ nameInput.length }}/50</div>
        </div>

        <!-- Action Button - Modern Premium -->
        <button
          class="action-button"
          :disabled="!nameInput || nameInput.length < 2"
          @click="goToMenu"
        >
          <span class="button-text">Lanjutkan ke Menu</span>
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Hint Text -->
        <p class="hint-text">Tekan Enter atau tap tombol untuk melanjutkan</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useVisitorStore } from "@/stores/visitor";
import AppLayout from "@/components/layout/AppLayout.vue";

const router = useRouter();
const visitorStore = useVisitorStore();
const nameInput = ref("");

const goToMenu = () => {
  if (nameInput.value.trim()) {
    visitorStore.setVisitorName(nameInput.value.trim());
    router.push("/visitor-menu");
  }
};
</script>

<style scoped>
/* Progress Container */
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(99, 102, 241, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.progress-step {
  font-size: 11px;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.progress-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

/* Onboarding Container */
.onboarding-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px 40px;
  gap: 30px;
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Step Header */
.step-header {
  text-align: center;
  animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.welcome-title {
  font-size: 34px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 12px 0;
  letter-spacing: -0.8px;
  line-height: 1.1;
}

.welcome-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Icon Section */
.icon-section {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.icon-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.icon-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  filter: blur(25px);
  opacity: 0.3;
  animation: pulse 3s ease-in-out infinite;
}

.icon-blob {
  position: relative;
  z-index: 1;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.95));
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  box-shadow: 0 20px 50px rgba(99, 102, 241, 0.12);
  border: 2px solid rgba(99, 102, 241, 0.15);
  animation: float 4s ease-in-out infinite;
}

/* Input Section */
.input-section {
  width: 100%;
  position: relative;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.input-container {
  position: relative;
  width: 100%;
}

.modern-input {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  padding: 16px 18px 14px 18px;
  font-size: 16px;
  color: #0f172a;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.05);
  font-family: inherit;
  outline: none;
}

.modern-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.modern-input:focus {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modern-input:focus ~ .input-border {
  transform: scaleX(1);
}

.input-label {
  position: absolute;
  top: 12px;
  left: 18px;
  font-size: 11px;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-input:focus ~ .input-label {
  opacity: 1;
}

.char-count {
  position: absolute;
  bottom: 12px;
  right: 18px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Action Button */
.action-button {
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 32px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: -0.3px;
  font-family: inherit;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

.button-text {
  flex: 1;
}

.button-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(99, 102, 241, 0.4);
}

.action-button:hover:not(:disabled) .button-icon {
  transform: translateX(4px);
}

.action-button:active:not(:disabled) {
  transform: translateY(-2px);
}

/* Hint Text */
.hint-text {
  font-size: 12px;
  color: #94a3b8;
  margin: 12px 0 0 0;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  animation: fadeIn 1s ease-out 0.6s both;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(30px);
  }
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .onboarding-container {
    padding: 80px 16px 30px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .modern-input {
    padding: 14px 16px 12px 16px;
    font-size: 15px;
  }

  .action-button {
    padding: 14px 18px;
    font-size: 15px;
  }

  .icon-blob {
    width: 90px;
    height: 90px;
    font-size: 44px;
  }
}

@media (min-width: 768px) {
  .onboarding-container {
    padding: 110px 40px 50px;
  }

  .welcome-title {
    font-size: 40px;
  }

  .content-wrapper {
    max-width: 500px;
  }

  .modern-input {
    padding: 18px 20px 16px 20px;
    font-size: 17px;
  }

  .action-button {
    padding: 18px 24px;
    font-size: 17px;
  }

  .icon-blob {
    width: 120px;
    height: 120px;
    font-size: 56px;
  }
}
</style>
