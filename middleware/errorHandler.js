const errorHandler = (error, req, res, next) => {
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  // Claude API specific errors
  if (error.message.includes('Claude') || error.message.includes('Anthropic')) {
    statusCode = 503;
    message = 'AI service temporarily unavailable';
  }

  // Rate limiting errors
  if (error.message.includes('rate limit')) {
    statusCode = 429;
    message = 'Too many requests';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};

module.exports = errorHandler;
