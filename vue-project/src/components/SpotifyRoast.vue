<script setup>
import { ref, onMounted } from 'vue'
import { toneOptions } from '../data/roastData.js'
import spotifyService from '../services/spotifyService.js'
import aiRoastService from '../services/aiRoastService.js'
import SpotifyDebug from './SpotifyDebug.vue'

const isConnected = ref(false)
const isLoading = ref(false)
const isGenerating = ref(false)
const roastResult = ref('')
const selectedTone = ref('leve')
const userData = ref(null)
const musicAnalysis = ref(null)

const loadUserData = async () => {
  try {
    isLoading.value = true
    console.log('Loading user data...')
    
    const analysis = await spotifyService.analyzeUserMusic()
    console.log('Music analysis complete:', analysis)
    
    musicAnalysis.value = analysis
    userData.value = analysis.profile
    isConnected.value = true
  } catch (error) {
    console.error('Error loading user data:', error)
    isConnected.value = false
  } finally {
    isLoading.value = false
  }
}

const connectSpotify = async () => {
  try {
    isLoading.value = true
    const authUrl = await spotifyService.getAuthUrl()
    window.location.href = authUrl
  } catch (error) {
    console.error('Error connecting to Spotify:', error)
    isLoading.value = false
  }
}

const generateRoast = async () => {
  if (!musicAnalysis.value) return
  
  isGenerating.value = true
  roastResult.value = ''
  
  try {
    const result = await aiRoastService.generateRoast(selectedTone.value, musicAnalysis.value)
    roastResult.value = result
  } catch (error) {
    console.error('Erro ao gerar roast:', error)
    roastResult.value = {
      text: 'Ops! Não consegui pensar em uma crítica agora. Tente novamente! 🤔',
      source: 'error',
      tone: selectedTone.value
    }
  } finally {
    isGenerating.value = false
  }
}

const shareRoast = () => {
  if (roastResult.value?.text) {
    const text = `Meu Spotify Roast: ${roastResult.value.text}\n\nGerado em: ${window.location.origin}`
    navigator.share?.({ text }) || navigator.clipboard?.writeText(text)
  }
}

const disconnect = () => {
  spotifyService.logout()
  isConnected.value = false
  userData.value = null
  musicAnalysis.value = null
  roastResult.value = ''
}

onMounted(async () => {
  if (spotifyService.isAuthenticated()) {
    await loadUserData()
  }
})
</script>

