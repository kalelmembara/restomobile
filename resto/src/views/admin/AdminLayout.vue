<template>
  <ion-page>
    <ion-split-pane content-id="main" when="lg">
      <ion-menu content-id="main" menu-id="admin-menu" type="overlay">
        <ion-content class="sidebar">
          <div class="sb-head">
            <span class="sb-icon">🍽️</span>
            <div>
              <div class="sb-title">Admin Panel</div>
              <div class="sb-user">{{ auth.user?.username }}</div>
            </div>
          </div>
          <ion-list lines="none" class="sb-list">
            <ion-item v-for="m in menu" :key="m.path"
              :router-link="m.path" router-direction="root"
              class="sb-item" :class="{active: route.path.includes(m.key)}"
              @click="close">
              <span slot="start" class="sb-ico">{{ m.icon }}</span>
              <ion-label>{{ m.label }}</ion-label>
            </ion-item>
          </ion-list>
          <div class="sb-foot">
            <ion-item lines="none" class="sb-item sb-logout" button @click="logout">
              <span slot="start" class="sb-ico">🚪</span>
              <ion-label>Logout</ion-label>
            </ion-item>
          </div>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main" />
    </ion-split-pane>
  </ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { menuController, alertController } from '@ionic/vue'
import { IonPage, IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonLabel, IonRouterOutlet } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const menu   = [
  { label:'Dashboard', path:'/admin/dashboard', icon:'📊', key:'dashboard' },
  { label:'Menu',      path:'/admin/menu',      icon:'🍜', key:'menu' },
  { label:'Kategori',  path:'/admin/kategori',  icon:'📋', key:'kategori' },
  { label:'Meja',      path:'/admin/meja',      icon:'🪑', key:'meja' },
]
const close = () => menuController.close('admin-menu')
async function logout() {
  const a = await alertController.create({
    header:'Konfirmasi', message:'Yakin ingin logout?',
    buttons:[{text:'Batal',role:'cancel'},{text:'Logout',handler:()=>{ auth.logout(); router.push('/login') }}]
  })
  a.present()
}
</script>

<style scoped>
.sidebar { --background:#595959; }
.sb-head { display:flex; align-items:center; gap:12px; padding:28px 18px 18px; border-bottom:2px solid #c8a03c; }
.sb-icon { font-size:30px; }
.sb-title { color:#fff; font-weight:700; font-size:16px; }
.sb-user  { color:#c8a03c; font-size:12px; margin-top:2px; }
.sb-list  { background:transparent; padding:8px 0; }
.sb-item  { --background:transparent; --color:rgba(255,255,255,.8); --padding-start:18px; --min-height:50px; cursor:pointer; }
.sb-item:hover, .sb-item.active { --background:rgba(200,160,60,.2); --color:#fff; border-left:4px solid #c8a03c; }
.sb-ico   { font-size:18px; margin-right:4px; }
.sb-foot  { position:absolute; bottom:16px; left:0; right:0; }
.sb-logout { --color:#ff8080 !important; }
ion-split-pane { --side-width:210px; --border:none; }
</style>
