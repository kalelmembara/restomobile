<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Status Meja</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="load"><ion-icon :icon="refreshOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
      <p class="hint">Tap meja untuk ubah status Tersedia ↔ Terisi</p>
      <div v-if="loading" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
      <div v-else class="grid">
        <div v-for="m in list" :key="m.id_meja"
          class="mcard" :class="m.status==='Tersedia'?'av':'oc'"
          @click="toggle(m)">
          <div class="mno">{{ m.kode_meja }}</div>
          <div class="mkap">Kap: {{ m.kapasitas }}</div>
          <div class="mst">{{ m.status }}</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonButton,IonButtons,IonIcon,
  IonSpinner,IonRefresher,IonRefresherContent, toastController } from '@ionic/vue'
import { refreshOutline } from 'ionicons/icons'
import { useApi } from '@/composables/useApi'

const { get, put } = useApi()
const list = ref<any[]>([]), loading = ref(true)

async function load() {
  loading.value = true
  const r = await get('meja.php')
  if (r.success) list.value = r.data
  loading.value = false
}
async function onRefresh(e:any) { await load(); e.target.complete() }

async function toggle(m:any) {
  const ns = m.status === 'Tersedia' ? 'Terisi' : 'Tersedia'
  const r = await put('meja.php', { ...m, status:ns })
  if (r.success) {
    m.status = ns
    const t = await toastController.create({ message:`${m.kode_meja} → ${ns}`,
      duration:1500, color:ns==='Tersedia'?'success':'warning', position:'top' })
    t.present()
  }
}
onMounted(load)
</script>

<style scoped>
.hint { font-size:12px; color:#888; margin-bottom:12px; text-align:center; }
.ctr  { display:flex; justify-content:center; padding:40px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:12px; }
.mcard { border-radius:12px; padding:18px 10px; text-align:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.1); transition:transform .15s; }
.mcard:hover { transform:scale(1.04); }
.mcard.av { background:linear-gradient(135deg,#d5f5e3,#a9dfbf); border:1.5px solid #27ae60; }
.mcard.oc { background:linear-gradient(135deg,#fadbd8,#f1948a); border:1.5px solid #e74c3c; }
.mno  { font-size:20px; font-weight:700; color:#222; }
.mkap { font-size:11px; color:#555; margin:3px 0; }
.mst  { font-size:12px; font-weight:600; color:#333; }
</style>
