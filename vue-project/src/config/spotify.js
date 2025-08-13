// Configurações do Spotify API
export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your_spotify_client_id_here',
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback',
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read'
  ],
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  API_BASE_URL: 'https://api.spotify.com/v1'
}

// URLs específicas da API
export const SPOTIFY_ENDPOINTS = {
  ME: '/me',
  PLAYLISTS: '/me/playlists',
  TOP_TRACKS: '/me/top/tracks',
  TOP_ARTISTS: '/me/top/artists',
  RECENTLY_PLAYED: '/me/player/recently-played',
  SAVED_TRACKS: '/me/tracks'
}
