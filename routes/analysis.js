const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const newsService = require('../services/newsService');
const { trackAnalysis } = require('../middleware/subscriptionAnalytics');

// POST /api/analysis - Analyze opponent team
router.post('/', async (req, res) => {
  try {
    const { opponent } = req.body;
    
    if (!opponent || opponent.trim().length === 0) {
      return res.status(400).json({
        error: 'Opponent team name is required'
      });
    }

    console.log(`🔍 Starting analysis for: ${opponent}`);
    
    // Step 1: Fetch recent news about the opponent
    const newsData = await newsService.fetchTeamNews(opponent);
    console.log(`📰 Found ${newsData.length} news articles`);
    
    // Step 2: Generate analysis using Claude AI
    const analysis = await claudeService.analyzeTeam(opponent, newsData);
    console.log(`🤖 Analysis completed for ${opponent}`);
    
    // Step 3: Return structured response
    const response = {
      opponent: opponent,
      date: new Date().toLocaleDateString(),
      analysisId: `analysis_${Date.now()}`,
      ...analysis,
      newsCount: newsData.length,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze team',
      message: error.message,
      opponent: req.body.opponent
    });
  }
});

// GET /api/analysis/history - Get analysis history (future feature)
router.get('/history', async (req, res) => {
  try {
    // Future implementation for storing and retrieving analysis history
    res.json({
      message: 'Analysis history feature coming soon',
      analyses: []
    });
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analysis history'
    });
  }
});

// GET /api/analysis/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Analysis service is running',
    timestamp: new Date().toISOString(),
    service: 'TAHLEEL.ai Analysis API'
  });
});

module.exports = router;
