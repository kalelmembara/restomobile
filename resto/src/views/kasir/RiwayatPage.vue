<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Riwayat Transaksi</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="load"><ion-icon :icon="refreshOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
      <div v-if="loading" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
      <div v-else-if="!list.length" class="ctr" style="color:#aaa">Belum ada transaksi</div>
      <ion-accordion-group v-else>
        <ion-accordion v-for="t in list" :key="t.id_transaksi">
          <ion-item slot="header" color="light">
            <ion-label>
              <h2 style="font-weight:700">#{{ t.id_transaksi }}
                <ion-badge :color="t.tipe_order==='dinein'?'tertiary':'warning'" style="margin-left:6px;font-size:10px">
                  {{ t.tipe_order==='dinein'?'🪑 Dine In':'🥡 Take Away' }}
                </ion-badge>
              </h2>
              <p>{{ t.kode_meja!=='-'?'Meja: '+t.kode_meja:'—' }} &nbsp;|&nbsp; {{ fmtDate(t.tanggal) }}</p>
            </ion-label>
            <ion-badge slot="end" color="success">{{ rp(t.total_harga) }}</ion-badge>
          </ion-item>
          <div slot="content" class="det">
            <table class="dtbl">
              <thead><tr><th>Menu</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>
                <tr v-for="d in t.detail" :key="d.id_detail">
                  <td>{{ d.nama_menu }}</td><td>{{ rp(d.harga) }}</td>
                  <td class="tc">{{ d.jumlah }}</td><td>{{ rp(d.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="dsum">
              <div class="dr"><span>Total</span><span>{{ rp(t.total_harga) }}</span></div>
              <div class="dr"><span>Uang Bayar</span><span>{{ rp(t.uang_bayar) }}</span></div>
              <div class="dr bold"><span>Kembalian</span><span style="color:#27ae60">{{ rp(t.kembalian) }}</span></div>
            </div>
          </div>
        </ion-accordion>
      </ion-accordion-group>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonAccordion,IonAccordionGroup,
  IonItem,IonLabel,IonBadge,IonButton,IonButtons,IonIcon,IonSpinner,
  IonRefresher,IonRefresherContent } from '@ionic/vue'
import { refreshOutline } from 'ionicons/icons'
import { useApi } from '@/composables/useApi'

const { get } = useApi()
const list = ref<any[]>([]), loading = ref(true)

async function load() {
  loading.value = true
  const r = await get('transaksi.php?limit=100')
  if (r.success) list.value = r.data
  loading.value = false
}
async function onRefresh(e:any) { await load(); e.target.complete() }
const rp = (v:number) => 'Rp ' + Number(v).toLocaleString('id-ID')
const fmtDate = (s:string) => new Date(s).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
onMounted(load)
</script>

<style scoped>
.ctr { display:flex; justify-content:center; padding:40px; }
.det { padding:12px 14px; background:#fafafa; }
.dtbl { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:10px; }
.dtbl th { background:#595959; color:#fff; padding:6px 8px; text-align:left; }
.dtbl td { padding:6px 8px; border-bottom:1px solid #eee; }
.tc { text-align:center; }
.dsum { background:#fff; border-radius:8px; padding:10px 12px; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.dr   { display:flex; justify-content:space-between; font-size:13px; padding:4px 0; color:#555; }
.dr.bold { font-weight:700; color:#222; border-top:1px solid #eee; margin-top:4px; padding-top:8px; }
</style>
