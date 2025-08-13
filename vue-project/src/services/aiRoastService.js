// Serviço de IA para geração de roasts musicais
class AIRoastService {
  constructor() {
    this.personalityTraits = {
      // Mapeamento de gêneros para traços de personalidade
      genrePersonality: {
        'pop': { mainstream: 1, energy: 0.7, emotional: 0.6 },
        'rock': { mainstream: 0.6, energy: 0.9, emotional: 0.7 },
        'hip hop': { mainstream: 0.8, energy: 0.8, emotional: 0.6 },
        'rap': { mainstream: 0.8, energy: 0.8, emotional: 0.6 },
        'electronic': { mainstream: 0.4, energy: 0.9, emotional: 0.3 },
        'indie': { mainstream: 0.2, energy: 0.5, emotional: 0.8 },
        'alternative': { mainstream: 0.3, energy: 0.6, emotional: 0.8 },
        'jazz': { mainstream: 0.1, energy: 0.4, emotional: 0.9 },
        'classical': { mainstream: 0.1, energy: 0.3, emotional: 0.9 },
        'r&b': { mainstream: 0.7, energy: 0.6, emotional: 0.8 },
        'soul': { mainstream: 0.4, energy: 0.5, emotional: 0.9 },
        'reggae': { mainstream: 0.3, energy: 0.5, emotional: 0.7 },
        'country': { mainstream: 0.6, energy: 0.5, emotional: 0.8 },
        'folk': { mainstream: 0.2, energy: 0.3, emotional: 0.9 },
        'punk': { mainstream: 0.2, energy: 1.0, emotional: 0.8 },
        'metal': { mainstream: 0.3, energy: 1.0, emotional: 0.7 },
        'funk': { mainstream: 0.4, energy: 0.9, emotional: 0.6 },
        'blues': { mainstream: 0.3, energy: 0.4, emotional: 0.9 },
        'ambient': { mainstream: 0.1, energy: 0.1, emotional: 0.8 },
        'techno': { mainstream: 0.3, energy: 1.0, emotional: 0.2 }
      }
    }
  }

  // Analisar perfil psicológico baseado em dados musicais
  analyzePersonality(musicData) {
    const { topGenres, popularityScore, topArtists } = musicData

    // Calcular scores de personalidade
    let mainstreamScore = 0
    let energyScore = 0
    let emotionalScore = 0
    let diversityScore = 0

    // Analisar gêneros
    topGenres.forEach((genre, index) => {
      const weight = (topGenres.length - index) / topGenres.length
      const genreData = this.findGenreData(genre.genre.toLowerCase())
      
      if (genreData) {
        mainstreamScore += genreData.mainstream * weight
        energyScore += genreData.energy * weight
        emotionalScore += genreData.emotional * weight
      }
    })

    // Normalizar scores
    mainstreamScore = Math.min(1, mainstreamScore)
    energyScore = Math.min(1, energyScore)
    emotionalScore = Math.min(1, emotionalScore)

    // Calcular diversidade (quantos gêneros diferentes)
    diversityScore = Math.min(1, topGenres.length / 10)

    // Usar score de popularidade do Spotify
    const spotifyMainstream = popularityScore.score / 100

    return {
      mainstream: (mainstreamScore + spotifyMainstream) / 2,
      energy: energyScore,
      emotional: emotionalScore,
      diversity: diversityScore,
      category: popularityScore.category,
      dominantGenre: topGenres[0]?.genre || 'desconhecido',
      topArtist: topArtists[0]?.name || 'artista misterioso'
    }
  }

  // Encontrar dados do gênero (com fuzzy matching)
  findGenreData(genre) {
    // Busca exata
    if (this.personalityTraits.genrePersonality[genre]) {
      return this.personalityTraits.genrePersonality[genre]
    }

    // Busca por palavras-chave
    for (const [key, data] of Object.entries(this.personalityTraits.genrePersonality)) {
      if (genre.includes(key) || key.includes(genre)) {
        return data
      }
    }

    // Padrão para gêneros desconhecidos
    return { mainstream: 0.5, energy: 0.5, emotional: 0.5 }
  }

  // Gerar roast usando IA baseada em personalidade
  generateIntelligentRoast(tone, musicData) {
    const personality = this.analyzePersonality(musicData)
    const templates = this.getRoastTemplates(tone)
    
    // Escolher template baseado na personalidade
    const template = this.selectTemplate(templates, personality)
    
    // Preencher template com dados personalizados
    return this.populateTemplate(template, musicData, personality)
  }

