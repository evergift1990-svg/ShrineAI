/**
 * SHRINE AI - Configuration Validator
 * 
 * Security utility that validates all required environment variables
 * are present before attempting API calls. Prevents runtime errors
 * from missing keys and provides clear error messages.
 * 
 * Logic:
 * 1. Define required keys per provider
 * 2. Check process.env for each key
 * 3. Return validation result with missing keys listed
 */

import { ModelProvider } from '@/types/ai';

interface ValidationResult {
    isValid: boolean;
    missingKeys: string[];
    provider: ModelProvider;
}

const PROVIDER_ENV_KEYS: Record<ModelProvider, string[]> = {
    groq: ['GROQ_API_KEY'],
    openai: ['OPENAI_API_KEY'],
    gemini: ['GOOGLE_GENERATIVE_AI_API_KEY'],
    anthropic: ['ANTHROPIC_API_KEY'],
};

export function validateConfig(provider: ModelProvider): ValidationResult {
    const requiredKeys = PROVIDER_ENV_KEYS[provider];
    const missingKeys = requiredKeys.filter((key) => !process.env[key]);

    return {
        isValid: missingKeys.length === 0,
        missingKeys,
        provider,
    };
}

export function validateAllConfigs(): Record<ModelProvider, ValidationResult> {
    const providers: ModelProvider[] = ['groq', 'openai', 'gemini', 'anthropic'];
    const results = {} as Record<ModelProvider, ValidationResult>;

    for (const provider of providers) {
        results[provider] = validateConfig(provider);
    }

    return results;
}

export function getConfiguredProviders(): ModelProvider[] {
    const providers: ModelProvider[] = ['groq', 'openai', 'gemini', 'anthropic'];
    return providers.filter((p) => validateConfig(p).isValid);
}
