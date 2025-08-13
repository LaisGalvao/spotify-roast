# 🔧 Solucionando Erro de Autenticação OAuth Spotify

## 🚨 Problema Identificado

O erro `400 Bad Request` na autenticação OAuth do Spotify estava ocorrendo por **duas razões principais**:

### 1. **Fluxo OAuth Incorreto**
- ❌ **Antes**: Usando Authorization Code Flow sem PKCE
- ✅ **Agora**: Usando Authorization Code with PKCE (recomendado para SPAs)

### 2. **URL de Redirecionamento**
- ❌ **Problema**: URL não configurada no Spotify Developer Dashboard
- ✅ **Solução**: Configurar URL correta no dashboard

## 🛠️ Correções Implementadas

### **1. Implementação PKCE (Proof Key for Code Exchange)**

```javascript
// Novo fluxo com PKCE
generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
```

### **2. Método de Troca de Token Atualizado**

```javascript
async exchangeCodeForToken(code) {
  const codeVerifier = localStorage.getItem('spotify_code_verifier')
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      code_verifier: codeVerifier // ← PKCE key!
    })
  })
}
```

### **3. Melhor Tratamento de Erros**

```javascript
if (!response.ok) {
  const errorData = await response.json()
  console.error('Token exchange error:', errorData)
  throw new Error(`Failed to exchange code for token: ${errorData.error_description || errorData.error}`)
}
```

## 📋 Configuração Necessária no Spotify

### **1. Acesse o Spotify Developer Dashboard**
- URL: https://developer.spotify.com/dashboard/
- Faça login com sua conta Spotify

### **2. Configure a URL de Redirecionamento**

No seu app Spotify, adicione esta URL exata:
```
https://symmetrical-telegram-jrxjj6rj57ghwvp-5173.app.github.dev/callback
```

### **3. Configurações Recomendadas**
- **App Type**: Web Application
- **Website**: `https://symmetrical-telegram-jrxjj6rj57ghwvp-5173.app.github.dev`
- **Redirect URIs**: 
  - `https://symmetrical-telegram-jrxjj6rj57ghwvp-5173.app.github.dev/callback`
  - `http://localhost:5173/callback` (para desenvolvimento local)

## 🎯 Como Testar

### **1. Verificar Configuração**
```bash
# No terminal, verificar se as variáveis estão corretas:
echo $VITE_SPOTIFY_CLIENT_ID
echo $VITE_SPOTIFY_REDIRECT_URI
```

### **2. Testar Fluxo OAuth**
1. Abrir a aplicação
2. Clicar em "Conectar com Spotify"
3. Autorizar na página do Spotify
4. Verificar se volta para a aplicação com sucesso

### **3. Verificar no Console**
- ✅ Deve aparecer: "User data loaded successfully"
- ❌ Se aparecer erro: Verificar configurações do dashboard

## 🔍 Debug de Problemas

### **Se ainda der erro 400:**

1. **Verificar URL no Dashboard**
   ```
   Redirect URI deve ser EXATAMENTE:
   https://symmetrical-telegram-jrxjj6rj57ghwvp-5173.app.github.dev/callback
   ```

2. **Verificar Client ID**
   ```bash
   # No console da aplicação
   console.log(import.meta.env.VITE_SPOTIFY_CLIENT_ID)
   ```

3. **Limpar Cache**
   ```javascript
   // No console do navegador
   localStorage.clear()
   ```

### **Se der erro 401:**
- Verificar se o Client ID está correto
- Verificar se as permissões (scopes) estão configuradas

### **Se der erro de CORS:**
- Verificar se o domínio está autorizado no Spotify Dashboard

## ✅ Status da Correção

- 🔧 **PKCE implementado**: Fluxo OAuth seguro
- 🔧 **Tratamento de erro melhorado**: Logs detalhados
- 🔧 **Code verifier limpo**: Após uso
- 🔧 **Configuração atualizada**: Arrays de scopes corrigidos
- 📝 **Documentação criada**: Instruções claras

## 🚀 Próximos Passos

1. **Configure a URL no Spotify Dashboard** ⬅️ **CRÍTICO**
2. Teste a autenticação
3. Verifique se os dados do usuário carregam
4. Teste a geração de roasts com IA

---

**⚠️ IMPORTANTE**: O erro só será resolvido completamente após configurar a URL de redirecionamento no Spotify Developer Dashboard!