  // Templates de roast por tom
  getRoastTemplates(tone) {
    const templates = {
      leve: [
        {
          condition: (p) => p.mainstream > 0.8,
          template: "Seu gosto musical é tipo menu de McDonald's - todo mundo conhece, é confiável, mas não vai ganhar prêmio Michelin. Você ouve {topArtist} como se fosse seu trabalho, e olha... pelo menos você é consistente! {dominantGenre} é sua zona de conforto há uns {estimatedYears} anos. 🎵"
        },
        {
          condition: (p) => p.mainstream < 0.3,
          template: "Wow, você descobriu {dominantGenre} antes de todo mundo, né? Seu gosto é tão underground que nem o Spotify sabe como categorizar. {topArtist} deve te amar - você e mais 3 pessoas no mundo inteiro ouvem eles! Hipster level: máximo. 🎧"
        },
        {
          condition: (p) => p.emotional > 0.7,
          template: "Sua playlist é basicamente uma sessão de terapia disfarçada de {dominantGenre}. {topArtist} vira seu psicólogo pessoal toda vez que você aperta play. Pelo menos você economiza dinheiro em autoajuda! 💙"
        },
        {
          condition: () => true,
          template: "Seus dados musicais contam uma história... e essa história é que você tem gosto de {category.toLowerCase()}! {dominantGenre} é claramente sua linguagem do amor. Continue assim, pelo menos você sabe o que gosta! 🎶"
        }
      ],

      debochado: [
        {
          condition: (p) => p.mainstream > 0.8,
          template: "Querido(a), sua playlist tem a personalidade de um shopping center. {topArtist} no repeat? Que corajoso! Você tem o dom de escolher exatamente o que 50 milhões de pessoas já ouviram hoje. {dominantGenre} mainstream é sua marca registrada - que originalidade impressionante! 💅✨"
        },
        {
          condition: (p) => p.mainstream < 0.3,
          template: "Ah, olha só quem descobriu {dominantGenre} antes de virar moda! Você ouve {topArtist} com aquela cara de 'vocês não entenderiam'. Sweetie, ser diferente só por ser diferente não é personalidade, é carência. Mas hey, pelo menos você se sente especial! 🎭"
        },
        {
          condition: (p) => p.diversity < 0.3,
          template: "Diversidade musical? Never heard of it! Você conseguiu transformar {dominantGenre} em sua religião pessoal. {topArtist} deve estar pagando suas contas de tanto que você ouve. Variar é assustador mesmo, né amor? 💅"
        },
        {
          condition: () => true,
          template: "Sua vibe {category.toLowerCase()} está gritando mais alto que suas inseguranças, darling! {dominantGenre} é seu mecanismo de defesa musical. Todo mundo vê que você está tentando passar uma imagem... que transparente! 😘"
        }
      ],

      quebrada: [
        {
          condition: (p) => p.mainstream > 0.8,
          template: "Mano, tu ouve {topArtist} como se fosse hino nacional! {dominantGenre} mainstream é tua praia, né? Relaxa aí, não precisa fingir que tem gosto diferentão. Todo mundo sabe que tu é mais do mesmo. Pelo menos assume! 💥"
        },
        {
          condition: (p) => p.energy > 0.8,
          template: "Peraí, tu só ouve música que parece que vai quebrar o fone? {dominantGenre} no último volume, né mano? {topArtist} deve ser tua válvula de escape. Respira, vai dar tudo certo! 🔊"
        },
        {
          condition: (p) => p.diversity < 0.4,
          template: "Cara, {dominantGenre} é literalmente 90% da tua playlist. Tu não enjoa não? {topArtist} deve ter você como fã número 1 - e talvez único. Varia um pouco, parceiro! 🎧"
        },
        {
          condition: () => true,
          template: "Teu gosto {category.toLowerCase()} é tipo aquele amigo que só fala de futebol - todo mundo já sabe qual vai ser o papo. {dominantGenre} é tua marca registrada há anos. Inova aí! 🚀"
        }
      ],

      exposed: [
        {
          condition: (p) => p.emotional > 0.7,
          template: "Sua playlist é um mapa emocional dos seus traumas não resolvidos. Cada música de {dominantGenre} grita 'preciso processar algo' mais alto que a anterior. {topArtist} virou seu terapeuta musical gratuito. O Spotify deveria vir com disclaimer: 'Este usuário está passando por uma fase'. 💔"
        },
        {
          condition: (p) => p.mainstream > 0.8,
          template: "Amor, sua necessidade de validação está mais óbvia que LED piscando. Você ouve {topArtist} porque TODO MUNDO ouve, não porque gosta de verdade. Seu medo de ser diferente transparece até na escolha de {dominantGenre}. Que insegurança é essa? 🔥"
        },
        {
          condition: (p) => p.diversity < 0.3,
          template: "Você tem MEDO de sair da zona de conforto musical! {dominantGenre} é seu cobertor emocional há anos. {topArtist} representa tudo que você gostaria de ser mas não tem coragem. Sua playlist grita 'estou preso no passado' mais alto que você admite. 😱"
        },
        {
          condition: () => true,
          template: "Sua identidade {category.toLowerCase()} é uma armadura contra vulnerabilidade. {dominantGenre} é onde você se esconde quando a realidade aperta. Todo mundo vê que você usa música para evitar confrontar quem realmente é. Que defensivo! 🎭"
        }
      ],

      poetico: [
        {
          condition: (p) => p.emotional > 0.7,
          template: "Tua alma dança em frequências de {dominantGenre}, onde cada acorde ecoa os sussurros melancólicos da existência. {topArtist} não é apenas som, é o eco poético da tua busca interior. Tu não ouves música, tu habitas universos sonoros que poucos mortais compreendem. És um(a) poeta do play button. 🌈"
        },
        {
          condition: (p) => p.mainstream < 0.4,
          template: "Tu navegas pelos oceanos inexplorados do {dominantGenre}, como um(a) arqueólogo(a) de melodias esquecidas. {topArtist} ressoa em câmaras secretas do coração onde habitam as verdades não ditas. Tua playlist é um manifesto contra a uniformidade sonora do mundo. Que bela rebeldia estética! ✨"
        },
        {
          condition: (p) => p.diversity > 0.6,
          template: "Tua jornada musical transcende as fronteiras do {dominantGenre}, abraçando a pluralidade como filosofia de vida. {topArtist} é apenas uma estação nesta viagem cósmica pelos territórios inexplorados da sensibilidade humana. És um(a) colecionador(a) de emoções em formato digital. 🎭"
        },
        {
          condition: () => true,
          template: "Nas ondas etéreas do {dominantGenre}, tua essência {category.toLowerCase()} encontra abrigo. {topArtist} ecoa pelos corredores da tua melancolia existencial, transformando algoritmos em poesia. Tu não consomes música - tu comungias com ela em rituais sagrados do sentir. 🌙"
        }
      ]
    }

    return templates[tone] || templates.leve
  }

