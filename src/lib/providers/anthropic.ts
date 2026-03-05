/**
 * SHRINE AI - Anthropic Provider (Claude 3.5 Sonnet)
 * 
 * Strategy implementation for Claude 3.5 Sonnet via official @anthropic-ai/sdk.
 * Uses the official SDK to support Claude's full 200k context window.
 * 
 * Logic:
 * 1. Initialize Anthropic client with API key
 * 2. Extract system message (Anthropic handles it separately)
 * 3. Use messages.stream() for real-time streaming
 * 4. Transform the stream events into a ReadableStream
 * 5. Handle errors with ProviderError
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIProviderStrategy, ProviderError, SimpleMessage, createTextEncoder } from './base';

export class AnthropicProvider implements AIProviderStrategy {
    provider = 'anthropic' as const;
    private client: Anthropic;

    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    async createStream(messages: SimpleMessage[]): Promise<ReadableStream<Uint8Array>> {
        const encoder = createTextEncoder();

        try {
            // Extract system message - Anthropic handles it as a separate parameter
            const systemMessage = messages.find((m) => m.role === 'system');
            const chatMessages = messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                }));

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 8192,
                messages: chatMessages,
                ...(systemMessage && { system: systemMessage.content }),
                temperature: 0.7,
                stream: true,
            });

            return new ReadableStream({
                async start(controller) {
                    try {
                        for await (const event of response) {
                            if (
                                event.type === 'content_block_delta' &&
                                event.delta.type === 'text_delta'
                            ) {
                                controller.enqueue(encoder.encode(event.delta.text));
                            }
                        }
                        controller.close();
                    } catch (error) {
                        const errMsg = error instanceof Error ? error.message : 'Stream error';
                        controller.enqueue(encoder.encode(`\n[Error: ${errMsg}]`));
                        controller.close();
                    }
                },
            });
        } catch (error) {
            throw new ProviderError(
                'anthropic',
                500,
                `Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
