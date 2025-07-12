const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

// GET /api/debug/apikey - Detailed API key diagnosis
router.get('/apikey', async (req, res) => {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    
    // Step 1: Basic key analysis
    const keyAnalysis = {
      exists: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      starts_with: apiKey ? apiKey.substring(0, 15) : 'N/A',
      ends_with: apiKey ? '...' + apiKey.substring(apiKey.length - 4) : 'N/A',
      format_correct: apiKey ? apiKey.startsWith('sk-ant-api03-') : false,
      expected_length_range: '95-105 characters',
      actual_length: apiKey ? apiKey.length : 0
    };
    
    // Step 2: Environment check
    const envCheck = {
      node_env: process.env.NODE_ENV,
      all_env_vars: Object.keys(process.env).filter(key => 
        key.includes('CLAUDE') || key.includes('API')
      ),
      render_deployment: !!process.env.RENDER,
      port: process.env.PORT
    };
    
    // Step 3: Claude client initialization test
    let clientTest = { status: 'failed', error: null };
    try {
      const anthropic = new Anthropic({ 
        apiKey: apiKey,
        defaultHeaders: {
          'anthropic-version': '2023-06-01'
        }
      });
      clientTest.status = 'initialized';
      clientTest.client_created = true;
    } catch (error) {
      clientTest.error = error.message;
    }
    
    // Step 4: Actual API call test (if key exists)
    let apiCallTest = { status: 'skipped', reason: 'No API key' };
    
    if (apiKey && apiKey.startsWith('sk-ant-api03-')) {
      try {
        const anthropic = new Anthropic({ 
          apiKey: apiKey,
          defaultHeaders: {
            'anthropic-version': '2023-06-01'
          }
        });
        
        console.log('🧪 Testing actual Claude 3.5 Sonnet API call...');
        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022", // UPDATED MODEL
          max_tokens: 50,
          messages: [{
            role: "user", 
            content: "Test. Reply exactly: API_TEST_SUCCESS"
          }]
        });
        
        apiCallTest = {
          status: 'success',
          response: message.content[0].text,
          model_used: 'claude-3-5-sonnet-20241022',
          tokens_used: message.usage?.input_tokens || 'unknown'
        };
        
      } catch (error) {
        apiCallTest = {
          status: 'failed',
          error_type: error.constructor.name,
          error_message: error.message,
          error_status: error.status || 'no_status',
          error_details: error.error || 'no_details'
        };
      }
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      test_results: {
        key_analysis: keyAnalysis,
        environment: envCheck,
        client_initialization: clientTest,
        api_call_test: apiCallTest
      },
      recommendations: generateRecommendations(keyAnalysis, apiCallTest),
      next_steps: getNextSteps(keyAnalysis, apiCallTest),
      model_info: {
        current_model: 'claude-3-5-sonnet-20241022',
        model_type: 'Claude 3.5 Sonnet',
        updated: true
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Diagnostic test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/debug/simple - Simple Claude ping test
router.get('/simple', async (req, res) => {
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    return res.json({
      status: 'NO_API_KEY',
      message: 'CLAUDE_API_KEY environment variable not set',
      action: 'Add API key to Render environment variables'
    });
  }
  
  if (!apiKey.startsWith('sk-ant-api03-')) {
    return res.json({
      status: 'INVALID_FORMAT',
      message: 'API key does not start with sk-ant-api03-',
      current_start: apiKey.substring(0, 15),
      action: 'Get new API key from console.anthropic.com'
    });
  }
  
  try {
    console.log('🔍 Testing Claude 3.5 Sonnet API with simple request...');
    const anthropic = new Anthropic({ 
      apiKey: apiKey,
      defaultHeaders: {
        'anthropic-version': '2023-06-01'
      }
    });
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // UPDATED MODEL
      max_tokens: 30,
      messages: [{ role: "user", content: "Reply: WORKING" }]
    });
    
    return res.json({
      status: 'SUCCESS',
      message: 'Claude 3.5 Sonnet API is working perfectly!',
      response: message.content[0].text,
      api_key_valid: true,
      ready_for_production: true,
      model: 'claude-3-5-sonnet-20241022'
    });
    
  } catch (error) {
    return res.json({
      status: 'API_ERROR',
      error_type: error.constructor.name,
      error_message: error.message,
      error_status: error.status,
      model_attempted: 'claude-3-5-sonnet-20241022',
      troubleshooting: {
        401: 'Invalid API key - get new one from console.anthropic.com',
        403: 'API access denied - check billing/account status',
        429: 'Rate limited - try again in a moment',
        500: 'Anthropic server error - try again later'
      }[error.status] || 'Unknown error - check Anthropic status'
    });
  }
});

function generateRecommendations(keyAnalysis, apiCallTest) {
  const recommendations = [];
  
  if (!keyAnalysis.exists) {
    recommendations.push('Add CLAUDE_API_KEY to Render environment variables');
  }
  
  if (!keyAnalysis.format_correct) {
    recommendations.push('Get new API key from console.anthropic.com - key should start with sk-ant-api03-');
  }
  
  if (keyAnalysis.actual_length < 90 || keyAnalysis.actual_length > 110) {
    recommendations.push('API key length seems incorrect - should be 95-105 characters');
  }
  
  if (apiCallTest.status === 'failed') {
    if (apiCallTest.error_status === 401) {
      recommendations.push('401 error = Invalid API key. Generate new key from Anthropic console');
    } else if (apiCallTest.error_status === 403) {
      recommendations.push('403 error = Account access issue. Check billing in Anthropic console');
    } else if (apiCallTest.error_status === 429) {
      recommendations.push('429 error = Rate limited. Try again in a few minutes');
    }
  }
  
  if (apiCallTest.status === 'success') {
    recommendations.push('Claude 3.5 Sonnet is working perfectly! Ready for production use.');
  }
  
  return recommendations;
}

function getNextSteps(keyAnalysis, apiCallTest) {
  if (apiCallTest.status === 'success') {
    return [
      'Claude 3.5 Sonnet API is working perfectly!',
      'Your TAHLEEL.ai platform now has the latest Claude model',
      'Test the full platform at your frontend URL'
    ];
  }
  
  return [
    '1. Visit https://console.anthropic.com/',
    '2. Sign in to your account',
    '3. Go to API Keys section',
    '4. Create new API key',
    '5. Copy the ENTIRE key (starts with sk-ant-api03-)',
    '6. Update CLAUDE_API_KEY in Render environment variables',
    '7. Wait for redeploy and test again'
  ];
}

module.exports = router;
