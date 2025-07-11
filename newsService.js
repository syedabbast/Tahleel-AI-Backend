const axios = require('axios');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }
  
  async fetchTeamNews(teamName, limit = 10) {
    try {
      const queries = [
        `"${teamName}" football`,
        `"${teamName}" soccer`,
        `${teamName} injury transfer`,
        `${teamName} tactics formation`
      ];
      
      let allNews = [];
      
      for (const query of queries) {
        try {
          const news = await this.searchNews(query, Math.ceil(limit / queries.length));
          allNews = allNews.concat(news);
        } catch (error) {
          console.warn(`Failed to fetch news for query: ${query}`, error.message);
        }
      }
      
      // Remove duplicates and sort by date
      const uniqueNews = this.removeDuplicates(allNews);
      const sortedNews = uniqueNews
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit);
      
      return this.formatNewsData(sortedNews);
      
    } catch (error) {
      console.error('Team news fetch error:', error);
      return this.getMockNewsData(teamName);
    }
  }
  
  async fetchLatestFootballNews(limit = 20) {
    try {
      const queries = [
        'football premier league',
        'soccer champions league',
        'football transfers',
        'football injuries'
      ];
      
      let allNews = [];
      
      for (const query of queries) {
        try {
          const news = await this.searchNews(query, Math.ceil(limit / queries.length));
          allNews = allNews.concat(news);
        } catch (error) {
          console.warn(`Failed to fetch latest news for: ${query}`);
        }
      }
      
      const uniqueNews = this.removeDuplicates(allNews);
      return uniqueNews
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit);
        
    } catch (error) {
      console.error('Latest news fetch error:', error);
      return [];
    }
  }
  
  async searchNews(query, pageSize = 10) {
    if (!this.newsApiKey) {
      console.warn('NEWS_API_KEY not configured, using mock data');
      return [];
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: pageSize,
          apiKey: this.newsApiKey
        },
        timeout: 5000
      });
      
      return response.data.articles || [];
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn('News API rate limit exceeded');
      } else {
        console.error('News API error:', error.message);
      }
      return [];
    }
  }
  
  formatNewsData(articles) {
    return articles.map(article => ({
      headline: article.title,
      content: article.description || article.content || '',
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt,
      url: article.url,
      relevanceScore: this.calculateRelevanceScore(article)
    }));
  }
  
  calculateRelevanceScore(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    
    const keywords = ['injury', 'transfer', 'tactics', 'formation', 'coach', 'manager', 'suspended'];
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
      const key = article.title?.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  getMockNewsData(teamName) {
    return [
      {
        headline: `${teamName} prepares for upcoming match with tactical adjustments`,
        content: 'Team showing strong form in recent training sessions with new tactical setup.',
        source: 'Sports News',
        publishedAt: new Date().toISOString(),
        relevanceScore: 85
      },
      {
        headline: `Key player update from ${teamName} training ground`,
        content: 'Latest updates on player fitness and availability for next fixture.',
        source: 'Football Central',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        relevanceScore: 90
      },
      {
        headline: `${teamName} tactical analysis: Recent performance review`,
        content: 'In-depth look at recent performances and tactical trends.',
        source: 'Tactical Review',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        relevanceScore: 80
      }
    ];
  }
}

module.exports = new NewsService();
