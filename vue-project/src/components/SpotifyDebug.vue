<script setup>
import { ref, onMounted } from 'vue'
import { SPOTIFY_CONFIG } from '../config/spotify.js'

const debugInfo = ref({})

onMounted(() => {
  debugInfo.value = {
    clientId: SPOTIFY_CONFIG.CLIENT_ID?.substring(0, 8) + '...',
    redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
    scopes: SPOTIFY_CONFIG.SCOPES,
    authUrl: SPOTIFY_CONFIG.AUTH_URL,
    currentUrl: window.location.href,
    localStorage: {
      hasAccessToken: !!localStorage.getItem('spotify_access_token'),
      hasRefreshToken: !!localStorage.getItem('spotify_refresh_token'),
      hasCodeVerifier: !!localStorage.getItem('spotify_code_verifier'),
      hasAuthState: !!localStorage.getItem('spotify_auth_state')
    }
  }
})

const copyToClipboard = () => {
  navigator.clipboard.writeText(JSON.stringify(debugInfo.value, null, 2))
  alert('Informações de debug copiadas!')
}
</script>

<template>
  <div class="debug-panel p-3 m-3 border rounded bg-light">
    <h5>🔧 Debug do Spotify OAuth</h5>
    
    <div class="mb-3">
      <h6>Configurações:</h6>
      <pre class="bg-dark text-light p-2 rounded small">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
    </div>
    
    <div class="d-flex gap-2">
      <button @click="copyToClipboard" class="btn btn-sm btn-primary">
        📋 Copiar Debug Info
      </button>
      <button @click="localStorage.clear(); location.reload()" class="btn btn-sm btn-warning">
        🗑️ Limpar Storage
      </button>
    </div>
    
    <div class="mt-3">
      <h6>Checklist de Configuração:</h6>
      <ul class="small">
        <li :class="debugInfo.clientId?.length > 10 ? 'text-success' : 'text-danger'">
          ✓ Client ID configurado: {{ debugInfo.clientId?.length > 10 ? 'SIM' : 'NÃO' }}
        </li>
        <li :class="debugInfo.redirectUri?.includes('callback') ? 'text-success' : 'text-danger'">
          ✓ Redirect URI válida: {{ debugInfo.redirectUri?.includes('callback') ? 'SIM' : 'NÃO' }}
        </li>
        <li :class="debugInfo.scopes?.length > 0 ? 'text-success' : 'text-danger'">
          ✓ Scopes configurados: {{ debugInfo.scopes?.length || 0 }} scopes
        </li>
      </ul>
    </div>
  </div>
</template>
