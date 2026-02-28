<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button /></ion-buttons>
        <ion-title>Meja</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openForm()"><ion-icon :icon="addOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>

      <div class="legend">🟢 Tersedia &nbsp;&nbsp; 🔴 Terisi</div>
      <div v-if="loading" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
      <div v-else class="grid">
        <div v-for="item in list" :key="item.id_meja"
          class="mcard" :class="item.status==='Tersedia'?'av':'oc'" @click="openForm(item)">
          <div class="mno">{{ item.kode_meja }}</div>
          <div class="mkap">Kap: {{ item.kapasitas }}</div>
          <div class="mst">{{ item.status }}</div>
          <div class="medit">✏️ tap edit</div>
        </div>
      </div>
    </ion-content>

    <ion-modal :is-open="show" @didDismiss="show=false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ edit ? 'Edit' : 'Tambah' }} Meja</ion-title>
          <ion-buttons slot="end"><ion-button @click="show=false">Batal</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-label position="stacked">Kode Meja * (cth: M-12)</ion-label>
          <ion-input v-model="form.kode_meja" placeholder="M-xx" /></ion-item>
        <ion-item><ion-label position="stacked">Kapasitas</ion-label>
          <ion-input v-model="form.kapasitas" type="number" placeholder="4" /></ion-item>
        <ion-item><ion-label position="stacked">Status</ion-label>
          <ion-select v-model="form.status">
            <ion-select-option value="Tersedia">Tersedia</ion-select-option>
            <ion-select-option value="Terisi">Terisi</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="simpan">
          {{ edit ? 'Update' : 'Tambah' }}
        </ion-button>
        <ion-button v-if="edit" expand="block" color="danger" class="ion-margin-top" @click="hapus(edit)">
          Hapus Meja
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonButton,IonButtons,IonMenuButton,
  IonModal,IonItem,IonLabel,IonInput,IonSelect,IonSelectOption,IonIcon,IonSpinner,
  IonRefresher,IonRefresherContent, alertController, toastController } from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useApi } from '@/composables/useApi'

const { get, post, put, del } = useApi()
const list = ref<any[]>([]), loading = ref(true), show = ref(false), edit = ref<any>(null)
const form = ref<any>({ kode_meja:'', kapasitas:4, status:'Tersedia' })

async function load() {
  loading.value = true
  const r = await get('meja.php')
  if (r.success) list.value = r.data
  loading.value = false
}
async function onRefresh(e:any) { await load(); e.target.complete() }

function openForm(item?:any) {
  edit.value = item || null
  form.value = { kode_meja:item?.kode_meja||'', kapasitas:item?.kapasitas||4, status:item?.status||'Tersedia' }
  show.value = true
}

async function simpan() {
  if (!form.value.kode_meja.trim()) { toast('Kode meja wajib','warning'); return }
  const payload = { ...form.value, kapasitas: Number(form.value.kapasitas) }
  const r = edit.value
    ? await put('meja.php', { id_meja:edit.value.id_meja, ...payload })
    : await post('meja.php', payload)
  toast(r.message, r.success ? 'success' : 'danger')
  if (r.success) { show.value = false; load() }
}

async function hapus(item:any) {
  const a = await alertController.create({
    header:'Hapus Meja', message:`Hapus meja "${item.kode_meja}"?`,
    buttons:[{text:'Batal',role:'cancel'},{text:'Hapus',role:'destructive',handler:async()=>{
      const r = await del('meja.php', item.id_meja)
      toast(r.message, r.success ? 'success' : 'danger')
      if (r.success) { show.value = false; load() }
    }}]
  })
  a.present()
}

async function toast(msg:string, color='primary') {
  const t = await toastController.create({ message:msg, duration:2000, color, position:'top' })
  t.present()
}
onMounted(load)
</script>

<style scoped>
.ctr { display:flex; justify-content:center; padding:40px; }
.legend { font-size:13px; color:#555; margin-bottom:14px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; }
.mcard { border-radius:12px; padding:16px 10px; text-align:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.1); transition:transform .15s; }
.mcard:hover { transform:scale(1.04); }
.mcard.av { background:linear-gradient(135deg,#d5f5e3,#a9dfbf); border:1.5px solid #27ae60; }
.mcard.oc { background:linear-gradient(135deg,#fadbd8,#f1948a); border:1.5px solid #e74c3c; }
.mno  { font-size:20px; font-weight:700; color:#222; }
.mkap { font-size:11px; color:#555; margin:3px 0; }
.mst  { font-size:12px; font-weight:600; color:#333; }
.medit{ font-size:10px; color:#777; margin-top:4px; }
</style>
