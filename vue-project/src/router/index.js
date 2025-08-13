import { createRouter, createWebHistory } from 'vue-router'
import SpotifyRoast from '../components/SpotifyRoast.vue'
import SpotifyCallback from '../components/SpotifyCallback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SpotifyRoast
    },
    {
      path: '/callback',
      name: 'callback',
      component: SpotifyCallback
    }
  ],
})

export default router
