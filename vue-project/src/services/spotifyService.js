import axios from 'axios'
import { SPOTIFY_CONFIG, SPOTIFY_ENDPOINTS } from '../config/spotify.js'

class SpotifyService {
  constructor() {
    this.accessToken = localStorage.getItem('spotify_access_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
    this.tokenExpiry = localStorage.getItem('spotify_token_expiry')
    
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

  // Gerar URL de autorização do Spotify
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      scope: SPOTIFY_CONFIG.SCOPES,
      state: this.generateRandomString(16)
    })

    return `${SPOTIFY_CONFIG.AUTH_URL}?${params.toString()}`
  }

  // Gerar string aleatória para state
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Trocar código de autorização por access token
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
          client_id: SPOTIFY_CONFIG.CLIENT_ID
        })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      this.setTokens(data)
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
    this.accessToken = tokenData.access_token
    
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token
      localStorage.setItem('spotify_refresh_token', this.refreshToken)
    }

    const expiryTime = Date.now() + (tokenData.expires_in * 1000)
    this.tokenExpiry = expiryTime

    localStorage.setItem('spotify_access_token', this.accessToken)
    localStorage.setItem('spotify_token_expiry', expiryTime.toString())
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
    
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiry')
  }

  // Obter dados do usuário
  async getUserProfile() {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.ME)
    return response.data
  }

  // Obter playlists do usuário
  async getUserPlaylists(limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.PLAYLISTS, {
      params: { limit }
    })
    return response.data
  }

  // Obter top tracks do usuário
  async getTopTracks(timeRange = 'medium_term', limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.TOP_TRACKS, {
      params: { 
        time_range: timeRange, // short_term, medium_term, long_term
        limit 
      }
    })
    return response.data
  }

  // Obter top artists do usuário
  async getTopArtists(timeRange = 'medium_term', limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.TOP_ARTISTS, {
      params: { 
        time_range: timeRange,
        limit 
      }
    })
    return response.data
  }

  // Obter músicas tocadas recentemente
  async getRecentlyPlayed(limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.RECENTLY_PLAYED, {
      params: { limit }
    })
    return response.data
  }

  // Obter tracks salvos (curtidas)
  async getSavedTracks(limit = 50) {
    const response = await this.api.get(SPOTIFY_ENDPOINTS.SAVED_TRACKS, {
      params: { limit }
    })
    return response.data
  }

  // Analisar dados musicais para gerar insights
  async analyzeUserMusic() {
    try {
      const [profile, topTracks, topArtists, recentTracks] = await Promise.all([
        this.getUserProfile(),
        this.getTopTracks('medium_term', 20),
        this.getTopArtists('medium_term', 20),
        this.getRecentlyPlayed(20)
      ])

      return {
        profile,
        analysis: {
          topGenres: this.extractTopGenres(topArtists.items),
          musicDiversity: this.calculateMusicDiversity(topArtists.items),
          popularityScore: this.calculatePopularityScore(topTracks.items),
          recentActivity: recentTracks.items.length,
          topArtists: topArtists.items.map(artist => ({
            name: artist.name,
            genres: artist.genres,
            popularity: artist.popularity
          })),
          topTracks: topTracks.items.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            popularity: track.popularity
          }))
        }
      }
    } catch (error) {
      console.error('Error analyzing user music:', error)
      throw error
    }
  }

  // Extrair gêneros mais populares
  extractTopGenres(artists) {
    const genreCount = {}
    
    artists.forEach(artist => {
      artist.genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1
      })
    })

    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }))
  }

  // Calcular diversidade musical
  calculateMusicDiversity(artists) {
    const uniqueGenres = new Set()
    artists.forEach(artist => {
      artist.genres.forEach(genre => uniqueGenres.add(genre))
    })
    
    return {
      totalGenres: uniqueGenres.size,
      averageGenresPerArtist: artists.reduce((sum, artist) => sum + artist.genres.length, 0) / artists.length
    }
  }

  // Calcular score de popularidade
  calculatePopularityScore(tracks) {
    const avgPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length
    
    let category = 'Mainstream'
    if (avgPopularity < 30) category = 'Underground'
    else if (avgPopularity < 60) category = 'Indie'
    else if (avgPopularity < 80) category = 'Popular'
    
    return {
      score: Math.round(avgPopularity),
      category
    }
  }
}

export default new SpotifyService()
