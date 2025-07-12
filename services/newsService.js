const axios = require('axios');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }
  
  async fetchTeamNews(teamName, limit = 10) {
    try {
      // Try NewsAPI first, then fallback to enhanced mock
      let allNews = [];
      
      if (this.newsApiKey && this.newsApiKey !== 'your_news_api_key_here') {
        try {
          allNews = await this.fetchFromNewsAPI(teamName, limit);
          console.log(`📰 Retrieved ${allNews.length} real news articles for ${teamName}`);
        } catch (error) {
          console.warn('NewsAPI failed:', error.message);
        }
      }
      
      // If we got real news, use it
      if (allNews.length > 0) {
        const uniqueNews = this.removeDuplicates(allNews);
        const sortedNews = uniqueNews
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, limit);
        
        console.log(`✅ Using ${sortedNews.length} real news articles for Claude 3.5 Sonnet analysis`);
        return this.formatNewsData(sortedNews);
      }
      
      // Fallback to realistic mock data optimized for Claude 3.5 Sonnet
      console.log(`📝 Using enhanced mock news for ${teamName} (optimized for Claude 3.5 Sonnet)`);
      return this.getRealisticMockNews(teamName, limit);
      
    } catch (error) {
      console.warn('News fetch failed, using mock data:', error.message);
      return this.getRealisticMockNews(teamName, limit);
    }
  }
  
  async fetchFromNewsAPI(teamName, limit) {
    const queries = [
      `"${teamName}" football`,
      `"${teamName}" soccer injury`,
      `"${teamName}" transfer news`
    ];
    
    let allNews = [];
    
    for (const query of queries.slice(0, 2)) { // Limit to 2 queries
      try {
        const response = await axios.get(`${this.baseUrl}/everything`, {
          params: {
            q: query,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: Math.ceil(limit / 2),
            apiKey: this.newsApiKey,
            domains: 'espn.com,bbc.com,skysports.com,goal.com,marca.com,football365.com'
          },
          timeout: 5000
        });
        
        if (response.data.articles) {
          allNews = allNews.concat(response.data.articles);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (queryError) {
        console.warn(`NewsAPI query failed for "${query}":`, queryError.response?.status || queryError.message);
      }
    }
    
    return allNews;
  }
  
  formatNewsData(articles) {
    return articles.map(article => ({
      headline: article.title || article.headline,
      content: article.description || article.content || '',
      source: article.source?.name || 'Sports News',
      publishedAt: article.publishedAt || new Date().toISOString(),
      url: article.url,
      relevanceScore: this.calculateRelevanceScore(article),
      optimizedForClaude: true // Flag for Claude 3.5 Sonnet processing
    }));
  }
  
  calculateRelevanceScore(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    
    // Enhanced keywords for better Claude 3.5 Sonnet analysis
    const keywords = [
      'injury', 'transfer', 'tactics', 'formation', 'coach', 'manager', 
      'suspended', 'fitness', 'training', 'strategy', 'lineup', 'squad',
      'contract', 'signing', 'medical', 'recovery', 'performance'
    ];
    
    let score = 50;
    
    keywords.forEach(keyword => {
      if (title.includes(keyword)) score += 15;
      if (description.includes(keyword)) score += 10;
    });
    
    return Math.min(score, 100);
  }
  
  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = (article.title || '').toLowerCase().trim();
      if (seen.has(key) || key.length < 10) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  getRealisticMockNews(teamName, limit) {
    const currentDate = new Date();
    const dayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(currentDate.getTime() - 72 * 60 * 60 * 1000);
    
    // Enhanced mock news templates optimized for Claude 3.5 Sonnet analysis
    const mockNewsTemplates = [
      {
        headline: `${teamName} tactical formation adjustments show promising results in recent training`,
        content: 'Coaching staff implements new defensive structure with enhanced pressing triggers and improved ball circulation patterns.',
        source: 'Football Tactical Review',
        publishedAt: currentDate.toISOString(),
        relevanceScore: 92,
        optimizedForClaude: true
      },
      {
        headline: `Key ${teamName} midfielder undergoes intensive fitness assessment ahead of crucial fixtures`,
        content: 'Medical team provides comprehensive update on player condition, recovery timeline, and expected impact on tactical setup.',
        source: 'Sports Medical Analysis',
        publishedAt: dayAgo.toISOString(),
        relevanceScore: 95,
        optimizedForClaude: true
      },
      {
        headline: `${teamName} defensive coordination demonstrates significant improvement in recent performance analysis`,
        content: 'Set piece organization and pressing synchronization show enhanced effectiveness through systematic training approach.',
        source: 'Tactical Intelligence',
        publishedAt: twoDaysAgo.toISOString(),
        relevanceScore: 88,
        optimizedForClaude: true
      },
      {
        headline: `${teamName} attacking transition patterns evolve with new strategic emphasis`,
        content: 'Coaching methodology focuses on rapid ball progression and movement combinations in final third scenarios.',
        source: 'Strategy Analysis',
        publishedAt: threeDaysAgo.toISOString(),
        relevanceScore: 86,
        optimizedForClaude: true
      },
      {
        headline: `${teamName} squad rotation strategy demonstrates tactical flexibility in competitive schedule`,
        content: 'Player management approach balances physical preparation with tactical consistency across multiple fixtures.',
        source: 'Squad Management',
        publishedAt: new Date(currentDate.getTime() - 96 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 83,
        optimizedForClaude: true
      },
      {
        headline: `${teamName} set piece execution receives enhanced focus in tactical preparation`,
        content: 'Video analysis sessions reveal improved delivery precision and movement coordination in dead ball situations.',
        source: 'Set Piece Specialist',
        publishedAt: new Date(currentDate.getTime() - 120 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 89,
        optimizedForClaude: true
      },
      {
        headline: `${teamName} youth development integration shows promising tactical adaptation`,
        content: 'Academy graduates demonstrate readiness for senior tactical requirements through systematic development program.',
        source: 'Youth Development',
        publishedAt: new Date(currentDate.getTime() - 144 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 78,
        optimizedForClaude: true
      },
      {
        headline: `${teamName} opponent analysis reveals strategic preparation methodology`,
        content: 'Detailed scouting reports inform tactical adjustments and player-specific instructions for upcoming fixtures.',
        source: 'Opposition Analysis',
        publishedAt: new Date(currentDate.getTime() - 168 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 91,
        optimizedForClaude: true
      }
    ];
    
    // Randomize and return appropriate number with enhanced variety
    const shuffled = mockNewsTemplates.sort(() => 0.5 - Math.random());
    const selectedNews = shuffled.slice(0, limit);
    
    console.log(`📝 Generated ${selectedNews.length} optimized mock news articles for Claude 3.5 Sonnet analysis`);
    return selectedNews;
  }
  
  async fetchLatestFootballNews(limit = 20) {
    try {
      if (this.newsApiKey && this.newsApiKey !== 'your_news_api_key_here') {
        const response = await axios.get(`${this.baseUrl}/everything`, {
          params: {
            q: 'football OR soccer',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: limit,
            apiKey: this.newsApiKey,
            domains: 'bbc.com,skysports.com,goal.com'
          },
          timeout: 5000
        });
        
        if (response.data.articles) {
          console.log(`📰 Retrieved ${response.data.articles.length} latest football news for Claude 3.5 Sonnet`);
          return this.formatNewsData(response.data.articles);
        }
      }
    } catch (error) {
      console.warn('Latest news fetch failed:', error.message);
    }
    
    // Fallback to general mock news optimized for Claude 3.5 Sonnet
    return [
      {
        headline: 'Global football tactical evolution analysis reveals emerging strategic trends',
        content: 'Latest developments in modern football strategy, player development methodologies, and tactical innovation.',
        source: 'Football Analytics',
        publishedAt: new Date().toISOString(),
        relevanceScore: 85,
        optimizedForClaude: true
      }
    ];
  }
  
  // New method for Claude 3.5 Sonnet integration
  prepareNewsForClaudeAnalysis(newsData, teamName) {
    return {
      teamName: teamName,
      newsCount: newsData.length,
      hasRealData: newsData.some(news => !news.optimizedForClaude || news.url),
      contextualSummary: `Recent news analysis for ${teamName} tactical intelligence`,
      relevantArticles: newsData.filter(news => news.relevanceScore > 80),
      keyInsights: newsData.map(news => ({
        headline: news.headline,
        tacticalRelevance: this.assessTacticalRelevance(news),
        timestamp: news.publishedAt
      })),
      optimizedForModel: 'claude-3-5-sonnet-20241022'
    };
  }
  
  assessTacticalRelevance(newsItem) {
    const content = (newsItem.headline + ' ' + newsItem.content).toLowerCase();
    const tacticalKeywords = [
      'formation', 'tactics', 'strategy', 'pressing', 'defense', 'attack',
      'midfield', 'wing', 'striker', 'goalkeeper', 'substitution', 'lineup'
    ];
    
    const matches = tacticalKeywords.filter(keyword => content.includes(keyword));
    return {
      score: matches.length * 10,
      keywords: matches,
      category: matches.length > 3 ? 'high' : matches.length > 1 ? 'medium' : 'low'
    };
  }
}

module.exports = new NewsService();
