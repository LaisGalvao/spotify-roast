<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import spotifyService from '../services/spotifyService.js'

const router = useRouter()

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')

  if (error) {
    console.error('Spotify auth error:', error)
    alert('Erro na autenticação com Spotify: ' + error)
    router.push('/')
    return
  }

  if (code) {
    try {
      await spotifyService.exchangeCodeForToken(code)
      router.push('/')
    } catch (error) {
      console.error('Error exchanging code:', error)
      alert('Erro ao conectar com Spotify. Tente novamente.')
      router.push('/')
    }
  } else {
    router.push('/')
  }
})
</script>

<template>
  <b-container class="min-vh-100 d-flex align-items-center justify-content-center">
    <b-row class="text-center">
      <b-col>
        <b-spinner variant="success" style="width: 3rem; height: 3rem;"></b-spinner>
        <h3 class="text-white mt-3">Conectando com Spotify...</h3>
        <p class="text-muted">Aguarde enquanto processamos sua autenticação.</p>
      </b-col>
    </b-row>
  </b-container>
</template>

<style scoped>
.min-vh-100 {
  background: linear-gradient(135deg, #111827 0%, #000000 50%, #1f2937 100%);
}
</style>
