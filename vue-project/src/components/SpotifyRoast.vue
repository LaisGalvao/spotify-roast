<script setup>
import { ref, onMounted } from 'vue'
import { toneOptions, mockRoasts } from '../data/roastData.js'
import spotifyService from '../services/spotifyService.js'

const isConnected = ref(false)
const isLoading = ref(false)
const roastResult = ref('')
const selectedTone = ref('leve')
const userData = ref(null)
const musicAnalysis = ref(null)

onMounted(() => {
  // Verificar se já está autenticado
  if (spotifyService.isAuthenticated()) {
    loadUserData()
  }
})

const loadUserData = async () => {
  try {
    isLoading.value = true
    const data = await spotifyService.analyzeUserMusic()
    userData.value = data.profile
    musicAnalysis.value = data.analysis
    isConnected.value = true
  } catch (error) {
    console.error('Error loading user data:', error)
    // Se der erro, fazer logout para limpar tokens inválidos
    spotifyService.logout()
    isConnected.value = false
  } finally {
    isLoading.value = false
  }
}

const connectSpotify = () => {
  // Redirecionar para autorização do Spotify
  window.location.href = spotifyService.getAuthUrl()
}

const generateRoast = async () => {
  if (!musicAnalysis.value) {
    alert('Dados musicais ainda não carregados. Tente novamente.')
    return
  }

  isLoading.value = true
  roastResult.value = ''
  
  try {
    // Simular processamento (você pode implementar lógica real de IA aqui)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Gerar roast baseado nos dados reais do usuário
    roastResult.value = generatePersonalizedRoast(selectedTone.value, musicAnalysis.value)
  } catch (error) {
    console.error('Error generating roast:', error)
    roastResult.value = mockRoasts[selectedTone.value] // Fallback para mock
  } finally {
    isLoading.value = false
  }
}

const generatePersonalizedRoast = (tone, analysis) => {
  const { topGenres, popularityScore, topArtists, topTracks } = analysis
  
  const templates = {
    leve: [
      `Seus top gêneros são ${topGenres.slice(0, 2).map(g => g.genre).join(' e ')}... pelo menos você tem consistência! 🎵`,
      `Você ouve ${topArtists[0]?.name || 'artistas'} como se fosse seu trabalho. Que dedicação! 😄`,
      `Score de popularidade: ${popularityScore.score}/100. ${popularityScore.category === 'Underground' ? 'Você é hipster mesmo!' : 'Mainstream, mas tudo bem!'} 🎯`
    ],
    
    debochado: [
      `Querido, ${popularityScore.category.toLowerCase()} é seu middle name. Você tem o gosto musical de quem só ouve rádio de elevador, mas com extra steps. 💅`,
      `${topArtists[0]?.name || 'Seus artistas favoritos'} deve ter você como fã número 1... e talvez único. Que fofo! ✨`,
      `${topGenres[0]?.genre || 'Seu gênero favorito'} é seu comfort zone há anos. Mudança é assustadora mesmo! 🎭`
    ],
    
    quebrada: [
      `Mano, ${popularityScore.score} de popularidade? Você tá ouvindo música ou fazendo curso de nicho cultural? 💥`,
      `${topTracks[0]?.name || 'Suas músicas'} no repeat eterno. Varia o repertório, parceiro! 🎧`,
      `${topGenres.slice(0, 2).map(g => g.genre).join(' e ')} é coisa de quem quer aparecer. Relaxa na pose! 🔥`
    ],
    
    exposed: [
      `Sua playlist grita '${popularityScore.category.toLowerCase()}' mais alto que suas inseguranças. Score ${popularityScore.score}/100 de quem tenta muito! 💔`,
      `${topArtists[0]?.name || 'Seus artistas'} é sua terapia musical barata. Todo mundo vê que você tá processando algo! 🔥`,
      `${topGenres[0]?.genre || 'Seus gêneros'} é seu mecanismo de defesa musical. Que transparente! 😱`
    ],
    
    poetico: [
      `Tuas frequências sonoras dançam entre ${topGenres.slice(0, 2).map(g => g.genre).join(' e ')}, como sussurros de uma alma que busca identidade nos algoritmos digitais. 🌈`,
      `${topArtists[0]?.name || 'Teus artistas escolhidos'} ecoa(m) nos corredores da tua melancolia, com score ${popularityScore.score} de popularidade - números que não definem a profundidade do sentir. 🎭`,
      `Tu habitas o universo ${popularityScore.category.toLowerCase()}, onde cada nota é uma lágrima cristalizada no tempo. Que belo! ✨`
    ]
  }
  
  const toneTemplates = templates[tone] || templates.leve
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)]
}

