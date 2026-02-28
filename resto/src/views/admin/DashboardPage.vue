<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button /></ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="load"><ion-icon :icon="refreshOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <p class="welcome">Selamat datang, <b>{{ auth.user?.username }}</b> 👋</p>

      <div v-if="loading" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
      <div v-else>
        <!-- Stat cards -->
        <div class="grid4">
          <div class="scard blue">
            <div class="snum">{{ d.total_menu }}</div>
            <div class="slbl">🍜 Menu</div>
          </div>
          <div class="scard orange">
            <div class="snum">{{ d.total_kategori }}</div>
            <div class="slbl">📋 Kategori</div>
          </div>
          <div class="scard green">
            <div class="snum">{{ d.meja_tersedia }}<span style="font-size:14px">/{{ d.total_meja }}</span></div>
            <div class="slbl">🪑 Meja Tersedia</div>
          </div>
          <div class="scard purple">
            <div class="snum">{{ d.total_transaksi }}</div>
            <div class="slbl">🧾 Transaksi</div>
          </div>
        </div>

        <!-- Pendapatan -->
        <ion-card class="pcard">
          <ion-card-header>
            <ion-card-title class="ptitle">💰 Pendapatan</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="prow"><span class="plbl">Hari Ini</span><span class="pval">{{ rp(d.pendapatan_hari) }}</span></div>
            <hr class="div"/>
            <div class="prow"><span class="plbl">Bulan Ini</span><span class="pval">{{ rp(d.pendapatan_bulan) }}</span></div>
            <hr class="div"/>
            <div class="prow"><span class="plbl">Dine In</span><span class="pval2">{{ d.trx_dinein }} transaksi</span></div>
            <div class="prow"><span class="plbl">Take Away</span><span class="pval2">{{ d.trx_takeaway }} transaksi</span></div>
          </ion-card-content>
        </ion-card>

        <!-- Transaksi terakhir -->
        <ion-card>
          <ion-card-header>
            <ion-card-title style="font-size:15px;font-weight:700">🕐 Transaksi Terakhir</ion-card-title>
          </ion-card-header>
          <ion-card-content style="padding:0">
            <ion-list lines="inset">
              <ion-item v-for="t in d.transaksi_terakhir" :key="t.id_transaksi">
                <ion-label>
                  <p style="font-weight:600;color:#333">#{{ t.id_transaksi }} — {{ t.kode_meja }} ({{ t.tipe_order }})</p>
                  <p style="font-size:11px;color:#999">{{ fmtDate(t.tanggal) }}</p>
                </ion-label>
                <ion-badge slot="end" color="success">{{ rp(t.total_harga) }}</ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonCard,IonCardHeader,IonCardTitle,
  IonCardContent,IonButtons,IonMenuButton,IonButton,IonIcon,IonSpinner,IonBadge,
  IonRefresher,IonRefresherContent,IonList,IonItem,IonLabel } from '@ionic/vue'
import { refreshOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const auth = useAuthStore()
const { get } = useApi()
const loading = ref(true)
const d = ref<any>({ total_menu:0,total_kategori:0,total_meja:0,meja_tersedia:0,
  total_transaksi:0,pendapatan_hari:0,pendapatan_bulan:0,trx_dinein:0,trx_takeaway:0,transaksi_terakhir:[] })

async function load() {
  loading.value = true
  const r = await get('dashboard.php')
  if (r.success) d.value = r.data
  loading.value = false
}
async function onRefresh(e: any) { await load(); e.target.complete() }
const rp  = (v:number) => 'Rp ' + Number(v).toLocaleString('id-ID')
const fmtDate = (s:string) => new Date(s).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
onMounted(load)
</script>

<style scoped>
.welcome { font-size:15px; color:#444; margin-bottom:16px; }
.ctr { display:flex; justify-content:center; padding:40px; }
.grid4 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
.scard { border-radius:12px; padding:16px 14px; color:#fff; }
.snum  { font-size:26px; font-weight:800; line-height:1; }
.slbl  { font-size:12px; opacity:.85; margin-top:4px; }
.scard.blue   { background:linear-gradient(135deg,#3d7ab5,#5a9fd4); }
.scard.orange { background:linear-gradient(135deg,#e67e22,#f39c12); }
.scard.green  { background:linear-gradient(135deg,#27ae60,#2ecc71); }
.scard.purple { background:linear-gradient(135deg,#8e44ad,#a569bd); }
.pcard { border-radius:12px; }
.ptitle { font-size:15px; font-weight:700; }
.prow  { display:flex; justify-content:space-between; padding:6px 0; }
.plbl  { color:#666; font-size:14px; }
.pval  { font-weight:700; font-size:15px; color:#27ae60; }
.pval2 { font-size:14px; color:#555; }
.div   { border:none; border-top:1px solid #eee; margin:4px 0; }
</style>
