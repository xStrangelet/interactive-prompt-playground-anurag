import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// OpenAI chat completion endpoint
app.post('/api/chat', async (req, res) => {
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

    // Validate required fields
    if (!userPrompt || !userPrompt.trim()) {
      return res.status(400).json({ 
        error: 'User prompt is required' 
      });
    }

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

    // Prepare stop sequences
    let stop = null;
    if (stopSequence && stopSequence.trim()) {
      stop = stopSequence
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      if (stop.length === 0) {
        stop = null;
      }
    }

    // Prepare OpenAI API request
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

    console.log('Making OpenAI API request:', {
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      presence_penalty: requestBody.presence_penalty,
      frequency_penalty: requestBody.frequency_penalty,
      stop: requestBody.stop,
      messagesCount: messages.length
    });

    // Make request to OpenAI
    const completion = await openai.chat.completions.create(requestBody);

    // Extract response content
    const responseContent = completion.choices[0]?.message?.content || 'No response generated';

    res.json({
      success: true,
      content: responseContent,
      usage: completion.usage,
      model: completion.model
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);

    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        error: 'OpenAI API quota exceeded. Please check your billing details.',
        type: 'quota_exceeded'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        error: 'Invalid OpenAI API key. Please check your configuration.',
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

    // Generic error handling
    res.status(500).json({
      error: error.message || 'An error occurred while processing your request',
      type: 'server_error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
});