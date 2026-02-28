import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/DashboardPage.vue') },
      { path: 'menu',      component: () => import('@/views/admin/MenuPage.vue') },
      { path: 'kategori',  component: () => import('@/views/admin/KategoriPage.vue') },
      { path: 'meja',      component: () => import('@/views/admin/MejaPage.vue') },
    ]
  },
  {
    path: '/kasir',
    component: () => import('@/views/kasir/KasirLayout.vue'),
    meta: { requiresAuth: true, role: 'kasir' },
    children: [
      { path: '', redirect: '/kasir/transaksi' },
      { path: 'transaksi', component: () => import('@/views/kasir/TransaksiPage.vue') },
      { path: 'riwayat',   component: () => import('@/views/kasir/RiwayatPage.vue') },
      { path: 'meja',      component: () => import('@/views/kasir/MejaStatusPage.vue') },
    ]
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  auth.load()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.path === '/login' && auth.isLoggedIn)
    return next(auth.user?.role === 'admin' ? '/admin' : '/kasir')
  if (to.meta.role && auth.user?.role !== to.meta.role)
    return next(auth.user?.role === 'admin' ? '/admin' : '/kasir')
  next()
})

export default router
