class HybridAIService {
  async generateRoast(tone, musicData, useOpenAI = false) {
    if (useOpenAI && this.hasOpenAIKey()) {
      try {
        return await openaiService.generateRoast(tone, musicData)
      } catch (error) {
        console.warn('OpenAI failed, falling back to local AI')
        return await aiRoastService.generateRoast(tone, musicData)
      }
    }
    
    return await aiRoastService.generateRoast(tone, musicData)
  }