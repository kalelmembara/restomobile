import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User { id_user:number; username:string; email:string; role:string }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User|null>(null)
  const isLoggedIn = ref(false)

  function setUser(u: User) {
    user.value = u; isLoggedIn.value = true
    localStorage.setItem('resto_user', JSON.stringify(u))
  }
  function load() {
    const s = localStorage.getItem('resto_user')
    if (s) { user.value = JSON.parse(s); isLoggedIn.value = true }
  }
  function logout() {
    user.value = null; isLoggedIn.value = false
    localStorage.removeItem('resto_user')
  }
  return { user, isLoggedIn, setUser, load, logout }
})
