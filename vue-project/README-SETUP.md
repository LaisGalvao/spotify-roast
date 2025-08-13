# Spotify Roast 🎵🔥

Uma aplicação divertida que analisa seu gosto musical do Spotify e gera roasts personalizados com base nos seus dados musicais.

## 🚀 Como Configurar

### 1. Configuração do Spotify Developer

1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Faça login com sua conta Spotify
3. Clique em "Create an app"
4. Preencha as informações:
   - **App name**: Spotify Roast
   - **App description**: Aplicação para análise musical
   - **Website**: http://localhost:5173
   - **Redirect URI**: `http://localhost:5173/callback`
5. Aceite os termos e crie o app
6. Copie o **Client ID** que aparecerá na página do app

### 2. Configuração das Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e substitua as variáveis:
   ```env
   VITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```

### 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🎯 Como Funciona

1. **Conecte sua conta**: Clique em "Conectar com Spotify" e autorize o acesso
2. **Análise automática**: A aplicação analisa seus dados musicais (artistas favoritos, gêneros, popularidade)
3. **Escolha o tom**: Selecione o estilo do roast (leve, debochado, quebrada, exposed, poético)
4. **Receba seu roast**: Um roast personalizado baseado nos seus dados reais do Spotify
5. **Compartilhe**: Copie e compartilhe com os amigos!

## 🛠️ Tecnologias Utilizadas

- **Vue 3** - Framework frontend
- **Vite** - Build tool
- **BootstrapVue 3** - Componentes UI
- **Axios** - Cliente HTTP
- **Spotify Web API** - Integração com Spotify

## 📊 Dados Analisados

A aplicação analisa:
- ✅ Top artistas (curto, médio e longo prazo)
- ✅ Top músicas (curto, médio e longo prazo) 
- ✅ Gêneros musicais preferidos
- ✅ Score de popularidade (mainstream vs underground)
- ✅ Perfil do usuário (nome, foto, seguidores)

## 🔒 Privacidade

- Os dados são acessados apenas durante a sessão
- Nenhuma informação é armazenada em servidores
- Tokens de acesso ficam apenas no localStorage do navegador
- A aplicação usa apenas permissões de leitura do Spotify

## 🎨 Estilos de Roast

- **Leve**: Brincadeiras carinhosas sobre seu gosto musical
- **Debochado**: Ironia sofisticada sobre suas escolhas
- **Quebrada**: Roast no estilo brasileiro direto
- **Exposed**: Análise psicológica através da música
- **Poético**: Críticas em formato artístico e melancólico

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é open source e está disponível sob a [MIT License](LICENSE).

---

Feito com ❤️ e muito humor musical 🎵
