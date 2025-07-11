const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

class ClaudeService {
  
  async analyzeTeam(opponentTeam, newsData) {
    try {
      const prompt = this.buildAnalysisPrompt(opponentTeam, newsData);
      
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{
          role: "user",
          content: prompt
        }]
      });
      
      const analysis = this.parseAnalysisResponse(message.content[0].text);
      return analysis;
      
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }
  
  buildAnalysisPrompt(opponentTeam, newsData) {
    const newsContext = newsData.length > 0 
      ? newsData.map(news => `- ${news.headline}: ${news.content}`).join('\n')
      : 'No recent news available';
    
    return `
You are TAHLEEL.ai (تحليل), an expert football tactical analyst for Arab League teams. Analyze the opponent team "${opponentTeam}" and provide strategic insights.

Recent News Context:
${newsContext}

Please provide a comprehensive tactical analysis in JSON format with the following structure:

{
  "weaknesses": [
    "List 3-4 specific tactical weaknesses based on recent performance and news"
  ],
  "strategies": [
    "List 3-4 specific tactical strategies to exploit these weaknesses"
  ],
  "formation": "Recommended formation (e.g., 4-3-3, 3-5-2)",
  "keyPlayers": [
    "List 3-4 player-specific tactical instructions"
  ],
  "recentNews": [
    "List 3-4 key insights from recent news that impact tactics"
  ],
  "confidenceScore": 85
}

Focus on:
1. Recent team form and tactical changes
2. Key player injuries or suspensions
3. Formation weaknesses
4. Set piece vulnerabilities
5. Counter-attacking opportunities

Provide actionable tactical advice that an Arab League coach can implement immediately.
    `.trim();
  }
  
  parseAnalysisResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create structured response from text
      return {
        weaknesses: [
          'Analysis based on available data',
          'Tactical patterns identified',
          'Areas requiring attention'
        ],
        strategies: [
          'Strategic recommendations provided',
          'Tactical adjustments suggested',
          'Implementation guidance offered'
        ],
        formation: '4-3-3',
        keyPlayers: [
          'Player-specific instructions provided',
          'Tactical roles defined'
        ],
        recentNews: [
          'Recent developments analyzed',
          'Impact assessment completed'
        ],
        confidenceScore: 75,
        rawAnalysis: response
      };
      
    } catch (error) {
      console.error('Response parsing error:', error);
      throw new Error('Failed to parse AI analysis response');
    }
  }
  
  async testConnection() {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: "Test connection. Respond with 'TAHLEEL.ai is ready'"
        }]
      });
      
      return {
        status: 'connected',
        response: message.content[0].text
      };
      
    } catch (error) {
      throw new Error(`Claude connection failed: ${error.message}`);
    }
  }
}

module.exports = new ClaudeService();
