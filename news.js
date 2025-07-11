const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');

// GET /api/news/:team - Get news for specific team
router.get('/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const news = await newsService.fetchTeamNews(team, limit);
    
    res.json({
      team: team,
      count: news.length,
      news: news,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch news',
      team: req.params.team
    });
  }
});

// GET /api/news/latest - Get latest football news
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const news = await newsService.fetchLatestFootballNews(limit);
    
    res.json({
      count: news.length,
      news: news,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Latest news fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch latest news'
    });
  }
});

module.exports = router;
