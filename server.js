const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const analysisRoutes = require('./routes/analysis');
const newsRoutes = require('./routes/news');
const testRoutes = require('./routes/test'); // ADD THIS LINE
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render/Heroku/Railway
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting - Updated for proxy environments
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tahleel.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'TAHLEEL.ai Backend',
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL,
    trustProxy: app.get('trust proxy')
  });
});

// API routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/test', testRoutes); // ADD THIS LINE

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TAHLEEL.ai Backend API - WORKING!',
    version: '1.0.0',
    company: 'Auwire Technologies',
    status: 'Running',
    endpoints: {
      health: '/health',
      analysis: '/api/analysis',
      news: '/api/news',
      test: '/api/test' // ADD THIS LINE
    },
    cors: {
      allowedOrigins: corsOptions.origin
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: ['/health', '/api/analysis', '/api/news', '/api/test']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TAHLEEL.ai Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: https://tahleel-ai-backend.onrender.com/health`);
  console.log(`🔧 Trust proxy: ${app.get('trust proxy')}`);
  console.log(`🧪 Test endpoints: https://tahleel-ai-backend.onrender.com/api/test`);
});

module.exports = app;
