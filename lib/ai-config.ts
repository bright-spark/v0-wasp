// Configuration for AI providers
export const AI_CONFIG = {
  // OpenRouter configuration (OpenAI-compatible)
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    models: {
      "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
      "gpt-4": "openai/gpt-4",
      "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
    },
  },

  // Default model settings
  defaults: {
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: `You are Claude, a helpful AI assistant created by Vercel. You are knowledgeable, thoughtful, and aim to be helpful while being honest about your limitations. Respond in a conversational and friendly manner.`,
  },
}
