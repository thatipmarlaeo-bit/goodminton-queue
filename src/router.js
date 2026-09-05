import { createRouter, createWebHistory } from 'vue-router'
import PlayerView from './views/PlayerView.vue'
import AdminView from './views/AdminView.vue'

const routes = [
  { path: '/', component: PlayerView },         // หน้าแรกสำหรับผู้เล่น
  { path: '/admin', component: AdminView }      // หน้าจัดการสำหรับแอดมิน
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router