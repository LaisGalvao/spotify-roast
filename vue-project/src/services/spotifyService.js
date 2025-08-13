import axios from 'axios'
import { SPOTIFY_CONFIG, SPOTIFY_ENDPOINTS } from '../config/spotify.js'

class SpotifyService {
  constructor() {
    this.accessToken = localStorage.getItem('spotify_access_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
    this.tokenExpiry = localStorage.getItem('spotify_token_expiry')
    this.codeVerifier = localStorage.getItem('spotify_code_verifier')
    
    // Configurar axios instance
    this.api = axios.create({
      baseURL: SPOTIFY_CONFIG.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })

    // Interceptor para tratar erros de token expirado
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken()
            // Retry the original request
            error.config.headers.Authorization = `Bearer ${this.accessToken}`
            return this.api.request(error.config)
          } catch (refreshError) {
            this.logout()
            throw refreshError
          }
        }
        throw error
      }
    )
  }

  // Gerar code verifier e challenge para PKCE
  generateCodeVerifier() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Gerar URL de autorização com PKCE
  async getAuthUrl() {
    try {
      // Validar configurações
      if (!SPOTIFY_CONFIG.CLIENT_ID || SPOTIFY_CONFIG.CLIENT_ID === 'your_spotify_client_id_here') {
        throw new Error('SPOTIFY_CLIENT_ID não configurado no .env')
      }
      
      if (!SPOTIFY_CONFIG.REDIRECT_URI) {
        throw new Error('SPOTIFY_REDIRECT_URI não configurado no .env')
      }

      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      
      // Salvar code verifier para usar na troca de token
      localStorage.setItem('spotify_code_verifier', codeVerifier)
      
      // Gerar um state único para segurança
      const state = this.generateCodeVerifier().substring(0, 16)
      localStorage.setItem('spotify_auth_state', state)
      
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CONFIG.CLIENT_ID,
        scope: SPOTIFY_CONFIG.SCOPES.join(' '),
        redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        state: state
      })

      const authUrl = `${SPOTIFY_CONFIG.AUTH_URL}?${params.toString()}`
      
      console.log('Auth URL params:', {
        client_id: SPOTIFY_CONFIG.CLIENT_ID,
        redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
        scopes: SPOTIFY_CONFIG.SCOPES.join(' '),
        code_challenge: codeChallenge.substring(0, 10) + '...',
        state: state
      })
      
      return authUrl
    } catch (error) {
      console.error('Error generating auth URL:', error)
      throw error
    }
  }

  // Trocar código de autorização por token usando PKCE
  async exchangeCodeForToken(code) {
    try {
      const codeVerifier = localStorage.getItem('spotify_code_verifier')
      if (!codeVerifier) {
        throw new Error('Code verifier not found')
      }

      console.log('Exchanging code for token...', { code: code.substring(0, 20) + '...', codeVerifier: codeVerifier.substring(0, 10) + '...' })

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
          code_verifier: codeVerifier
        })
      })

      const data = await response.json()
      console.log('Token exchange response:', { 
        ok: response.ok, 
        status: response.status,
        hasAccessToken: !!data.access_token,
        error: data.error 
      })

      if (!response.ok) {
        console.error('Token exchange error details:', data)
        throw new Error(`Failed to exchange code for token: ${data.error_description || data.error}`)
      }

      this.setTokens(data)
      
      // Limpar code verifier após uso
      localStorage.removeItem('spotify_code_verifier')
      
      return data
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      throw error
    }
  }

  // Atualizar access token usando refresh token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: SPOTIFY_CONFIG.CLIENT_ID
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      this.setTokens(data)
      return data
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }

  // Salvar tokens no localStorage
  setTokens(tokenData) {
    console.log('Setting tokens:', { 
      access_token: tokenData.access_token?.substring(0, 20) + '...',
      refresh_token: !!tokenData.refresh_token,
      expires_in: tokenData.expires_in 
    })
    
    this.accessToken = tokenData.access_token
    
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token
      localStorage.setItem('spotify_refresh_token', this.refreshToken)
    }

    // Calcular tempo de expiração (em ms)
    const expiryTime = Date.now() + (tokenData.expires_in * 1000)
    this.tokenExpiry = expiryTime

    localStorage.setItem('spotify_access_token', this.accessToken)
    localStorage.setItem('spotify_token_expiry', expiryTime.toString())
    
    console.log('Tokens set successfully, access token available:', !!this.accessToken)
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry)
  }

  // Fazer logout
  logout() {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = null
    this.codeVerifier = null
    
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiry')
    localStorage.removeItem('spotify_code_verifier')
    localStorage.removeItem('spotify_auth_state')
  }

  // Obter perfil do usuário
  async getUserProfile() {
    try {
      console.log('Getting user profile with token:', this.accessToken?.substring(0, 20) + '...')
      const response = await this.api.get(SPOTIFY_ENDPOINTS.USER_PROFILE)
      console.log('User profile response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting user profile:', error.response?.data || error)
      throw error
    }
  }

  // Obter playlists do usuário
  async getUserPlaylists(limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.USER_PLAYLISTS, {
      params: { limit }
    })
    return response.data
  }

  // Obter top tracks do usuário
  async getTopTracks(timeRange = 'medium_term', limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.TOP_TRACKS, {
      params: { time_range: timeRange, limit }
    })
    return response.data
  }

  // Obter top artists do usuário
  async getTopArtists(timeRange = 'medium_term', limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.TOP_ARTISTS, {
      params: { time_range: timeRange, limit }
    })
    return response.data
  }

  // Analisar dados musicais do usuário
  async analyzeUserMusic() {
    try {
      // Buscar dados em paralelo
      const [profile, shortTermTracks, mediumTermTracks, longTermTracks, shortTermArtists, mediumTermArtists, longTermArtists] = await Promise.all([
        this.getUserProfile(),
        this.getTopTracks('short_term', 20),
        this.getTopTracks('medium_term', 20),
        this.getTopTracks('long_term', 20),
        this.getTopArtists('short_term', 20),
        this.getTopArtists('medium_term', 20),
        this.getTopArtists('long_term', 20)
      ])

      // Combinar todos os artistas
      const allArtists = [
        ...shortTermArtists.items,
        ...mediumTermArtists.items,
        ...longTermArtists.items
      ]

      // Combinar todas as tracks
      const allTracks = [
        ...shortTermTracks.items,
        ...mediumTermTracks.items,
        ...longTermTracks.items
      ]

      // Analisar gêneros
      const genreCount = {}
      allArtists.forEach(artist => {
        artist.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1
        })
      })

      const topGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }))

      // Calcular score de popularidade
      const popularityScores = allTracks.map(track => track.popularity)
      const avgPopularity = popularityScores.reduce((a, b) => a + b, 0) / popularityScores.length

      let category = 'Mainstream'
      if (avgPopularity < 30) category = 'Underground'
      else if (avgPopularity < 50) category = 'Indie'
      else if (avgPopularity < 70) category = 'Popular'

      // Top artistas únicos
      const uniqueArtists = Array.from(
        new Map(allArtists.map(artist => [artist.id, artist])).values()
      ).slice(0, 10)

      // Top tracks únicas
      const uniqueTracks = Array.from(
        new Map(allTracks.map(track => [track.id, track])).values()
      ).slice(0, 10)

      return {
        profile,
        analysis: {
          topGenres,
          popularityScore: {
            score: Math.round(avgPopularity),
            category
          },
          topArtists: uniqueArtists,
          topTracks: uniqueTracks,
          timeRanges: {
            short: { tracks: shortTermTracks.items, artists: shortTermArtists.items },
            medium: { tracks: mediumTermTracks.items, artists: mediumTermArtists.items },
            long: { tracks: longTermTracks.items, artists: longTermArtists.items }
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing user music:', error)
      throw error
    }
  }
}

export default new SpotifyService()
