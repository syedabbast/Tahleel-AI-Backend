const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const newsService = require('../services/newsService');

// GET /api/test/claude/:team - Test Claude AI specifically
router.get('/claude/:team', async (req, res) => {
  const { team } = req.params;
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Testing Claude AI for team: ${team}`);
    
    // Step 1: Test Claude connection
    const connectionTest = await claudeService.testConnection();
    
    // Step 2: Fetch news data
    const newsData = await newsService.fetchTeamNews(team, 5);
    
    // Step 3: Test Claude news analysis specifically
    let claudeResult = null;
    let claudeError = null;
    
    try {
      claudeResult = await claudeService.analyzeNewsWithClaude(team, newsData);
    } catch (error) {
      claudeError = error.message;
    }
    
    const endTime = Date.now();
    
    res.json({
      team: team,
      timestamp: new Date().toISOString(),
      processingTime: `${endTime - startTime}ms`,
      
      claudeConnection: connectionTest,
      
      newsData: {
        count: newsData.length,
        sources: newsData.map(n => n.source),
        headlines: newsData.map(n => n.headline),
        hasRealData: newsData.some(n => !n.headline.includes('mock') && !n.headline.includes('expected'))
      },
      
      claudeAnalysis: {
        success: claudeResult !== null,
        error: claudeError,
        result: claudeResult,
        isAiGenerated: claudeResult !== null && !claudeError
      },
      
      apiKeys: {
        claudeConfigured: process.env.CLAUDE_API_KEY ? 'YES' : 'NO',
        claudeValid: process.env.CLAUDE_API_KEY?.startsWith('sk-ant-api03-') ? 'YES' : 'NO',
        newsConfigured: process.env.NEWS_API_KEY ? 'YES' : 'NO',
        newsValid: process.env.NEWS_API_KEY !== 'your_news_api_key_here' ? 'YES' : 'NO'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      team: team,
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false
    });
  }
});

// GET /api/test/compare/:team1/:team2 - Compare Claude responses for different teams
router.get('/compare/:team1/:team2', async (req, res) => {
  const { team1, team2 } = req.params;
  
  try {
    console.log(`🔍 Comparing Claude AI responses: ${team1} vs ${team2}`);
    
    // Test both teams simultaneously
    const [result1, result2] = await Promise.all([
      testTeamAnalysis(team1),
      testTeamAnalysis(team2)
    ]);
    
    res.json({
      comparison: {
        team1: { name: team1, ...result1 },
        team2: { name: team2, ...result2 }
      },
      differences: {
        newsCountDiff: Math.abs(result1.newsCount - result2.newsCount),
        responseDiff: result1.claudeResponse !== result2.claudeResponse,
        timeDiff: `${Math.abs(result1.processingTime - result2.processingTime)}ms`
      },
      claudeIsWorking: result1.claudeSuccess || result2.claudeSuccess,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      teams: [team1, team2],
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function
async function testTeamAnalysis(teamName) {
  const startTime = Date.now();
  
  try {
    const newsData = await newsService.fetchTeamNews(teamName, 3);
    let claudeResponse = null;
    let claudeSuccess = false;
    
    try {
      claudeResponse = await claudeService.analyzeNewsWithClaude(teamName, newsData);
      claudeSuccess = true;
    } catch (error) {
      claudeResponse = error.message;
    }
    
    return {
      newsCount: newsData.length,
      claudeResponse: claudeSuccess ? claudeResponse : null,
      claudeError: claudeSuccess ? null : claudeResponse,
      claudeSuccess: claudeSuccess,
      processingTime: Date.now() - startTime,
      newsHeadlines: newsData.map(n => n.headline).slice(0, 2)
    };
    
  } catch (error) {
    return {
      error: error.message,
      processingTime: Date.now() - startTime,
      claudeSuccess: false
    };
  }
}

// GET /api/test/status - Overall system status
router.get('/status', async (req, res) => {
  try {
    const connectionTest = await claudeService.testConnection();
    
    res.json({
      system: 'TAHLEEL.ai Backend',
      timestamp: new Date().toISOString(),
      status: 'Running',
      
      services: {
        claude: {
          status: connectionTest.status,
          message: connectionTest.message || connectionTest.response
        },
        news: {
          status: 'Available',
          sources: ['NewsAPI', 'Mock Data', 'ESPN']
        }
      },
      
      configuration: {
        claudeApiKey: process.env.CLAUDE_API_KEY ? 'Configured' : 'Missing',
        newsApiKey: process.env.NEWS_API_KEY ? 'Configured' : 'Missing',
        environment: process.env.NODE_ENV || 'development'
      },
      
      endpoints: {
        testClaude: '/api/test/claude/:team',
        compareTeams: '/api/test/compare/:team1/:team2',
        systemStatus: '/api/test/status'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
