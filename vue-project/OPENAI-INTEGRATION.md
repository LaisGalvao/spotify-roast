# 🤖 Integração OpenAI - Guia de Implementação

## 📋 Visão Geral

Integração da OpenAI API para gerar roasts musicais mais inteligentes e criativos, mantendo o sistema atual como fallback.

## 🔧 Implementação Passo a Passo

### **1. Instalação e Configuração**

```bash
# Instalar dependência da OpenAI
npm install openai

# Atualizar .env
echo "VITE_OPENAI_API_KEY=sk-your-api-key-here" >> .env
```

### **2. Criar Serviço OpenAI**

```javascript
// src/services/openaiService.js
import OpenAI from 'openai'

class OpenAIRoastService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Para uso em frontend
    })
    this.maxRetries = 2
    this.rateLimitDelay = 1000 // 1 segundo entre requests
  }

  // Construir prompt especializado para cada tom
  buildPrompt(tone, musicData) {
    const { topGenres, popularityScore, topArtists, topTracks } = musicData
    
    const toneInstructions = {
      leve: "Crie um roast carinhoso e divertido, como um amigo brincando",
      debochado: "Seja sarcástico e elegante, com ironia sofisticada",
      quebrada: "Use gírias brasileiras, seja direto e sem papas na língua",
      exposed: "Seja psicológico e revelador, mas não cruel",
      poetico: "Use linguagem artística e metáforas musicais profundas"
    }

    return `
Análise do perfil musical:
- Top gêneros: ${topGenres.map(g => g.genre).join(', ')}
- Artista principal: ${topArtists[0]?.name}
- Score de popularidade: ${popularityScore.score}/100 (${popularityScore.category})
- Top música: ${topTracks[0]?.name}

Estilo solicitado: ${tone}
Instrução: ${toneInstructions[tone]}

Crie um roast musical de no máximo 280 caracteres, em português brasileiro, que seja ${tone} sobre esse perfil musical. Seja criativo e específico aos dados fornecidos.
    `.trim()
  }

  // Gerar roast com OpenAI
  async generateRoast(tone, musicData) {
    try {
      await this.rateLimitCheck()
      
      const prompt = this.buildPrompt(tone, musicData)
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um crítico musical especialista em criar roasts divertidos sobre gosto musical. Seja criativo, específico e mantenha o tom solicitado."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      this.updateRateLimit()
      
      const roast = response.choices[0].message.content.trim()
      
      // Validar se o roast tem qualidade mínima
      if (this.validateRoast(roast, musicData)) {
        return roast
      } else {
        throw new Error('Generated roast did not meet quality standards')
      }
      
    } catch (error) {
      console.error('OpenAI Generation Error:', error)
      throw error
    }
  }

  // Validar qualidade do roast gerado
  validateRoast(roast, musicData) {
    if (!roast || roast.length < 50) return false
    
    // Verificar se menciona pelo menos um elemento dos dados musicais
    const hasArtist = musicData.topArtists.some(artist => 
      roast.toLowerCase().includes(artist.name.toLowerCase())
    )
    const hasGenre = musicData.topGenres.some(genre => 
      roast.toLowerCase().includes(genre.genre.toLowerCase())
    )
    
    return hasArtist || hasGenre
  }

  // Rate limiting simples
  async rateLimitCheck() {
    const lastRequest = localStorage.getItem('openai_last_request')
    if (lastRequest) {
      const timeDiff = Date.now() - parseInt(lastRequest)
      if (timeDiff < this.rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeDiff))
      }
    }
  }

  updateRateLimit() {
    localStorage.setItem('openai_last_request', Date.now().toString())
  }

  // Verificar se tem API key configurada
  hasApiKey() {
    return !!import.meta.env.VITE_OPENAI_API_KEY && 
           import.meta.env.VITE_OPENAI_API_KEY !== 'sk-your-api-key-here'
  }
}

export default new OpenAIRoastService()
```

### **3. Serviço Híbrido (Local + OpenAI)**

