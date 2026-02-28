<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button /></ion-buttons>
        <ion-title>Menu Restoran</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openForm()"><ion-icon :icon="addOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>

      <div v-if="loading" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
      <ion-list v-else>
        <ion-item-sliding v-for="item in list" :key="item.id_menu">
          <ion-item :style="item.stok==='Tidak Tersedia' ? 'background:#fff5f5' : ''">
            <ion-label>
              <h2 style="font-weight:600">{{ item.nama_menu }}</h2>
              <p>{{ item.nama_kategori }} &nbsp;|&nbsp; <b>{{ rp(item.harga) }}</b></p>
              <p style="font-size:11px;color:#888">{{ item.deskripsi }}</p>
            </ion-label>
            <ion-badge slot="end" :color="item.stok==='Tersedia' ? 'success' : 'danger'">
              {{ item.stok }}
            </ion-badge>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option :color="item.stok==='Tersedia'?'medium':'success'" @click="toggleStok(item)">
              🔄 Stok
            </ion-item-option>
            <ion-item-option color="warning" @click="openForm(item)">✏️ Edit</ion-item-option>
            <ion-item-option color="danger"  @click="hapus(item)">🗑️</ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <div v-if="!loading && list.length===0" class="ctr" style="color:#aaa">Belum ada menu</div>
    </ion-content>

    <ion-modal :is-open="show" @didDismiss="show=false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ edit ? 'Edit' : 'Tambah' }} Menu</ion-title>
          <ion-buttons slot="end"><ion-button @click="show=false">Batal</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-label position="stacked">Nama Menu *</ion-label>
          <ion-input v-model="form.nama_menu" placeholder="Nama menu" /></ion-item>
        <ion-item><ion-label position="stacked">Harga *</ion-label>
          <ion-input v-model="form.harga" type="number" placeholder="0" /></ion-item>
        <ion-item><ion-label position="stacked">Kategori</ion-label>
          <ion-select v-model="form.id_kategori" placeholder="Pilih kategori">
            <ion-select-option v-for="k in katList" :key="k.id_kategori" :value="k.id_kategori">
              {{ k.nama_kategori }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item><ion-label position="stacked">Deskripsi</ion-label>
          <ion-input v-model="form.deskripsi" placeholder="Deskripsi singkat" /></ion-item>
        <ion-item><ion-label position="stacked">Stok</ion-label>
          <ion-select v-model="form.stok">
            <ion-select-option value="Tersedia">Tersedia</ion-select-option>
            <ion-select-option value="Tidak Tersedia">Tidak Tersedia</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="simpan">
          {{ edit ? 'Update' : 'Tambah' }}
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonList,IonItem,IonItemSliding,
  IonItemOptions,IonItemOption,IonLabel,IonBadge,IonButton,IonButtons,IonMenuButton,
  IonModal,IonInput,IonSelect,IonSelectOption,IonIcon,IonSpinner,
  IonRefresher,IonRefresherContent, alertController, toastController } from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useApi } from '@/composables/useApi'

const { get, post, put, del } = useApi()
const list = ref<any[]>([]), katList = ref<any[]>([])
const loading = ref(true), show = ref(false), edit = ref<any>(null)
const form = ref<any>({ nama_menu:'',harga:0,id_kategori:null,deskripsi:'',stok:'Tersedia' })

async function load() {
  loading.value = true
  const [mr, kr] = await Promise.all([get('menu.php'), get('kategori.php')])
  if (mr.success) list.value = mr.data
  if (kr.success) katList.value = kr.data
  loading.value = false
}
async function onRefresh(e:any) { await load(); e.target.complete() }

function openForm(item?:any) {
  edit.value = item || null
  form.value = { nama_menu:item?.nama_menu||'', harga:item?.harga||0,
    id_kategori:item?.id_kategori||null, deskripsi:item?.deskripsi||'', stok:item?.stok||'Tersedia' }
  show.value = true
}

async function simpan() {
  if (!form.value.nama_menu.trim() || !form.value.harga) { toast('Nama & harga wajib','warning'); return }
  const r = edit.value
    ? await put('menu.php', { id_menu:edit.value.id_menu, ...form.value })
    : await post('menu.php', form.value)
  toast(r.message, r.success ? 'success' : 'danger')
  if (r.success) { show.value = false; load() }
}

async function toggleStok(item:any) {
  const stokBaru = item.stok === 'Tersedia' ? 'Tidak Tersedia' : 'Tersedia'
  const r = await put('menu.php', { ...item, stok:stokBaru })
  toast(`${item.nama_menu} → ${stokBaru}`, r.success ? 'success' : 'danger')
  if (r.success) load()
}

async function hapus(item:any) {
  const a = await alertController.create({
    header:'Hapus', message:`Hapus "${item.nama_menu}"?`,
    buttons:[{text:'Batal',role:'cancel'},{text:'Hapus',role:'destructive',handler:async()=>{
      const r = await del('menu.php', item.id_menu)
      toast(r.message, r.success ? 'success' : 'danger')
      if (r.success) load()
    }}]
  })
  a.present()
}

async function toast(msg:string, color='primary') {
  const t = await toastController.create({ message:msg, duration:2000, color, position:'top' })
  t.present()
}
const rp = (v:number) => 'Rp '+Number(v).toLocaleString('id-ID')
onMounted(load)
</script>
<style scoped>
.ctr { display:flex; justify-content:center; padding:40px; }
</style>
