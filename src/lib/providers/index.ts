/**
 * SHRINE AI - Provider Registry
 * 
 * Central registry for all AI providers using the strategy pattern.
 * Maps ModelProvider type to its concrete implementation class.
 * 
 * Logic:
 * 1. Import all provider implementations
 * 2. getProvider: Factory function to instantiate the correct provider
 * 3. Used by the API route to dynamically select the provider
 */

import { ModelProvider } from '@/types/ai';
import { AIProviderStrategy } from './base';
import { GroqProvider } from './groq';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { AnthropicProvider } from './anthropic';

const providerMap: Record<ModelProvider, new () => AIProviderStrategy> = {
    groq: GroqProvider,
    openai: OpenAIProvider,
    gemini: GeminiProvider,
    anthropic: AnthropicProvider,
};

export function getProvider(provider: ModelProvider): AIProviderStrategy {
    const ProviderClass = providerMap[provider];
    if (!ProviderClass) {
        throw new Error(`Unknown provider: ${provider}`);
    }
    return new ProviderClass();
}
