/**
 * SHRINE AI - Groq Provider (Llama 3.3)
 * 
 * Strategy implementation for Llama 3.3 70B via Groq's ultra-fast inference.
 * 
 * Logic:
 * 1. Initialize Groq client with API key
 * 2. Send messages using chat.completions.create with streaming
 * 3. Transform the async iterator into a ReadableStream
 * 4. Handle errors with ProviderError
 */

import Groq from 'groq-sdk';
import { AIProviderStrategy, ProviderError, SimpleMessage, createTextEncoder } from './base';

export class GroqProvider implements AIProviderStrategy {
    provider = 'groq' as const;
    private client: Groq;

    constructor() {
        this.client = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    async createStream(messages: SimpleMessage[]): Promise<ReadableStream<Uint8Array>> {
        const encoder = createTextEncoder();

        try {
            const stream = await this.client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: messages.map((m) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content,
                })),
                stream: true,
                max_tokens: 8192,
                temperature: 0.7,
            });

            return new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of stream) {
                            const text = chunk.choices[0]?.delta?.content;
                            if (text) {
                                controller.enqueue(encoder.encode(text));
                            }
                        }
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                },
            });
        } catch (error) {
            throw new ProviderError(
                'groq',
                500,
                `Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
