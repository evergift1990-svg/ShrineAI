/**
 * SHRINE AI - Gemini Provider (Gemini 1.5 Pro)
 * 
 * Strategy implementation for Gemini 1.5 Pro via Google Generative AI SDK.
 * 
 * Logic:
 * 1. Initialize GoogleGenerativeAI client with API key
 * 2. Convert messages to Gemini's Content[] format
 * 3. Use generateContentStream for real-time streaming
 * 4. Transform the async iterator into a ReadableStream
 * 5. Configure safety settings to avoid premature cutoffs
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AIProviderStrategy, ProviderError, SimpleMessage, createTextEncoder } from './base';

export class GeminiProvider implements AIProviderStrategy {
    provider = 'gemini' as const;
    private client: GoogleGenerativeAI;

    constructor() {
        this.client = new GoogleGenerativeAI(
            process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
        );
    }

    async createStream(messages: SimpleMessage[]): Promise<ReadableStream<Uint8Array>> {
        const encoder = createTextEncoder();

        try {
            const model = this.client.getGenerativeModel({
                model: 'gemini-2.0-flash',
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 8192,
                    temperature: 0.7,
                },
            });

            // Convert messages to Gemini format
            const systemMessage = messages.find((m) => m.role === 'system');
            const chatMessages = messages.filter((m) => m.role !== 'system');

            const history = chatMessages.slice(0, -1).map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

            const lastMessage = chatMessages[chatMessages.length - 1];

            const chat = model.startChat({
                history: history as Array<{ role: string; parts: Array<{ text: string }> }>,
                ...(systemMessage && {
                    systemInstruction: { role: 'system', parts: [{ text: systemMessage.content }] },
                }),
            });

            const result = await chat.sendMessageStream(lastMessage.content);

            return new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of result.stream) {
                            const text = chunk.text();
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
                'gemini',
                500,
                `Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
