<template>
  <AppLayout :show-back-button="true">
    <div class="login-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="icon-wrapper">
          <div class="icon-glow"></div>
          <div class="icon-box">🔐</div>
        </div>
        <h1 class="login-title">Login Pegawai</h1>
        <p class="login-subtitle">Masuk ke dashboard manajemen restoran Anda</p>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <!-- Username Input -->
        <div class="input-group">
          <div class="input-wrapper">
            <input
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Nama pengguna"
              @keyup.enter="handleLogin"
            />
            <div class="input-border"></div>
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>

        <!-- Password Input -->
        <div class="input-group">
          <div class="input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Kata sandi"
              @keyup.enter="handleLogin"
            />
            <div class="input-border"></div>
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <!-- Eye Icon - Show Password -->
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <!-- Eye Off Icon - Hide Password -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="remember-section">
          <label class="checkbox-label">
            <input v-model="rememberMe" type="checkbox" />
            <span>Ingat saya</span>
          </label>
          <a href="#" class="forgot-password">Lupa kata sandi?</a>
        </div>

        <!-- Login Button -->
        <button
          class="login-button"
          :disabled="!username || !password"
          @click="handleLogin"
        >
          <span>Masuk</span>
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Demo Credentials Info -->
      <div class="demo-info">
        <p class="demo-title">Demo Credentials:</p>
        <p class="demo-text">Username: <strong>pegawai</strong></p>
        <p class="demo-text">Password: <strong>123456</strong></p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import {
  toastController,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";

const router = useRouter();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);

const handleLogin = async () => {
  // Simple mock authentication
  if (username.value === "pegawai" && password.value === "123456") {
    const toast = await toastController.create({
      message: "Login berhasil! Selamat datang.",
      duration: 2000,
      color: "success",
      position: "top",
    });
    await toast.present();

    router.push({
      path: "/employee-dashboard",
      query: { name: username.value },
    });
  } else {
    const toast = await toastController.create({
      message: "Username atau password tidak valid!",
      duration: 2000,
      color: "danger",
      position: "top",
    });
    await toast.present();
  }
};
</script>

<style scoped>
/* Login Container */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 80px 20px 40px;
  gap: 40px;
}

/* Header Section */
.header-section {
  text-align: center;
  animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
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

.icon-box {
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

.login-title {
  font-size: 34px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 12px 0;
  letter-spacing: -0.8px;
  line-height: 1.1;
}

.login-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Form Section */
.form-section {
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

/* Input Group */
.input-group {
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  padding: 16px 18px 14px 48px;
  font-size: 16px;
  color: #0f172a;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.05);
  font-family: inherit;
  outline: none;
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-input:focus {
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

.form-input:focus ~ .input-border {
  transform: scaleX(1);
}

/* Input Icons */
.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #6366f1;
  opacity: 0.6;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #6366f1;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  opacity: 1;
}

.toggle-password svg {
  width: 100%;
  height: 100%;
}

/* Remember Section */
.remember-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 0 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
}

.forgot-password {
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: #a78bfa;
  text-decoration: underline;
}

/* Login Button */
.login-button {
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
}

.button-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(99, 102, 241, 0.4);
}

.login-button:hover:not(:disabled) .button-icon {
  transform: translateX(4px);
}

.login-button:active:not(:disabled) {
  transform: translateY(-2px);
}

/* Demo Info */
.demo-info {
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 14px;
  padding: 16px 20px;
  text-align: center;
  max-width: 420px;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
}

.demo-title {
  font-size: 12px;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.demo-text {
  font-size: 13px;
  color: #0f172a;
  margin: 4px 0;
  font-weight: 500;
}

.demo-text strong {
  color: #0f172a;
  font-weight: 700;
}

/* Animations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(30px); }
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 70px 16px 30px;
  }

  .login-title {
    font-size: 28px;
  }

  .login-subtitle {
    font-size: 14px;
  }

  .form-input {
    padding: 14px 16px 12px 44px;
    font-size: 15px;
  }

  .login-button {
    padding: 14px 18px;
    font-size: 15px;
  }

  .icon-box {
    width: 90px;
    height: 90px;
    font-size: 44px;
  }

  .remember-section {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (min-width: 768px) {
  .login-container {
    padding: 110px 40px 50px;
  }

  .login-title {
    font-size: 40px;
  }

  .form-input {
    padding: 18px 20px 16px 52px;
    font-size: 17px;
  }

  .login-button {
    padding: 18px 24px;
    font-size: 17px;
  }

  .icon-box {
    width: 120px;
    height: 120px;
    font-size: 56px;
  }
}
</style>
