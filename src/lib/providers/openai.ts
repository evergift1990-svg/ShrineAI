/**
 * SHRINE AI - OpenAI Provider (GPT-4o)
 * 
 * Strategy implementation for GPT-4o via OpenAI API.
 * 
 * Logic:
 * 1. Initialize OpenAI client with API key
 * 2. Send messages using chat.completions.create with streaming
 * 3. Transform the async iterator into a ReadableStream
 * 4. Handle errors with ProviderError
 */

import OpenAI from 'openai';
import { AIProviderStrategy, ProviderError, SimpleMessage, createTextEncoder } from './base';

export class OpenAIProvider implements AIProviderStrategy {
    provider = 'openai' as const;
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async createStream(messages: SimpleMessage[]): Promise<ReadableStream<Uint8Array>> {
        const encoder = createTextEncoder();

        try {
            const stream = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: messages.map((m) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content,
                })),
                stream: true,
                max_tokens: 4096,
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
                'openai',
                500,
                `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