```javascript
// src/services/hybridAiService.js
import aiRoastService from './aiRoastService.js'
import openaiService from './openaiService.js'

class HybridAIService {
  constructor() {
    this.preferOpenAI = true // Configurável por usuário
    this.fallbackEnabled = true
  }

  async generateRoast(tone, musicData, forceOpenAI = false) {
    const useOpenAI = (forceOpenAI || this.preferOpenAI) && openaiService.hasApiKey()
    
    if (useOpenAI) {
      try {
        console.log('🤖 Generating roast with OpenAI...')
        const openaiRoast = await openaiService.generateRoast(tone, musicData)
        
        // Log para analytics
        this.logUsage('openai', 'success', tone)
        
        return {
          roast: openaiRoast,
          source: 'OpenAI',
          enhanced: true
        }
      } catch (error) {
        console.warn('OpenAI failed:', error.message)
        this.logUsage('openai', 'error', tone, error.message)
        
        if (!this.fallbackEnabled) {
          throw error
        }
      }
    }

    // Fallback para IA local
    console.log('🧠 Generating roast with local AI...')
    const localRoast = await aiRoastService.generateRoast(tone, musicData)
    
    this.logUsage('local', 'success', tone)
    
    return {
      roast: localRoast,
      source: 'Local AI',
      enhanced: false
    }
  }

  // Sistema de preferências do usuário
  setPreference(useOpenAI) {
    this.preferOpenAI = useOpenAI
    localStorage.setItem('ai_preference', useOpenAI ? 'openai' : 'local')
  }

  getPreference() {
    const saved = localStorage.getItem('ai_preference')
    return saved === 'openai'
  }

  // Analytics simples
  logUsage(source, status, tone, error = null) {
    const log = {
      timestamp: Date.now(),
      source,
      status,
      tone,
      error
    }
    
    const logs = JSON.parse(localStorage.getItem('ai_usage_logs') || '[]')
    logs.push(log)
    
    // Manter apenas últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }
    
    localStorage.setItem('ai_usage_logs', JSON.stringify(logs))
  }

  // Estatísticas de uso
  getUsageStats() {
    const logs = JSON.parse(localStorage.getItem('ai_usage_logs') || '[]')
    
    return {
      total: logs.length,
      openai: logs.filter(l => l.source === 'openai').length,
      local: logs.filter(l => l.source === 'local').length,
      errors: logs.filter(l => l.status === 'error').length,
      lastWeek: logs.filter(l => Date.now() - l.timestamp < 7 * 24 * 60 * 60 * 1000).length
    }
  }
}

export default new HybridAIService()
```

### **4. Atualizar Componente Principal**

```javascript
// src/components/SpotifyRoast.vue (atualização do script)

import hybridAiService from '../services/hybridAiService.js'

// No método generateRoast:
const generateRoast = async () => {
  if (!musicAnalysis.value) {
    alert('Dados musicais ainda não carregados. Tente novamente.')
    return
  }

  isGeneratingRoast.value = true
  roastResult.value = ''
  
  try {
    // Usar sistema híbrido
    const result = await hybridAiService.generateRoast(selectedTone.value, musicAnalysis.value)
    
    roastResult.value = result.roast
    roastSource.value = result.source
    roastEnhanced.value = result.enhanced
    
  } catch (error) {
    console.error('Error generating roast:', error)
    alert(`Erro ao gerar roast: ${error.message}`)
  } finally {
    isGeneratingRoast.value = false
  }
}
```

### **5. Interface de Configuração**

```javascript
// Adicionar toggle no componente
<div class="ai-preference-toggle mb-3">
  <label class="form-check-label">
    <input 
      type="checkbox" 
      :checked="useOpenAI" 
      @change="toggleAIPreference"
      class="form-check-input"
    >
    🤖 Usar OpenAI (roasts mais criativos)
  </label>
  <small class="text-muted d-block">
    OpenAI gera roasts únicos, IA local é mais rápida
  </small>
</div>
```

## 🔒 Considerações de Segurança

### **Para Produção:**
1. **Mover API key para backend**
2. **Implementar proxy endpoint**
3. **Rate limiting por usuário**
4. **Moderação de conteúdo**

### **Backend Endpoint Exemplo:**
```javascript
// api/generate-roast.js (Vercel/Netlify Function)
export default async function handler(req, res) {
  const { tone, musicData } = req.body
  
  // Rate limiting por IP
  // Validação de dados
  // Chamada OpenAI
  // Moderação de conteúdo
  
  res.json({ roast, source: 'openai' })
}
```

## 📊 Monitoramento

### **Métricas Importantes:**
- Custo por request (tokens)
- Taxa de erro OpenAI vs Local
- Satisfação do usuário
- Tempo de resposta médio

### **Dashboard Simples:**
```javascript
// Componente de analytics
const stats = hybridAiService.getUsageStats()
// Exibir estatísticas de uso
```

## 🎯 Benefícios da Integração

1. **Qualidade Superior** - Roasts mais criativos e contextuais
2. **Fallback Robusto** - Sistema local como backup
3. **Flexibilidade** - Usuário pode escolher
4. **Escalabilidade** - Preparado para crescimento
5. **Analytics** - Dados para otimização

---

**Próximo passo:** Implementar o `openaiService.js` e testar com uma API key de desenvolvimento!