const shareRoast = async () => {
  try {
    await navigator.clipboard.writeText(roastResult.value)
    alert('Roast copiado para a área de transferência! 📋')
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}

const disconnect = () => {
  spotifyService.logout()
  isConnected.value = false
  roastResult.value = ''
  selectedTone.value = 'leve'
  userData.value = null
  musicAnalysis.value = null
}
</script>

<template>
  <b-container fluid class="min-vh-100 d-flex align-items-center justify-content-center p-4">
    <b-row class="w-100 justify-content-center">
      <b-col cols="12" xl="8" lg="10">
        <!-- Header -->
        <div class="text-center mb-5">
          <h1 class="display-1 fw-black gradient-text mb-4">
            Spotify Roast
          </h1>
          <p class="lead text-light fs-3">
            Seu algoritmo vai te entregar. <br>
            <span class="text-danger fw-bold">A gente só vai rir.</span>
          </p>
        </div>

        <!-- Main Card -->
        <b-card class="dark-card shadow-lg border-secondary">
          
          <!-- Not Connected State -->
          <div v-if="!isConnected" class="text-center">
            <div class="mb-4">
              <div class="spotify-icon mx-auto mb-4">
                <svg width="48" height="48" class="text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h2 class="h3 fw-bold text-white mb-3">Conecte sua conta</h2>
              <p class="text-muted mb-4">Precisamos acessar seu histórico musical para criar o roast perfeito</p>
            </div>

            <b-button 
              @click="connectSpotify"
              :disabled="isLoading"
              variant="success"
              size="lg"
              class="w-100 spotify-button"
            >
              <b-spinner v-if="isLoading" small class="me-2"></b-spinner>
              <svg v-if="!isLoading" width="24" height="24" class="me-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              {{ isLoading ? 'Conectando...' : 'Conectar com Spotify' }}
            </b-button>
          </div>

          <!-- Connected State -->
          <div v-else>
            <!-- User Info -->
            <b-card class="user-info-card mb-4" body-class="p-3">
              <b-row class="align-items-center">
                <b-col cols="auto">
                  <b-avatar 
                    :src="userData.images?.[0]?.url || '/placeholder.svg?height=64&width=64'" 
                    size="64" 
                    class="border border-success border-2"
                  ></b-avatar>
                </b-col>
                <b-col>
                  <h5 class="text-white mb-1">{{ userData.display_name }}</h5>
                  <p class="text-success mb-0 fw-medium">{{ userData.followers?.total || 0 }} seguidores</p>
                  <small v-if="musicAnalysis" class="text-muted">
                    {{ musicAnalysis.popularityScore?.category || 'Analisando...' }} | 
                    Score: {{ musicAnalysis.popularityScore?.score || 0 }}/100
                  </small>
                </b-col>
                <b-col cols="auto">
                  <b-button 
                    @click="disconnect"
                    variant="outline-danger"
                    size="sm"
                    title="Desconectar"
                  >
                    <i class="bi bi-x-lg"></i>
                  </b-button>
                </b-col>
              </b-row>
            </b-card>

            <!-- Tone Selector -->
            <div class="mb-4">
              <h5 class="text-white mb-3">Escolha o tom da crítica:</h5>
              <b-form-radio-group
                v-model="selectedTone"
                class="tone-selector"
              >
                <b-row>
                  <b-col 
                    v-for="tone in toneOptions" 
                    :key="tone.id"
                    cols="12" 
                    md="6"
                    class="mb-3"
                  >
                    <b-form-radio 
                      :value="tone.id"
                      class="tone-option"
                    >
                      <b-card 
                        class="tone-card h-100"
                        :class="selectedTone === tone.id ? 'selected' : ''"
                        body-class="p-3"
                      >
                        <div class="d-flex align-items-center">
                          <span class="tone-emoji me-3">{{ tone.emoji }}</span>
                          <div>
                            <div class="fw-bold text-white">{{ tone.label }}</div>
                            <div class="small text-muted">{{ tone.description }}</div>
                          </div>
                        </div>
                      </b-card>
                    </b-form-radio>
                  </b-col>
                </b-row>
              </b-form-radio-group>
            </div>

            <!-- Generate Button -->
            <b-button 
              @click="generateRoast"
              :disabled="isLoading"
              variant="danger"
              size="lg"
              class="w-100 mb-4 roast-button"
            >
              <b-spinner v-if="isLoading" small class="me-2"></b-spinner>
              {{ isLoading ? 'Analisando seu gosto musical...' : '🎯 Me julgue agora' }}
            </b-button>

            <!-- Roast Result -->
            <b-card v-if="roastResult" class="roast-result-card mb-3">
              <div class="d-flex align-items-start mb-3">
                <div class="roast-icon me-3">
                  <span class="fs-4">🔥</span>
                </div>
                <div>
                  <h6 class="fw-bold text-white mb-1">Seu Roast Musical</h6>
                  <p class="small text-muted mb-0">Baseado no seu histórico do Spotify</p>
                </div>
              </div>
              
              <p class="text-light lead mb-4">
                {{ roastResult }}
              </p>

              <b-button 
                @click="shareRoast"
                variant="primary"
                size="lg"
                class="w-100 share-button"
              >
                <i class="bi bi-share me-2"></i>
                Compartilhar Roast
              </b-button>
            </b-card>
          </div>
        </b-card>

        <!-- Footer -->
        <div class="text-center mt-4">
          <p class="text-muted small">
            Feito com 💔 e muito sarcasmo • Não levem a sério, é só diversão!
          </p>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #10b981, #34d399, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-card {
  background: rgba(55, 65, 81, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid #374151;
}

.spotify-icon {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spotify-button {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.spotify-button:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: scale(1.05);
}

.user-info-card {
  background: rgba(75, 85, 99, 0.5);
  border: 1px solid #4b5563;
}

.tone-selector .form-check-input {
  display: none;
}

.tone-card {
  background: rgba(75, 85, 99, 0.3);
  border: 2px solid #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tone-card:hover {
  border-color: #6b7280;
  transform: scale(1.05);
}

.tone-card.selected {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

.tone-emoji {
  font-size: 2rem;
}

.roast-button {
  background: linear-gradient(135deg, #ef4444, #ec4899);
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.roast-button:hover {
  background: linear-gradient(135deg, #dc2626, #db2777);
  transform: scale(1.05);
}

.roast-result-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(55, 65, 81, 0.8));
  border: 1px solid #4b5563;
}

.roast-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ef4444, #ec4899);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.share-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.share-button:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: scale(1.05);
}
</style>
