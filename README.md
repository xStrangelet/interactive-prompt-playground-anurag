# Interactive Prompt Playground

A sophisticated web application for experimenting with OpenAI's language models and fine-tuning prompt parameters in real-time. This tool provides an intuitive interface for testing different configurations and understanding how various parameters affect AI responses.

## 🚀 How to Run the Playground

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure OpenAI API Key**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. **Start the Application**
   ```bash
   npm run dev
   ```
   
   This starts both the frontend (Vite) and backend (Express) servers concurrently.

4. **Access the Playground**
   Open your browser to `http://localhost:5173`

## ✨ Features

### 🎛️ Parameter Control
- **Temperature (0.0 - 2.0)**: Controls randomness and creativity in responses
- **Max Tokens (1 - 4000)**: Sets the maximum length of generated responses
- **Presence Penalty (0.0 - 2.0)**: Encourages the model to talk about new topics
- **Frequency Penalty (0.0 - 2.0)**: Reduces repetition of words and phrases
- **Stop Sequences**: Custom strings that halt generation when encountered

### 🤖 Model Selection
- **GPT-3.5 Turbo**: Fast, cost-effective for most tasks
- **GPT-4**: More capable, better reasoning and complex tasks
- **GPT-4 Turbo**: Latest model with improved performance

### 🎯 Quick Test Configurations
- **Precise & Focused**: Low temperature, short responses for factual queries
- **Balanced & Diverse**: Moderate creativity with varied vocabulary
- **Creative & Expansive**: High creativity for brainstorming and creative writing

### 🛠️ User Experience
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Copy to Clipboard**: Easily copy generated responses
- **Clear All**: Reset all inputs and outputs with one click
- **Real-time Parameter Display**: See exact values as you adjust sliders
- **Token Usage Tracking**: Monitor API consumption and costs

## 📊 Parameter Comparison Results

| Configuration | Temperature | Max Tokens | Presence | Frequency | Sample Output (Prompt: "Explain photosynthesis") |
|---------------|-------------|------------|----------|-----------|--------------------------------------------------|
| **Precise & Focused** | 0.0 | 50 | 0.0 | 0.0 | "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll." |
| **Balanced & Diverse** | 0.7 | 150 | 1.5 | 1.5 | "Photosynthesis represents nature's remarkable energy conversion system. Plants harness solar radiation through chlorophyll molecules, transforming atmospheric CO₂ and H₂O into glucose while releasing oxygen as a byproduct. This biochemical marvel sustains virtually all life on Earth." |
| **Creative & Expansive** | 1.2 | 300 | 0.0 | 1.5 | "Imagine plants as Earth's solar panels, but infinitely more elegant! Photosynthesis is like a microscopic dance where sunlight waltzes with carbon dioxide and water, choreographed by chlorophyll. This green magic transforms simple ingredients into life-sustaining sugar while gifting us the oxygen we breathe. It's the ultimate renewable energy system that's been powering our planet for billions of years, making every leaf a tiny factory of wonder." |

| Parameter Test | Temperature | Response Creativity | Response Length | Repetition Level |
|----------------|-------------|-------------------|-----------------|------------------|
| Low Temp (0.0) | 0.0 | Factual, consistent | Concise | Minimal |
| Medium Temp (0.7) | 0.7 | Balanced creativity | Moderate | Low |
| High Temp (1.2) | 1.2 | Highly creative | Expansive | Variable |
| High Frequency Penalty | 0.7 | Moderate | Moderate | Very low |
| High Presence Penalty | 0.7 | Topic-diverse | Moderate | Low |

## 🧠 Parameter Impact Analysis

The Interactive Prompt Playground reveals fascinating insights into how different parameters fundamentally alter AI behavior and response quality. Temperature emerges as the most dramatic control, acting like a creativity dial that transforms the model's personality. At low temperatures (0.0-0.3), the AI becomes a precise, factual machine that consistently produces the same output for identical inputs, making it ideal for technical documentation or factual queries. As temperature increases to moderate levels (0.7-0.9), the model develops a more conversational and varied voice while maintaining coherence, striking an optimal balance for most applications. At high temperatures (1.2-2.0), the AI becomes genuinely creative and unpredictable, generating unique metaphors and creative expressions, though sometimes at the cost of factual accuracy.

The penalty parameters work in subtle but powerful ways to shape response quality and diversity. Frequency penalty acts as a repetition filter, preventing the model from falling into loops of repeated phrases or concepts, which is particularly valuable for longer responses or creative writing tasks. Presence penalty encourages topical exploration, pushing the model to introduce new concepts and ideas rather than dwelling on familiar territory. When combined thoughtfully, these parameters create a sophisticated control system that allows users to fine-tune AI responses for specific use cases—from generating precise technical explanations to crafting engaging creative content. The playground demonstrates that effective AI interaction isn't just about the prompt itself, but about understanding and leveraging these underlying parameters to achieve desired outcomes.

## 🔧 Technical Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js server with OpenAI API integration
- **Development**: Vite for fast development and hot reloading
- **Styling**: Custom CSS with dark mode support and smooth animations

## 📝 License

This project is open source and available under the MIT License.