import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 20, // Limit each IP to 20 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    type: 'rate_limit_exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:5173', 'http://localhost:3000']
    : process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Additional validation can be added here
    if (buf.length === 0) {
      throw new Error('Empty request body');
    }
  }
}));

// Input validation middleware
const validateChatRequest = (req, res, next) => {
  const {
    model,
    systemPrompt,
    userPrompt,
    temperature,
    maxTokens,
    presencePenalty,
    frequencyPenalty,
    stopSequence
  } = req.body;

  // Validate required fields
  if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
    return res.status(400).json({ 
      error: 'User prompt is required and must be a non-empty string',
      type: 'validation_error'
    });
  }

  // Validate prompt lengths
  if (userPrompt.length > 8000) {
    return res.status(400).json({
      error: 'User prompt too long (max 8000 characters)',
      type: 'validation_error'
    });
  }

  if (systemPrompt && (typeof systemPrompt !== 'string' || systemPrompt.length > 4000)) {
    return res.status(400).json({
      error: 'System prompt must be a string with max 4000 characters',
      type: 'validation_error'
    });
  }

  // Validate model
  const allowedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'];
  if (model && !allowedModels.includes(model)) {
    return res.status(400).json({
      error: 'Invalid model specified',
      type: 'validation_error'
    });
  }

  // Validate numeric parameters
  const numericValidations = [
    { field: 'temperature', value: temperature, min: 0, max: 2 },
    { field: 'maxTokens', value: maxTokens, min: 1, max: 4000 },
    { field: 'presencePenalty', value: presencePenalty, min: 0, max: 2 },
    { field: 'frequencyPenalty', value: frequencyPenalty, min: 0, max: 2 }
  ];

  for (const validation of numericValidations) {
    if (validation.value !== undefined) {
      if (typeof validation.value !== 'number' || 
          validation.value < validation.min || 
          validation.value > validation.max) {
        return res.status(400).json({
          error: `${validation.field} must be a number between ${validation.min} and ${validation.max}`,
          type: 'validation_error'
        });
      }
    }
  }

  // Validate stop sequence
  if (stopSequence && typeof stopSequence !== 'string') {
    return res.status(400).json({
      error: 'Stop sequence must be a string',
      type: 'validation_error'
    });
  }

  next();
};

// Initialize OpenAI client with validation
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// OpenAI chat completion endpoint
app.post('/api/chat', validateChatRequest, async (req, res) => {
  try {
    const {
      model,
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      presencePenalty,
      frequencyPenalty,
      stopSequence
    } = req.body;

    // Prepare messages array
    const messages = [];
    
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }
    
    messages.push({
      role: 'user',
      content: userPrompt.trim()
    });

    // Prepare stop sequences with validation
    let stop = null;
    if (stopSequence && stopSequence.trim()) {
      stop = stopSequence
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length <= 100) // Limit individual stop sequence length
        .slice(0, 4); // Limit to 4 stop sequences
      
      if (stop.length === 0) {
        stop = null;
      }
    }

    // Prepare OpenAI API request with safe defaults
    const requestBody = {
      model: model || 'gpt-3.5-turbo',
      messages,
      temperature: Math.max(0, Math.min(2, temperature || 0.7)),
      max_tokens: Math.max(1, Math.min(4000, maxTokens || 1000)),
      presence_penalty: Math.max(0, Math.min(2, presencePenalty || 0)),
      frequency_penalty: Math.max(0, Math.min(2, frequencyPenalty || 0)),
    };

    if (stop) {
      requestBody.stop = stop;
    }

    // Log request (without sensitive data)
    console.log('OpenAI API request:', {
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      presence_penalty: requestBody.presence_penalty,
      frequency_penalty: requestBody.frequency_penalty,
      stop: requestBody.stop,
      messagesCount: messages.length,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // Make request to OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const completion = await openai.chat.completions.create(requestBody, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Extract response content
    const responseContent = completion.choices[0]?.message?.content || 'No response generated';

    res.json({
      success: true,
      content: responseContent,
      usage: completion.usage,
      model: completion.model
    });

  } catch (error) {
    console.error('OpenAI API Error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // Handle different types of errors with sanitized responses
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        error: 'API quota exceeded. Please check your billing details.',
        type: 'quota_exceeded'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        error: 'Invalid API key configuration.',
        type: 'invalid_key'
      });
    }

    if (error.code === 'model_not_found') {
      return res.status(400).json({
        error: 'The specified model is not available.',
        type: 'model_not_found'
      });
    }

    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        type: 'rate_limit'
      });
    }

    if (error.name === 'AbortError') {
      return res.status(408).json({
        error: 'Request timeout. Please try again.',
        type: 'timeout'
      });
    }

    // Generic error handling - don't expose internal details
    res.status(500).json({
      error: 'An error occurred while processing your request',
      type: 'server_error'
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal server error',
    type: 'server_error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    type: 'not_found'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
});