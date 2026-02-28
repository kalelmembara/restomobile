<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Kasir — {{ auth.user?.username }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="doLogout"><ion-icon :icon="logOutOutline" slot="icon-only"/></ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="search" placeholder="Cari menu..." debounce="200" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="pos">
        <!-- ===== MENU KIRI ===== -->
        <div class="mleft">
          <!-- Filter kategori -->
          <div class="katbar">
            <ion-button size="small" :fill="katAktif===null?'solid':'outline'" @click="katAktif=null">Semua</ion-button>
            <ion-button v-for="k in katList" :key="k.id_kategori" size="small"
              :fill="katAktif===k.id_kategori?'solid':'outline'" @click="katAktif=k.id_kategori">
              {{ k.nama_kategori }}
            </ion-button>
          </div>
          <!-- Grid menu -->
          <div v-if="loadingMenu" class="ctr"><ion-spinner name="crescent" color="primary"/></div>
          <div v-else class="mgrid">
            <div v-for="item in filtered" :key="item.id_menu"
              class="mitem" :class="{habis: item.stok==='Tidak Tersedia'}"
              @click="addItem(item)">
              <div class="mitem-ico">🍽️</div>
              <div class="mitem-name">{{ item.nama_menu }}</div>
              <div class="mitem-kat">{{ item.nama_kategori }}</div>
              <div class="mitem-price">{{ rp(item.harga) }}</div>
              <div v-if="item.stok==='Tidak Tersedia'" class="habis-tag">HABIS</div>
            </div>
          </div>
        </div>

        <!-- ===== CART KANAN ===== -->
        <div class="mright">
          <!-- Tipe order -->
          <div class="tipe-row">
            <button :class="['tipe-btn', tipeOrder==='dinein'?'active':'']" @click="tipeOrder='dinein'; kodeMeja=''">
              🪑 Dine In
            </button>
            <button :class="['tipe-btn', tipeOrder==='takeaway'?'active':'']" @click="tipeOrder='takeaway'; kodeMeja=''">
              🥡 Take Away
            </button>
          </div>

          <!-- Pilih meja (hanya dine in) -->
          <div v-if="tipeOrder==='dinein'" class="meja-row">
            <select v-model="kodeMeja" class="meja-select">
              <option value="">— Pilih Meja —</option>
              <option v-for="m in mejaList" :key="m.id_meja" :value="m.kode_meja">
                {{ m.kode_meja }} (kap {{ m.kapasitas }}) – {{ m.status }}
              </option>
            </select>
          </div>

          <!-- Header cart -->
          <div class="cart-head">
            <span style="font-weight:700;font-size:15px">🛒 Pesanan</span>
            <button v-if="cart.length" class="clr-btn" @click="clearCart">Hapus Semua</button>
          </div>

          <!-- Items -->
          <div class="cart-body">
            <div v-if="!cart.length" class="cart-empty">Belum ada pesanan</div>
            <div v-for="(it,i) in cart" :key="i" class="citem">
              <div class="cinfo">
                <div class="cname">{{ it.nama_menu }}</div>
                <div class="cprice">{{ rp(it.harga) }}</div>
              </div>
              <div class="cqty">
                <button @click="chQty(i,-1)">−</button>
                <span>{{ it.jumlah }}</span>
                <button @click="chQty(i,1)">+</button>
              </div>
              <div class="csub">{{ rp(it.harga*it.jumlah) }}</div>
            </div>
          </div>

          <!-- Total & bayar -->
          <div class="cart-foot">
            <div class="total-row"><span>Total</span><span class="total-val">{{ rp(total) }}</span></div>
            <div class="bayar-row">
              <label>Uang Bayar</label>
              <input v-model="uangBayar" type="number" class="bayar-inp" placeholder="0"/>
            </div>
            <div v-if="Number(uangBayar)>0" class="kembalian-row">
              <span>Kembalian</span>
              <span :style="kembalian<0?'color:#e74c3c;font-weight:700':'color:#27ae60;font-weight:700'">
                {{ rp(kembalian) }}
              </span>
            </div>
            <button class="bayar-btn" :disabled="!canBayar" @click="bayar">BAYAR</button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonButton,IonButtons,
  IonIcon,IonSearchbar,IonSpinner, alertController, toastController } from '@ionic/vue'
import { logOutOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const auth   = useAuthStore()
const { get, post } = useApi()

const menuList  = ref<any[]>([])
const katList   = ref<any[]>([])
const mejaList  = ref<any[]>([])
const cart      = ref<any[]>([])
const search    = ref('')
const katAktif  = ref<number|null>(null)
const uangBayar = ref<number|string>('')
const tipeOrder = ref('dinein')
const kodeMeja  = ref('')
const loadingMenu = ref(true)

const filtered = computed(() => menuList.value.filter(m => {
  const s = m.nama_menu.toLowerCase().includes(search.value.toLowerCase())
  const k = katAktif.value === null || m.id_kategori == katAktif.value
  return s && k
}))

const total     = computed(() => cart.value.reduce((s,i)=>s+i.harga*i.jumlah,0))
const kembalian = computed(() => Number(uangBayar.value) - total.value)
const canBayar  = computed(() => cart.value.length > 0 && kembalian.value >= 0)

function addItem(item: any) {
  if (item.stok === 'Tidak Tersedia') return
  const ex = cart.value.find(c => c.id_menu === item.id_menu)
  if (ex) ex.jumlah++
  else cart.value.push({ ...item, jumlah:1 })
}

function chQty(i: number, d: number) {
  cart.value[i].jumlah += d
  if (cart.value[i].jumlah <= 0) cart.value.splice(i,1)
}

function clearCart() { cart.value = []; uangBayar.value = ''; kodeMeja.value = '' }

async function bayar() {
  if (tipeOrder.value === 'dinein' && !kodeMeja.value) {
    toast('Pilih meja terlebih dahulu!', 'warning'); return
  }
  const a = await alertController.create({
    header: 'Konfirmasi Pembayaran',
    message: `Total: ${rp(total.value)}\nUang: ${rp(Number(uangBayar.value))}\nKembalian: ${rp(kembalian.value)}\nMeja: ${kodeMeja.value||'-'} (${tipeOrder.value})`,
    buttons: [
      { text:'Batal', role:'cancel' },
      { text:'Bayar', handler: async () => {
        const res = await post('transaksi.php', {
          items: cart.value.map(i=>({ nama_menu:i.nama_menu, harga:i.harga, jumlah:i.jumlah })),
          uang_bayar: Number(uangBayar.value),
          kode_meja: kodeMeja.value || '-',
          tipe_order: tipeOrder.value,
        })
        if (res.success) {
          struk(res.data)
          clearCart()
        } else {
          toast(res.message, 'danger')
        }
      }}
    ]
  })
  a.present()
}

async function struk(d: any) {
  const a = await alertController.create({
    header: '✅ Transaksi Berhasil!',
    message: `ID: #${d.id_transaksi}\nTotal: ${rp(d.total_harga)}\nUang: ${rp(d.uang_bayar)}\nKembalian: ${rp(d.kembalian)}`,
    buttons: ['OK']
  })
  a.present()
}

async function doLogout() {
  const a = await alertController.create({
    header:'Logout', message:'Yakin ingin logout?',
    buttons:[{text:'Batal',role:'cancel'},{text:'Logout',handler:()=>{ auth.logout(); router.push('/login') }}]
  })
  a.present()
}

async function toast(msg:string, color='primary') {
  const t = await toastController.create({ message:msg, duration:2000, color, position:'top' })
  t.present()
}

const rp = (v:number) => 'Rp ' + Number(v).toLocaleString('id-ID')

async function load() {
  loadingMenu.value = true
  const [mr, kr, mj] = await Promise.all([get('menu.php'), get('kategori.php'), get('meja.php')])
  if (mr.success) menuList.value = mr.data
  if (kr.success) katList.value = kr.data
  if (mj.success) mejaList.value = mj.data
  loadingMenu.value = false
}
onMounted(load)
</script>

<style scoped>
.pos { display:flex; height:calc(100vh - 112px); overflow:hidden; }
.mleft { flex:1.4; overflow-y:auto; padding:10px; border-right:1px solid #e8e8e8; }
.mright{ flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:270px; }
.ctr  { display:flex; justify-content:center; padding:30px; }

.katbar { display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:10px; flex-wrap:nowrap; }
.katbar ion-button { --border-radius:20px; white-space:nowrap; flex-shrink:0; font-size:12px; }

.mgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:10px; }
.mitem { background:#fff; border:1.5px solid #e0e0e0; border-radius:12px; padding:12px 8px;
  text-align:center; cursor:pointer; position:relative; overflow:hidden; transition:all .15s; }
.mitem:hover { border-color:#595959; box-shadow:0 2px 10px rgba(0,0,0,.1); }
.mitem.habis  { opacity:.5; cursor:not-allowed; }
.mitem-ico    { font-size:26px; margin-bottom:4px; }
.mitem-name   { font-size:12px; font-weight:600; color:#222; line-height:1.2; margin-bottom:2px; }
.mitem-kat    { font-size:10px; color:#aaa; margin-bottom:3px; }
.mitem-price  { font-size:12px; font-weight:700; color:#3d7ab5; }
.habis-tag    { position:absolute; inset:0; background:rgba(0,0,0,.4); color:#fff; display:flex;
  align-items:center; justify-content:center; font-weight:700; font-size:13px; border-radius:12px; }

.tipe-row { display:flex; gap:0; border-bottom:1px solid #eee; }
.tipe-btn { flex:1; padding:12px; border:none; background:#f5f5f5; font-size:14px; cursor:pointer; transition:all .2s; font-weight:600; }
.tipe-btn.active { background:#595959; color:#fff; }

.meja-row { padding:8px 12px; border-bottom:1px solid #eee; }
.meja-select { width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:8px; font-size:13px; color:#333; }

.cart-head { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #eee; }
.clr-btn   { border:none; background:none; color:#e74c3c; font-size:12px; cursor:pointer; font-weight:600; }
.cart-body { flex:1; overflow-y:auto; padding:6px 10px; }
.cart-empty{ text-align:center; color:#ccc; padding:30px; font-size:14px; }
.citem { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid #f0f0f0; }
.cinfo { flex:1; }
.cname { font-size:13px; font-weight:600; color:#222; }
.cprice{ font-size:11px; color:#aaa; }
.cqty  { display:flex; align-items:center; gap:4px; }
.cqty button { width:26px; height:26px; border-radius:6px; border:1.5px solid #ddd; background:#fff; cursor:pointer; font-size:16px; line-height:1; }
.cqty span   { min-width:20px; text-align:center; font-weight:700; font-size:14px; }
.csub  { font-size:12px; font-weight:700; color:#27ae60; min-width:70px; text-align:right; }

.cart-foot { border-top:2px solid #eee; padding:10px 12px; }
.total-row { display:flex; justify-content:space-between; margin-bottom:8px; }
.total-row span:first-child { color:#555; font-size:14px; }
.total-val { font-size:18px; font-weight:800; color:#222; }
.bayar-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.bayar-row label { font-size:13px; color:#555; }
.bayar-inp { border:1.5px solid #ddd; border-radius:8px; padding:6px 10px; font-size:14px; width:130px; text-align:right; }
.kembalian-row { display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px; }
.bayar-btn { width:100%; padding:13px; background:#27ae60; color:#fff; border:none; border-radius:10px;
  font-size:16px; font-weight:800; letter-spacing:1px; cursor:pointer; transition:opacity .2s; }
.bayar-btn:disabled { opacity:.45; cursor:not-allowed; }
.bayar-btn:not(:disabled):hover { opacity:.9; }

@media (max-width:600px) {
  .pos { flex-direction:column; height:auto; }
  .mleft { border-right:none; border-bottom:1px solid #eee; }
  .mright { min-width:unset; }
}
</style>
