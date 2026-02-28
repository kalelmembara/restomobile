<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button /></ion-buttons>
        <ion-title>Kategori</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openForm()"><ion-icon :icon="addOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>

      <div v-if="loading" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
      <ion-list v-else>
        <ion-item-sliding v-for="item in list" :key="item.id_kategori">
          <ion-item>
            <ion-label>
              <h2 style="font-weight:600">{{ item.nama_kategori }}</h2>
              <p>ID: {{ item.id_kategori }}</p>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="warning" @click="openForm(item)">✏️ Edit</ion-item-option>
            <ion-item-option color="danger"  @click="hapus(item)">🗑️ Hapus</ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <div v-if="!loading && list.length===0" class="ctr" style="color:#aaa">Belum ada kategori</div>
    </ion-content>

    <ion-modal :is-open="show" @didDismiss="show=false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ edit ? 'Edit' : 'Tambah' }} Kategori</ion-title>
          <ion-buttons slot="end"><ion-button @click="show=false">Batal</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-label position="stacked">Nama Kategori *</ion-label>
          <ion-input v-model="form.nama_kategori" placeholder="cth: Makanan" /></ion-item>
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
  IonItemOptions,IonItemOption,IonLabel,IonButton,IonButtons,IonMenuButton,IonModal,
  IonInput,IonIcon,IonSpinner,IonRefresher,IonRefresherContent,
  alertController, toastController } from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useApi } from '@/composables/useApi'

const { get, post, put, del } = useApi()
const list = ref<any[]>([]), loading = ref(true), show = ref(false)
const edit = ref<any>(null), form = ref({ nama_kategori:'' })

async function load() {
  loading.value = true
  const r = await get('kategori.php')
  if (r.success) list.value = r.data
  loading.value = false
}
async function onRefresh(e:any) { await load(); e.target.complete() }

function openForm(item?:any) {
  edit.value = item || null
  form.value = { nama_kategori: item?.nama_kategori || '' }
  show.value = true
}

async function simpan() {
  if (!form.value.nama_kategori.trim()) { toast('Nama wajib diisi','warning'); return }
  const r = edit.value
    ? await put('kategori.php', { id_kategori:edit.value.id_kategori, ...form.value })
    : await post('kategori.php', form.value)
  toast(r.message, r.success ? 'success' : 'danger')
  if (r.success) { show.value = false; load() }
}

async function hapus(item:any) {
  const a = await alertController.create({
    header:'Hapus', message:`Hapus kategori "${item.nama_kategori}"?`,
    buttons:[{text:'Batal',role:'cancel'},{text:'Hapus',role:'destructive',handler:async()=>{
      const r = await del('kategori.php', item.id_kategori)
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
onMounted(load)
</script>
<style scoped>
.ctr { display:flex; justify-content:center; padding:40px; }
</style>
