/**
 * SHRINE AI - Type Definitions
 * 
 * Core type system for the AI aggregator:
 * - ModelProvider: Union type for supported AI providers
 * - ModelConfig: Configuration for each provider (name, icon, color, model ID)
 * - ChatMessage: Standard message interface across all providers
 * - StreamState: Tracks the streaming state for each model panel
 * - ChatRequest: The unified request body sent to /api/chat
 * - ProviderStrategy: Interface for the strategy pattern
 */

export type ModelProvider = 'groq' | 'openai' | 'gemini' | 'anthropic';

export type ViewMode = 'single' | 'grid';

export interface ModelConfig {
  id: ModelProvider;
  name: string;
  model: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  bgGlow: string; // Glow effect color
  maxTokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: ModelProvider;
  timestamp: number;
  isStreaming?: boolean;
}

export interface StreamState {
  provider: ModelProvider;
  isStreaming: boolean;
  content: string;
  error: string | null;
  isComplete: boolean;
}

export interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  provider: ModelProvider;
  model?: string;
}

export interface ProviderStrategy {
  provider: ModelProvider;
  createStream(messages: Pick<ChatMessage, 'role' | 'content'>[]): Promise<ReadableStream>;
}

export interface ComparisonResult {
  provider: ModelProvider;
  content: string;
  error: string | null;
  duration: number;
}

export const MODEL_CONFIGS: Record<ModelProvider, ModelConfig> = {
  groq: {
    id: 'groq',
    name: 'Llama 3.3',
    model: 'llama-3.3-70b-versatile',
    description: 'Meta Llama 3.3 via Groq',
    icon: 'Zap',
    color: 'text-orange-400',
    bgGlow: 'shadow-orange-400/20',
    maxTokens: 8192,
  },
  openai: {
    id: 'openai',
    name: 'GPT-4o',
    model: 'gpt-4o',
    description: 'OpenAI GPT-4o',
    icon: 'Bot',
    color: 'text-green-400',
    bgGlow: 'shadow-green-400/20',
    maxTokens: 4096,
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    model: 'gemini-2.0-flash',
    description: 'Google Gemini 2.0 Flash',
    icon: 'Sparkles',
    color: 'text-blue-400',
    bgGlow: 'shadow-blue-400/20',
    maxTokens: 8192,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    model: 'claude-3-5-sonnet-20241022',
    description: 'Anthropic Claude 3.5 Sonnet',
    icon: 'Brain',
    color: 'text-purple-400',
    bgGlow: 'shadow-purple-400/20',
    maxTokens: 8192,
  },
};
