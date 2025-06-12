import React, { useState } from 'react';
import { Play, Settings, MessageSquare, Sliders, Brain, AlertCircle, CheckCircle, Zap, Moon, Sun, Copy, RotateCcw, Check } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  content?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  error?: string;
  type?: string;
}

interface TestConfig {
  name: string;
  description: string;
  temperature: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

function App() {
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [userPrompt, setUserPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [stopSequence, setStopSequence] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ApiResponse['usage'] | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const testConfigs: TestConfig[] = [
    {
      name: 'Precise & Focused',
      description: 'Low temperature, short responses',
      temperature: 0.0,
      maxTokens: 50,
      presencePenalty: 0.0,
      frequencyPenalty: 0.0,
    },
    {
      name: 'Balanced & Diverse',
      description: 'Moderate creativity, varied vocabulary',
      temperature: 0.7,
      maxTokens: 150,
      presencePenalty: 1.5,
      frequencyPenalty: 1.5,
    },
    {
      name: 'Creative & Expansive',
      description: 'High creativity, longer responses',
      temperature: 1.2,
      maxTokens: 300,
      presencePenalty: 0.0,
      frequencyPenalty: 1.5,
    },
  ];

  const applyTestConfig = (config: TestConfig) => {
    setTemperature(config.temperature);
    setMaxTokens(config.maxTokens);
    setPresencePenalty(config.presencePenalty);
    setFrequencyPenalty(config.frequencyPenalty);
  };

  const clearAll = () => {
    setSystemPrompt('You are a helpful assistant.');
    setUserPrompt('');
    setTemperature(0.7);
    setMaxTokens(1000);
    setPresencePenalty(0.0);
    setFrequencyPenalty(0.0);
    setStopSequence('');
    setModel('gpt-3.5-turbo');
    setOutput('');
    setError(null);
    setUsage(null);
  };

  const copyToClipboard = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleRunPrompt = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a user prompt');
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput('');
    setUsage(null);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          systemPrompt,
          userPrompt,
          temperature,
          maxTokens,
          presencePenalty,
          frequencyPenalty,
          stopSequence,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.content) {
        setOutput(data.content);
        setUsage(data.usage || null);
      } else {
        setError(data.error || 'An unknown error occurred');
      }
    } catch (err) {
      console.error('Request failed:', err);
      setError('Failed to connect to the server. Make sure the backend is running.');
    } finally {
      setIsRunning(false);
    }
  };

  const getErrorMessage = (error: string) => {
    if (error.includes('API key')) {
      return (
        <div className="space-y-2">
          <p>{error}</p>
          <p className="text-sm">
            1. Create a <code className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>.env</code> file in the project root
          </p>
          <p className="text-sm">
            2. Add: <code className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded`}>OPENAI_API_KEY=your_key_here</code>
          </p>
          <p className="text-sm">
            3. Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>
      );
    }
    return error;
  };

  const themeClasses = {
    bg: darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
    card: darkMode ? 'bg-gray-800/70 backdrop-blur-sm border-gray-700/20' : 'bg-white/70 backdrop-blur-sm border-white/20',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400 focus:border-blue-400' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    configCard: darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50 border-gray-600 hover:border-blue-400' : 'bg-gradient-to-br from-white to-gray-50 hover:from-amber-50 hover:to-orange-50 border-gray-200 hover:border-amber-300',
    outputBg: darkMode ? 'bg-gray-700' : 'bg-gray-50',
    outputText: darkMode ? 'text-gray-200' : 'text-gray-700',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
              AI Prompt Studio
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`ml-4 p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-600'}`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <p className={`${themeClasses.textSecondary} text-lg`}>Fine-tune your AI interactions with precision controls</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={clearAll}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                title="Clear all inputs and output"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Test Configs Section */}
            <div className={`${themeClasses.card} rounded-2xl p-6 shadow-lg border`}>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-600" />
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Quick Test Configs</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {testConfigs.map((config, index) => (
                  <button
                    key={index}
                    onClick={() => applyTestConfig(config)}
                    className={`p-4 ${themeClasses.configCard} border rounded-xl transition-all duration-200 text-left group hover:shadow-md`}
                  >
                    <div className={`font-semibold ${themeClasses.text} mb-1 group-hover:text-amber-700`}>
                      {config.name}
                    </div>
                    <div className={`text-xs ${themeClasses.textMuted} mb-3`}>
                      {config.description}
                    </div>
                    <div className={`space-y-1 text-xs font-mono ${themeClasses.textMuted}`}>
                      <div className="flex justify-between">
                        <span>Temp:</span>
                        <span>{config.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span>{config.maxTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Presence:</span>
                        <span>{config.presencePenalty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frequency:</span>
                        <span>{config.frequencyPenalty}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompts Section */}
            <div className={`${themeClasses.card} rounded-2xl p-6 shadow-lg border`}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Prompts</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="system-prompt" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    System Prompt
                  </label>
                  <textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className={`w-full h-24 px-3 py-2 ${themeClasses.input} rounded-lg resize-none transition-colors`}
                    placeholder="Set the AI's behavior and context..."
                  />
                </div>
                
                <div>
                  <label htmlFor="user-prompt" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    User Prompt *
                  </label>
                  <textarea
                    id="user-prompt"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className={`w-full h-32 px-3 py-2 ${themeClasses.input} rounded-lg resize-none transition-colors`}
                    placeholder="Enter your prompt here..."
                  />
                </div>
              </div>
            </div>

            {/* Model Selection */}
            <div className={`${themeClasses.card} rounded-2xl p-6 shadow-lg border`}>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-emerald-600" />
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Model Configuration</h2>
              </div>
              
              <div>
                <label htmlFor="model" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={`w-full px-3 py-2 ${themeClasses.input} rounded-lg transition-colors`}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                </select>
              </div>
            </div>

            {/* Parameters Section */}
            <div className={`${themeClasses.card} rounded-2xl p-6 shadow-lg border`}>
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-purple-600" />
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Parameters</h2>
              </div>
              
              <div className="space-y-6">
                {/* Temperature */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="temperature" className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                      Temperature
                    </label>
                    <span className="text-sm font-mono bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
                      {temperature.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className={`flex justify-between text-xs ${themeClasses.textMuted} mt-1`}>
                    <span>0.0 (Focused)</span>
                    <span>2.0 (Creative)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="max-tokens" className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                      Max Tokens
                    </label>
                    <span className="text-sm font-mono bg-emerald-50 dark:bg-emerald-900/50 px-2 py-1 rounded text-emerald-700 dark:text-emerald-300">
                      {maxTokens}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="max-tokens"
                    min="1"
                    max="4000"
                    step="50"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className={`flex justify-between text-xs ${themeClasses.textMuted} mt-1`}>
                    <span>1</span>
                    <span>4000</span>
                  </div>
                </div>

                {/* Presence Penalty */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="presence-penalty" className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                      Presence Penalty
                    </label>
                    <span className="text-sm font-mono bg-purple-50 dark:bg-purple-900/50 px-2 py-1 rounded text-purple-700 dark:text-purple-300">
                      {presencePenalty.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="presence-penalty"
                    min="0"
                    max="2"
                    step="0.1"
                    value={presencePenalty}
                    onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className={`flex justify-between text-xs ${themeClasses.textMuted} mt-1`}>
                    <span>0.0</span>
                    <span>2.0</span>
                  </div>
                </div>

                {/* Frequency Penalty */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="frequency-penalty" className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                      Frequency Penalty
                    </label>
                    <span className="text-sm font-mono bg-orange-50 dark:bg-orange-900/50 px-2 py-1 rounded text-orange-700 dark:text-orange-300">
                      {frequencyPenalty.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="frequency-penalty"
                    min="0"
                    max="2"
                    step="0.1"
                    value={frequencyPenalty}
                    onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className={`flex justify-between text-xs ${themeClasses.textMuted} mt-1`}>
                    <span>0.0</span>
                    <span>2.0</span>
                  </div>
                </div>

                {/* Stop Sequence */}
                <div>
                  <label htmlFor="stop-sequence" className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    Stop Sequence (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="stop-sequence"
                    value={stopSequence}
                    onChange={(e) => setStopSequence(e.target.value)}
                    className={`w-full px-3 py-2 ${themeClasses.input} rounded-lg transition-colors`}
                    placeholder="\\n, END, STOP"
                  />
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunPrompt}
              disabled={isRunning || !userPrompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Play className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? 'Running Prompt...' : 'Run Prompt'}
            </button>
          </div>

          {/* Output Panel */}
          <div className={`${themeClasses.card} rounded-2xl p-6 shadow-lg border`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Output</h2>
              <div className="flex items-center gap-2">
                {usage && (
                  <div className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary}`}>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{usage.total_tokens} tokens</span>
                  </div>
                )}
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    title="Copy output to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className={`mb-4 p-4 ${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className={`${darkMode ? 'text-red-300' : 'text-red-700'} text-sm`}>
                    {getErrorMessage(error)}
                  </div>
                </div>
              </div>
            )}

            {/* Usage Stats */}
            {usage && (
              <div className={`mb-4 p-3 ${darkMode ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg`}>
                <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                  <div className="flex justify-between">
                    <span>Prompt tokens:</span>
                    <span className="font-mono">{usage.prompt_tokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion tokens:</span>
                    <span className="font-mono">{usage.completion_tokens}</span>
                  </div>
                  <div className={`flex justify-between font-semibold border-t ${darkMode ? 'border-green-600' : 'border-green-300'} pt-1 mt-1`}>
                    <span>Total tokens:</span>
                    <span className="font-mono">{usage.total_tokens}</span>
                  </div>
                </div>
              </div>
            )}

            <div className={`${themeClasses.outputBg} rounded-lg p-4 min-h-[500px] max-h-[500px] overflow-y-auto`}>
              {output ? (
                <pre className={`text-sm ${themeClasses.outputText} whitespace-pre-wrap leading-relaxed`}>
                  {output}
                </pre>
              ) : !error ? (
                <div className={`flex items-center justify-center h-full ${themeClasses.textMuted}`}>
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your AI response will appear here</p>
                    <p className="text-sm mt-1">Configure your prompts and parameters, then click "Run Prompt"</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;