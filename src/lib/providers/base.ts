/**
 * SHRINE AI - Base Provider Interface
 * 
 * Defines the contract for all AI provider strategies.
 * Each provider must implement createStream() which returns
 * a ReadableStream of text chunks for real-time display.
 * 
 * Logic:
 * 1. formatMessages: Normalizes ChatMessage[] to provider-specific format
 * 2. createStream: Returns ReadableStream<Uint8Array> for SSE
 * 3. handleError: Standardizes error responses across providers
 */

import { ChatMessage, ModelProvider } from '@/types/ai';

export type SimpleMessage = Pick<ChatMessage, 'role' | 'content'>;

export interface AIProviderStrategy {
    provider: ModelProvider;
    createStream(messages: SimpleMessage[]): Promise<ReadableStream<Uint8Array>>;
}

export class ProviderError extends Error {
    constructor(
        public provider: ModelProvider,
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'ProviderError';
    }
}

export function createTextEncoder(): TextEncoder {
    return new TextEncoder();
}
