import OpenAI from 'openai'

class OpenAIRoastService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Para frontend
    })
  }
  
  buildPrompt(tone, musicData) {
    const { topArtists, topGenres, audioFeatures, profile } = musicData
    
    const toneInstructions = {
      'leve': 'Seja carinhoso e divertido, como um amigo próximo fazendo uma brincadeira',
      'debochado': 'Use sarcasmo refinado e ironia inteligente',
      'quebrada': 'Seja direto e brutal, mas ainda engraçado',
      'exposed': 'Faça uma análise psicológica reveladora através da música',
      'poetico': 'Use linguagem poética e filosófica sobre as escolhas musicais'
    }
    
    return `
Tom: ${toneInstructions[tone]}

Dados do usuário:
- Nome: ${profile?.display_name || 'Usuário'}
- Artistas favoritos: ${topArtists?.slice(0, 5).map(a => a.name).join(', ') || 'Não disponível'}
- Gêneros principais: ${topGenres?.slice(0, 3).join(', ') || 'Não disponível'}
- Características da música: ${audioFeatures ? `Energia: ${Math.round(audioFeatures.energy * 100)}%, Danceabilidade: ${Math.round(audioFeatures.danceability * 100)}%, Valência: ${Math.round(audioFeatures.valence * 100)}%` : 'Não disponível'}

Crie um roast divertido e personalizado sobre o gosto musical desta pessoa. Máximo 2-3 frases. Seja criativo e específico com base nos dados fornecidos.
    `.trim()
  }
  
  async generateRoast(tone, musicData, maxTokens = 150) {
    const prompt = this.buildPrompt(tone, musicData)
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um crítico musical especialista em roasts criativos e divertidos sobre gosto musical. Responda sempre em português brasileiro."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
        presence_penalty: 0.1
      })
      
      return response.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw error
    }
  }
  
  // Método para verificar se a API está disponível
  async isAvailable() {
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        return false
      }
      
      // Teste simples com baixo custo
      await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1
      })
      
      return true
    } catch (error) {
      console.warn('OpenAI not available:', error.message)
      return false
    }
  }
}

export default new OpenAIRoastService()