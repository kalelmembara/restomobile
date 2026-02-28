<template>
  <ion-page>
    <ion-content class="login-bg">
      <div class="wrap">
        <div class="card">
          <div class="card-head">
            <div class="logo">🍽️</div>
            <h1>LOGIN</h1>
            <p class="sub">Admin &nbsp;|&nbsp; Kasir</p>
          </div>
          <div class="card-body">
            <div class="field">
              <label>Username</label>
              <ion-input v-model="username" placeholder="Masukkan username" class="inp" @keyup.enter="doLogin" />
            </div>
            <div class="field">
              <label>Password</label>
              <ion-input v-model="password" type="password" placeholder="Masukkan password" class="inp" @keyup.enter="doLogin" />
            </div>
            <p class="hint">Default: admin/admin123 &nbsp;|&nbsp; kasir1/kasir123</p>
            <p v-if="err" class="errtxt">⚠️ {{ err }}</p>
            <ion-button expand="block" class="btnlogin" :disabled="loading" @click="doLogin">
              <ion-spinner v-if="loading" name="crescent" />
              <span v-else>MASUK</span>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonInput, IonButton, IonSpinner } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const router   = useRouter()
const auth     = useAuthStore()
const { post } = useApi()
const username = ref(''), password = ref(''), loading = ref(false), err = ref('')

async function doLogin() {
  if (!username.value || !password.value) { err.value = 'Username dan password wajib diisi!'; return }
  loading.value = true; err.value = ''
  const res = await post('auth.php', { username: username.value, password: password.value })
  loading.value = false
  if (res.success) {
    auth.setUser(res.data)
    router.push(res.data.role === 'admin' ? '/admin/dashboard' : '/kasir/transaksi')
  } else {
    err.value = res.message
  }
}
</script>

<style scoped>
.login-bg { --background: #595959; }
.wrap { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
.card { background:#595959; border:2px solid #c8a03c; border-radius:14px; width:100%; max-width:380px; }
.card-head { text-align:center; padding:32px 24px 12px; }
.logo { font-size:52px; }
.card-head h1 { color:#fff; font-size:28px; font-weight:800; letter-spacing:4px; margin:6px 0 2px; }
.sub { color:#c8a03c; font-size:13px; margin:0; }
.card-body { padding:16px 28px 30px; }
.field { margin-bottom:16px; }
.field label { color:#fff; font-size:14px; display:block; margin-bottom:5px; }
.inp { --background:rgba(255,255,255,.12); --color:#fff; --placeholder-color:rgba(255,255,255,.45); --padding-start:14px; border-radius:8px; border:1px solid rgba(255,255,255,.2); }
.hint { color:rgba(200,200,200,.65); font-size:11px; text-align:center; margin:0 0 14px; font-style:italic; }
.errtxt { color:#ff8080; font-size:13px; text-align:center; margin:0 0 10px; }
.btnlogin { --background:#fff; --color:#333; --border-radius:8px; font-weight:700; font-size:15px; letter-spacing:1px; height:48px; margin-top:4px; }
</style>
