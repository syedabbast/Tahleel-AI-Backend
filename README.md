# TAHLEEL.ai Backend

> AI-Powered Football Tactical Analysis API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Claude API Key (Anthropic)
- News API Key (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/syedabbast/tahleel-ai-backend.git
cd tahleel-ai-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Setup

Create `.env` file:
```bash
NODE_ENV=development
PORT=5000
CLAUDE_API_KEY=your_claude_api_key_here
NEWS_API_KEY=your_news_api_key_here
FRONTEND_URL=http://localhost:3000
```

## 🏗️ Project Structure

```
├── server.js                 # Main server file
├── routes/
│   ├── analysis.js          # Analysis endpoints
│   └── news.js              # News endpoints
├── services/
│   ├── claudeService.js     # Claude AI integration
│   └── newsService.js       # News fetching service
├── middleware/
│   └── errorHandler.js      # Error handling middleware
└── package.json
```

## 🔌 API Endpoints

### Analysis
- `POST /api/analysis` - Analyze opponent team
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/test` - Test endpoint

### News
- `GET /api/news/:team` - Get team-specific news
- `GET /api/news` - Get latest football news

### Health
- `GET /health` - Health check
- `GET /` - API information

## 📡 Usage Examples

### Analyze Team
```bash
curl -X POST http://localhost:5000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"opponent": "Real Madrid"}'
```

### Get Team News
```bash
curl http://localhost:5000/api/news/Barcelona?limit=5
```

## 🤖 Claude AI Integration

The system uses Claude 3 Sonnet for tactical analysis:

```javascript
// Example analysis request
{
  "opponent": "Manchester City",
  "analysisType": "tactical"
}

// Response format
{
  "opponent": "Manchester City",
  "weaknesses": [...],
  "strategies": [...],
  "formation": "4-3-3",
  "keyPlayers": [...],
  "recentNews": [...],
  "confidenceScore": 87
}
```

## 📰 News Integration

Fetches real-time football news from multiple sources:
- NewsAPI.org integration
- Team-specific news filtering
- Relevance scoring algorithm
- Mock data fallback

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## 🚀 Deployment

### Render.com
```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Deploy automatically on push
```

### Railway
```bash
railway login
railway link
railway up
```

### Heroku
```bash
heroku create tahleel-ai-backend
heroku config:set CLAUDE_API_KEY=your_key
git push heroku main
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for frontend domain
- **Input Validation**: Request sanitization
- **Error Handling**: Secure error responses

## 🎯 Key Features

- **AI Analysis**: Claude 3 Sonnet integration
- **News Intelligence**: Real-time sports news
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: API protection
- **Health Monitoring**: System status endpoints
- **Scalable Architecture**: Modular service design

## 📊 Monitoring

Health check endpoint provides:
- Service status
- Uptime information
- System timestamp
- API version

## 🔗 Frontend Integration

Designed to work with TAHLEEL.ai frontend:
- CORS enabled for React app
- JSON API responses
- Error handling for UI
- Real-time analysis processing

## 🏢 Company

**Auwire Technologies**  
Syed - Project Owner  
© 2025 All rights reserved

## 📈 Pricing Tiers

- **Regional Intelligence**: $15,000/month
- **Global Intelligence**: $25,000/month  
- **Elite Championship**: $45,000/month
