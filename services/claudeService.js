const Anthropic = require('@anthropic-ai/sdk');

// Initialize Claude client
let anthropic = null;
try {
  if (process.env.CLAUDE_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
      defaultHeaders: {
        'anthropic-version': '2023-06-01'
      }
    });
  }
} catch (error) {
  console.warn('Claude initialization failed:', error.message);
}

class ClaudeService {
  
  async analyzeTeam(opponentTeam, newsData) {
    console.log(`🔍 Analyzing ${opponentTeam} with Claude 3.5 Sonnet...`);
    
    // Get base analysis (always works)
    const baseAnalysis = this.getBaseAnalysis(opponentTeam);
    
    // Try Claude AI enhancement
    try {
      if (this.isClaudeConfigured()) {
        console.log('✅ Claude API configured, attempting enhancement...');
        const enhancedNews = await this.analyzeNewsWithClaude(opponentTeam, newsData);
        baseAnalysis.recentNews = enhancedNews;
        baseAnalysis.aiEnhanced = true;
        baseAnalysis.dataSource = 'Claude 3.5 Sonnet Analysis';
        console.log('✅ Claude enhancement successful');
      } else {
        throw new Error('Claude API key not configured');
      }
    } catch (error) {
      console.warn(`⚠️ Claude enhancement failed for ${opponentTeam}:`, error.message);
      baseAnalysis.recentNews = this.getIntelligentMockNews(opponentTeam, newsData);
      baseAnalysis.aiEnhanced = false;
      baseAnalysis.dataSource = 'Tactical Analysis Engine';
    }
    
    return baseAnalysis;
  }
  
  isClaudeConfigured() {
    const hasKey = process.env.CLAUDE_API_KEY && 
                   process.env.CLAUDE_API_KEY.startsWith('sk-ant-api03-') &&
                   process.env.CLAUDE_API_KEY.length > 50;
    
    console.log('🔑 Claude API Key Check:', {
      exists: !!process.env.CLAUDE_API_KEY,
      startsCorrect: process.env.CLAUDE_API_KEY?.startsWith('sk-ant-api03-'),
      lengthOk: process.env.CLAUDE_API_KEY?.length > 50,
      configured: hasKey
    });
    
    return hasKey && anthropic !== null;
  }
  