  // Selecionar template baseado na personalidade
  selectTemplate(templates, personality) {
    for (const template of templates) {
      if (template.condition(personality)) {
        return template
      }
    }
    return templates[templates.length - 1] // fallback
  }

  // Preencher template com dados reais
  populateTemplate(template, musicData, personality) {
    let roast = template.template

    // Substituir placeholders
    roast = roast.replace(/{topArtist}/g, musicData.topArtists[0]?.name || 'seu artista favorito')
    roast = roast.replace(/{dominantGenre}/g, personality.dominantGenre)
    roast = roast.replace(/{category}/g, personality.category)
    
    // Estimar anos baseado na popularidade (mais popular = mais tempo ouvindo)
    const estimatedYears = Math.max(1, Math.floor(personality.mainstream * 5))
    roast = roast.replace(/{estimatedYears}/g, estimatedYears)

    return roast
  }

  // Método principal para gerar roast
  async generateRoast(tone, musicData) {
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      return this.generateIntelligentRoast(tone, musicData)
    } catch (error) {
      console.error('Error generating AI roast:', error)
      // Fallback para templates simples
      return this.generateFallbackRoast(tone, musicData)
    }
  }

  // Fallback simples caso a IA falhe
  generateFallbackRoast(tone, musicData) {
    const { topArtists, topGenres, popularityScore } = musicData
    
    const fallbacks = {
      leve: `Seu gosto musical é interessante! ${topArtists[0]?.name || 'Seus artistas favoritos'} e ${topGenres[0]?.genre || 'seus gêneros'} mostram que você tem personalidade. Score ${popularityScore.score}/100 - nada mal! 🎵`,
      debochado: `Querido, ${popularityScore.category.toLowerCase()} é mesmo seu middle name! ${topArtists[0]?.name || 'Suas escolhas musicais'} são... únicas. Que icônico! 💅`,
      quebrada: `Mano, ${topGenres[0]?.genre || 'teu estilo'} é sua vibe mesmo! ${topArtists[0]?.name || 'Teus artistas'} no repeat, né? Relaxa! 💥`,
      exposed: `Sua playlist de ${topGenres[0]?.genre || 'música'} grita muito sobre quem você é! ${popularityScore.category} com orgulho! 🔥`,
      poetico: `Tua alma ressoa em ${topGenres[0]?.genre || 'frequências musicais'} onde ${topArtists[0]?.name || 'teus artistas'} dançam como poesia sonora. 🌈`
    }
    
    return fallbacks[tone] || fallbacks.leve
  }
}

export default new AIRoastService()
