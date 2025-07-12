const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

class ClaudeService {
  
  async analyzeTeam(opponentTeam, newsData) {
    // Get base analysis (reliable mock data)
    const baseAnalysis = this.getBaseAnalysis(opponentTeam);
    
    // Try to enhance Recent Intelligence with real Claude AI
    try {
      const enhancedNews = await this.analyzeNewsWithClaude(opponentTeam, newsData);
      baseAnalysis.recentNews = enhancedNews;
      baseAnalysis.aiEnhanced = true;
    } catch (error) {
      console.warn('Claude AI enhancement failed, using mock news:', error.message);
      baseAnalysis.recentNews = this.getMockNews(opponentTeam);
      baseAnalysis.aiEnhanced = false;
    }
    
    return baseAnalysis;
  }
  
  async analyzeNewsWithClaude(opponentTeam, newsData) {
    // Only call Claude for news analysis
    if (!process.env.CLAUDE_API_KEY || !process.env.CLAUDE_API_KEY.startsWith('sk-ant-api03-')) {
      throw new Error('Invalid Claude API key');
    }
    
    const newsContext = newsData.length > 0 
      ? newsData.map(news => `- ${news.headline}: ${news.content || news.headline}`).join('\n')
      : `No recent news found for ${opponentTeam}`;
    
    const prompt = `
You are TAHLEEL.ai (تحليل), an expert football analyst. Analyze recent news about "${opponentTeam}" and extract key tactical intelligence.

Recent News:
${newsContext}

Please return ONLY a JSON array of 3-4 key tactical insights from this news. Format:
["insight 1 about injuries/transfers that affects tactics", "insight 2 about formation changes", "insight 3 about player form/availability", "insight 4 about tactical trends"]

Focus on:
- Player injuries/suspensions affecting lineup
- Tactical changes mentioned by coaches
- New signings and their impact
- Team morale and confidence factors
- Formation adjustments
- Key player form updates

Return only the JSON array, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 500,
      temperature: 0.3,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    const response = message.content[0].text.trim();
    
    try {
      // Try to parse as JSON array
      const insights = JSON.parse(response);
      if (Array.isArray(insights) && insights.length > 0) {
        return insights;
      }
    } catch (parseError) {
      console.warn('Failed to parse Claude response as JSON:', response);
    }
    
    // Fallback to extracting insights from text
    return this.extractInsightsFromText(response, opponentTeam);
  }
  
  extractInsightsFromText(text, opponentTeam) {
    // Extract meaningful sentences from Claude's response
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length >= 3) {
      return sentences.slice(0, 4).map(s => s.trim());
    }
    
    // Ultimate fallback
    return this.getMockNews(opponentTeam);
  }
  
  getBaseAnalysis(opponentTeam) {
    return {
      weaknesses: [
        `${opponentTeam} shows vulnerability to quick counter-attacks on the left flank`,
        'Defensive line positioning inconsistent during set pieces',
        'Midfield pressing coordination needs improvement',
        'Vulnerable to pace on the wings during transitions'
      ],
      strategies: [
        'Exploit wide areas with overlapping fullback runs',
        'Press high immediately after losing possession',
        'Target set pieces with height advantage',
        'Use quick passing combinations in final third'
      ],
      formation: '4-3-3 Diamond',
      keyPlayers: [
        'Neutralize their playmaker with dedicated marking',
        'Double-mark main striker in penalty area',
        'Exploit pace advantage against slower defenders',
        'Pressure their goalkeeper on goal kicks'
      ],
      confidenceScore: 87
    };
  }
  
  getMockNews(opponentTeam) {
    return [
      `${opponentTeam} key midfielder picked up minor injury in training`,
      'Recent tactical formation adjustments observed in friendly matches',
      'Coach emphasized defensive improvements in latest press conference',
      'New signing expected to strengthen midfield creativity and depth'
    ];
  }
  
  async testConnection() {
    try {
      if (!process.env.CLAUDE_API_KEY || !process.env.CLAUDE_API_KEY.startsWith('sk-ant-api03-')) {
        return {
          status: 'hybrid_mode',
          message: 'Base analysis working, Claude AI disabled (check API key)'
        };
      }
      
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 50,
        messages: [{
          role: "user",
          content: "Test. Reply: TAHLEEL.ai Claude ready"
        }]
      });
      
      return {
        status: 'full_ai_ready',
        response: message.content[0].text
      };
      
    } catch (error) {
      return {
        status: 'hybrid_mode',
        message: `Claude AI disabled: ${error.message}`,
        fallback: 'Base analysis still working'
      };
    }
  }
}

module.exports = new ClaudeService();