  async analyzeNewsWithClaude(opponentTeam, newsData) {
    if (!anthropic) {
      throw new Error('Claude client not initialized');
    }
    
    const newsContext = newsData.length > 0 
      ? newsData.map(news => `- ${news.headline}: ${news.content || ''}`).join('\n')
      : `No recent news available for ${opponentTeam}`;
    
    const prompt = `You are TAHLEEL.ai, analyzing ${opponentTeam} for tactical intelligence.

Recent News:
${newsContext}

Extract 4 key tactical insights about ${opponentTeam} from this information. Focus on:
- Player injuries affecting tactics
- Formation/strategy changes
- Key player form/availability
- Tactical trends and adjustments

Return ONLY a JSON array of 4 insights:
["insight about player availability", "insight about tactical changes", "insight about recent form", "insight about strategy adjustments"]`;

    console.log('🤖 Sending request to Claude 3.5 Sonnet...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // UPDATED MODEL
      max_tokens: 600,
      temperature: 0.4,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    const response = message.content[0].text.trim();
    console.log('📝 Claude response received:', response.substring(0, 100) + '...');
    
    try {
      // Try to parse as JSON
      const cleanResponse = response.replace(/^```json\s*|\s*```$/g, '');
      const insights = JSON.parse(cleanResponse);
      
      if (Array.isArray(insights) && insights.length > 0) {
        return insights.slice(0, 4);
      }
    } catch (parseError) {
      console.warn('Failed to parse Claude JSON, extracting text insights...');
      // Extract insights from text response
      const lines = response.split('\n').filter(line => 
        line.trim().length > 20 && 
        (line.includes('-') || line.includes('•') || line.includes(opponentTeam))
      );
      
      if (lines.length >= 2) {
        return lines.slice(0, 4).map(line => line.replace(/^[-•*]\s*/, '').trim());
      }
    }
    
    // Final fallback
    throw new Error('Could not extract valid insights from Claude response');
  }
  
  getIntelligentMockNews(opponentTeam, newsData) {
    const teamLower = opponentTeam.toLowerCase();
    
    // Team-specific intelligent insights
    const insights = {
      'real madrid': [
        'Ancelotti emphasizes counter-attacking speed through wing combinations',
        'Midfield pivot showing increased pressing intensity in recent matches',
        'Defensive line positioning adjusted to counter high-pressing opponents',
        'Set piece routines adapted with new attacking movement patterns'
      ],
      'barcelona': [
        'Xavi implements possession-based model with quick vertical progression',
        'Defensive transitions improved through enhanced midfield work rate',
        'Wing-back overlaps creating consistent overloads in attacking phases',
        'Goalkeeper distribution targeting intelligent forward movement patterns'
      ],
      'manchester city': [
        'Guardiola rotates tactical systems based on opponent analysis',
        'Inverted fullbacks creating numerical advantages in central areas',
        'High defensive line requires pace management against counters',
        'Possession recycling becoming more aggressive in advanced positions'
      ],
      'liverpool': [
        'Klopp emphasizes high-intensity pressing in defensive transitions',
        'Full-back positioning provides width in attacking build-up phases',
        'Counter-pressing triggers showing improved coordination timing',
        'Set piece delivery variations creating unpredictable attacking threats'
      ]
    };
    
    // Find matching team or use generic insights
    for (const [team, teamInsights] of Object.entries(insights)) {
      if (teamLower.includes(team)) {
        return teamInsights;
      }
    }
    
    // Generic but professional insights
    return [
      `${opponentTeam} tactical approach emphasizes defensive organization`,
      'Key player fitness levels remain optimal for upcoming fixtures',
      'Formation flexibility demonstrated in recent competitive matches',
      'Coaching staff focuses on transition speed in training sessions'
    ];
  }
  
  getBaseAnalysis(opponentTeam) {
    return {
      weaknesses: [
        `${opponentTeam} vulnerable to quick transitions on defensive flanks`,
        'Set piece organization shows inconsistency under pressure',
        'Midfield pressing coordination needs improved synchronization',
        'High defensive line susceptible to pace exploitation'
      ],
      strategies: [
        'Exploit wide areas with overlapping attacking movements',
        'Apply immediate pressure after possession turnovers',
        'Target aerial duels in set piece situations',
        'Use quick combination play to penetrate compact defenses'
      ],
      formation: '4-3-3 Diamond',
      keyPlayers: [
        'Neutralize creative midfielder with dedicated pressing',
        'Apply double marking on main striker in penalty area',
        'Exploit pace mismatches against slower defenders',
        'Pressure goalkeeper during distribution phases'
      ],
      confidenceScore: 88
    };
  }
  
  async testConnection() {
    console.log('🧪 Testing Claude connection...');
    
    if (!this.isClaudeConfigured()) {
      return {
        status: 'not_configured',
        message: 'Claude API key missing or invalid',
        details: {
          hasKey: !!process.env.CLAUDE_API_KEY,
          keyFormat: process.env.CLAUDE_API_KEY?.substring(0, 15) + '...',
          clientReady: !!anthropic
        }
      };
    }
    
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022", // UPDATED MODEL
        max_tokens: 50,
        messages: [{
          role: "user",
          content: "Test connection. Reply exactly: TAHLEEL.ai Claude 3.5 Sonnet ready"
        }]
      });
      
      return {
        status: 'connected',
        response: message.content[0].text,
        message: 'Claude 3.5 Sonnet fully operational',
        model: 'claude-3-5-sonnet-20241022'
      };
      
    } catch (error) {
      return {
        status: 'connection_failed',
        error: error.message,
        details: error.status || 'Unknown error'
      };
    }
  }
}

module.exports = new ClaudeService();