<template>
  <b-container fluid class="min-vh-100 d-flex align-items-center justify-content-center p-4">
    <b-row class="w-100 justify-content-center">
      <b-col xl="8" lg="10" md="12">
        <div class="text-center mb-4">
          <h1 class="display-4 text-white mb-2">Spotify Roast</h1>
          <p class="lead text-muted">Seu algoritmo vai te entregar.</p>
          <p class="text-muted">A gente só vai rir.</p>
        </div>

        <!-- Debug Component (remover em produção) -->
        <SpotifyDebug />

        <!-- Connection Card -->
        <b-card v-if="!isConnected" class="connection-card mb-4">
          <div class="text-center">
            <div class="spotify-icon mb-4">
              <i class="fab fa-spotify fa-4x text-success"></i>
            </div>
            
            <h3 class="text-white mb-3">Conecte sua conta</h3>
            <p class="text-muted mb-4">
              Precisamos acessar seu histórico musical para criar o roast perfeito
            </p>
            
            <b-button 
              variant="success" 
              size="lg" 
              @click="connectSpotify"
              :disabled="isLoading"
              class="connect-btn"
            >
              <b-spinner v-if="isLoading" small class="me-2"></b-spinner>
              <i v-else class="fab fa-spotify me-2"></i>
              {{ isLoading ? 'Conectando...' : 'Conectar com Spotify' }}
            </b-button>
          </div>
        </b-card>

        <!-- User Info Card -->
        <b-card v-if="isConnected && userData" class="user-info-card mb-4">
          <b-row class="align-items-center">
            <b-col cols="auto">
              <b-avatar 
                :src="userData.images?.[0]?.url" 
                size="64"
                variant="dark"
              >
                <i class="fas fa-user"></i>
              </b-avatar>
            </b-col>
            <b-col>
              <h5 class="text-white mb-1">{{ userData.display_name || 'Usuário Spotify' }}</h5>
              <p class="text-muted mb-0">
                <i class="fas fa-users me-1"></i>
                {{ userData.followers?.total || 0 }} seguidores
              </p>
            </b-col>
            <b-col cols="auto">
              <b-button variant="outline-light" size="sm" @click="disconnect">
                Desconectar
              </b-button>
            </b-col>
          </b-row>
        </b-card>

        <!-- Tone Selection -->
        <b-card v-if="isConnected" class="tone-selection-card mb-4">
          <h4 class="text-white mb-4">Escolha o tom do seu julgamento:</h4>
          
          <b-row>
            <b-col 
              v-for="tone in toneOptions" 
              :key="tone.value"
              lg="6" 
              class="mb-3"
            >
              <div 
                class="tone-card h-100"
                :class="{ 'selected': selectedTone === tone.value }"
                @click="selectedTone = tone.value"
              >
                <div class="tone-header d-flex align-items-center mb-2">
                  <span class="tone-icon me-2">{{ tone.icon }}</span>
                  <h6 class="text-white mb-0">{{ tone.label }}</h6>
                  <i 
                    v-if="selectedTone === tone.value" 
                    class="fas fa-check-circle text-success ms-auto"
                  ></i>
                </div>
                <p class="tone-description text-muted mb-2">{{ tone.description }}</p>
                <small class="tone-preview text-info">{{ tone.preview }}</small>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Generate Button -->
        <div v-if="isConnected" class="text-center mb-4">
          <b-button 
            variant="primary" 
            size="lg" 
            @click="generateRoast"
            :disabled="isGenerating || !musicAnalysis"
            class="generate-btn"
          >
            <b-spinner v-if="isGenerating" small class="me-2"></b-spinner>
            <i v-else class="fas fa-fire me-2"></i>
            {{ isGenerating ? 'Gerando seu roast...' : 'Gerar Roast' }}
          </b-button>
        </div>

        <!-- Result Card -->
        <b-card v-if="roastResult" class="result-card">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="text-white mb-1">Seu roast está pronto! 🎯</h5>
              <small class="text-muted">
                Tom: {{ toneOptions.find(t => t.value === roastResult.tone)?.label }}
                <span v-if="roastResult.source === 'openai'" class="ms-2">
                  <i class="fas fa-robot"></i> Powered by OpenAI
                </span>
                <span v-else-if="roastResult.source === 'local'" class="ms-2">
                  <i class="fas fa-cog"></i> Sistema Local
                </span>
              </small>
            </div>
            <b-button variant="outline-light" size="sm" @click="generateRoast" :disabled="isGenerating">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isGenerating }"></i>
            </b-button>
          </div>
          
          <p class="roast-text text-white mb-0">{{ roastResult.text }}</p>
          
          <div class="mt-3 d-flex gap-2">
            <b-button variant="success" size="sm" @click="shareRoast">
              <i class="fas fa-share"></i> Compartilhar
            </b-button>
            <b-button variant="outline-light" size="sm" @click="generateRoast">
              <i class="fas fa-dice"></i> Novo Roast
            </b-button>
          </div>
        </b-card>

        <!-- Footer -->
        <div class="text-center mt-4">
          <p class="text-muted small">
            Feito com <span class="text-danger">❤️</span> e muito sarcasmo • Não levem a sério, é só diversão!
          </p>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<style scoped>
/* Estilos existentes mantidos */
.connection-card,
.user-info-card,
.tone-selection-card,
.result-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.tone-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tone-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.tone-card.selected {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.tone-icon {
  font-size: 1.5rem;
}

.tone-description {
  font-size: 0.9rem;
}

.tone-preview {
  font-style: italic;
  font-size: 0.8rem;
}

.connect-btn,
.generate-btn {
  border-radius: 50px;
  padding: 12px 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.connect-btn:hover,
.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.roast-text {
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
}

.spotify-icon {
  animation: pulse 2s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.8; }
  to { opacity: 1; }
}
</style>
