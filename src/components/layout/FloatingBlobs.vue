<template>
  <div class="floating-blob blob-1"></div>
  <div class="floating-blob blob-2"></div>
  <div v-if="showThird" class="floating-blob blob-3"></div>
</template>

<script setup lang="ts">
defineProps({
  showThird: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.floating-blob {
  position: fixed;
  border-radius: 50%;
  opacity: 0.03;
  z-index: -1;
  filter: blur(40px);
  pointer-events: none;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  top: -80px;
  right: -100px;
  animation: float 15s ease-in-out infinite;
}

.blob-2 {
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, #ec4899, #f59e0b);
  bottom: 50px;
  left: -60px;
  animation: float 18s ease-in-out infinite reverse;
}

.blob-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #10b981, #6366f1);
  top: 50%;
  right: 5%;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(30px); }
}
</style>
