class NewsService {
  
  async fetchTeamNews(teamName, limit = 10) {
    // Return working mock data
    return [
      {
        headline: `${teamName} prepares tactical adjustments for upcoming fixtures`,
        content: 'Team showing strong form with new strategic approach in recent training.',
        source: 'Football Analysis',
        publishedAt: new Date().toISOString(),
        relevanceScore: 90
      },
      {
        headline: `Latest team updates from ${teamName} training ground`,
        content: 'Key player fitness reports and tactical preparation updates.',
        source: 'Sports Central',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        relevanceScore: 85
      },
      {
        headline: `${teamName} tactical review: Recent performance analysis`,
        content: 'Comprehensive look at formation changes and player roles.',
        source: 'Tactical Insights',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        relevanceScore: 88
      }
    ];
  }
  
  async fetchLatestFootballNews(limit = 20) {
    return [
      {
        headline: 'Global football tactical trends analysis',
        content: 'Latest developments in modern football strategy.',
        source: 'Football Intelligence',
        publishedAt: new Date().toISOString()
      }
    ];
  }
}

module.exports = new NewsService();
