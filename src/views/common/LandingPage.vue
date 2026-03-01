<template>
  <AppLayout :show-third-blob="true">
    <div class="landing-container">
      <!-- Hero Section with Immersive Animation -->
      <div class="hero-section">
        <div class="logo-container">
          <div class="logo-wrapper">
            <div class="logo-glow"></div>
            <div class="logo-circle">🍽️</div>
          </div>
        </div>
        
        <div class="hero-content">
          <h1 class="title-main">RestoApp</h1>
          <p class="subtitle-main">Pengalaman Kuliner Tak Terlupakan</p>
          <div class="hero-accent"></div>
        </div>
      </div>

      <!-- Role Selection Section - Modern Card Design -->
      <div class="role-section">
        <div class="section-header">
          <h2 class="section-title">Mulai Perjalananmu</h2>
          <p class="section-subtitle">Pilih peran dan nikmati pengalaman terbaik</p>
        </div>
        
        <div class="role-cards">
          <!-- Visitor Card - Modern Glass Design -->
          <div 
            class="role-card visitor-card"
            @click="handleNavigate('/visitor-name')"
            @mouseenter="hoveredCard = 'visitor'"
            @mouseleave="hoveredCard = null"
          >
            <div class="card-background"></div>
            <div class="card-content-wrapper">
              <div class="card-icon-box">
                <div class="icon-gradient visitor-gradient"></div>
                <ion-icon :icon="personOutline" class="card-icon"></ion-icon>
              </div>
              <div class="card-text">
                <h3 class="card-title">Pengunjung</h3>
                <p class="card-description">Jelajahi menu premium dan pesan makanan favorit Anda dengan mudah</p>
              </div>
              <div class="card-action">
                <span class="action-text">Lanjutkan</span>
                <svg class="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Employee Card - Modern Glass Design -->
          <div 
            class="role-card employee-card"
            @click="handleNavigate('/employee-login')"
            @mouseenter="hoveredCard = 'employee'"
            @mouseleave="hoveredCard = null"
          >
            <div class="card-background"></div>
            <div class="card-content-wrapper">
              <div class="card-icon-box">
                <div class="icon-gradient employee-gradient"></div>
                <ion-icon :icon="briefcaseOutline" class="card-icon"></ion-icon>
              </div>
              <div class="card-text">
                <h3 class="card-title">Pegawai</h3>
                <p class="card-description">Kelola pesanan dan operasional restoran dengan dashboard intuitif</p>
              </div>
              <div class="card-action">
                <span class="action-text">Lanjutkan</span>
                <svg class="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Section -->
      <div class="footer-section">
        <div class="scroll-indicator">
          <span class="scroll-dot"></span>
          <span class="scroll-text">Scroll untuk melihat lebih banyak</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { personOutline, briefcaseOutline } from "ionicons/icons";
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";

const router = useRouter();
const hoveredCard = ref<string | null>(null);

const handleNavigate = (path: string) => {
  router.push(path);
};
</script>

<style scoped>
/* Landing Container */
.landing-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  padding: 60px 20px 30px;
  text-align: center;
  gap: 40px;
}

/* Hero Section - Premium */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  margin-top: 20px;
  animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.logo-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  filter: blur(20px);
  opacity: 0.4;
  animation: pulse 3s ease-in-out infinite;
}

.logo-circle {
  position: relative;
  z-index: 1;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, var(--bg-color) 100%);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  box-shadow: 0 20px 50px rgba(99, 102, 241, 0.15);
  border: 2px solid rgba(99, 102, 241, 0.1);
  animation: float 4s ease-in-out infinite;
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 1;
}

.title-main {
  font-size: 48px;
  font-weight: 900;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  line-height: 1.1;
}

.subtitle-main {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.hero-accent {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
  margin: 16px auto 0;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

/* Role Section */
.role-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 32px;
  margin: 20px 0;
}

.section-header {
  text-align: center;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Role Cards Container */
.role-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 380px;
  animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

/* Role Card - Modern Glass Design */
.role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.95));
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
  padding: 24px;
  min-height: 140px;
}

.card-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.role-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(99, 102, 241, 0.2);
}

.role-card:hover .card-background {
  opacity: 1;
}

.card-content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card Icon Box */
.card-icon-box {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.icon-gradient {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  opacity: 0.1;
}

.visitor-gradient {
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
}

.employee-gradient {
  background: linear-gradient(135deg, var(--secondary-color), var(--warning-color));
}

.card-icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.95));
  color: var(--primary-color);
  transition: all 0.4s ease;
}

.visitor-card .card-icon {
  color: var(--primary-color);
  border: 2px solid rgba(99, 102, 241, 0.2);
}

.employee-card .card-icon {
  color: var(--secondary-color);
  border: 2px solid rgba(236, 72, 153, 0.2);
}

.role-card:hover .card-icon {
  transform: scale(1.1) rotateZ(5deg);
}

/* Card Text */
.card-text {
  text-align: center;
}

.card-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.card-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

/* Card Action */
.card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  color: var(--primary-color);
  transition: all 0.3s ease;
  margin-top: 4px;
}

.action-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.action-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.role-card:hover .action-arrow {
  transform: translateX(6px);
}

/* Footer Section */
.footer-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  animation: fadeIn 1s ease-out 0.8s both;
}

.scroll-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
}

.scroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  animation: pulse 2s ease-in-out infinite;
}

.scroll-text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Responsive Design */
@media (max-width: 480px) {
  .landing-container {
    padding: 50px 16px 24px;
    gap: 32px;
  }

  .title-main {
    font-size: 40px;
  }

  .subtitle-main {
    font-size: 15px;
  }

  .section-title {
    font-size: 24px;
  }

  .role-cards {
    max-width: 100%;
  }

  .logo-circle {
    width: 100px;
    height: 100px;
    font-size: 48px;
  }
}

@media (min-width: 768px) {
  .landing-container {
    padding: 80px 40px 40px;
  }

  .title-main {
    font-size: 56px;
  }

  .role-cards {
    max-width: 440px;
    flex-direction: row;
    gap: 24px;
  }

  .role-card {
    flex: 1;
    min-height: auto;
  }
}

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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
