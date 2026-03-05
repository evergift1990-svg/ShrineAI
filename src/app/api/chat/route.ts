/**
 * SHRINE AI - Unified Chat API Route
 * 
 * Edge Runtime endpoint that handles all AI model requests.
 * Uses the strategy pattern to route to the correct provider.
 * 
 * Logic:
 * 1. Parse request body for provider and messages
 * 2. Validate the provider config (API key present)
 * 3. Instantiate the correct provider via strategy pattern
 * 4. Return streaming response with proper headers
 * 5. On error, return JSON error with appropriate status code
 * 
 * Headers: Content-Type: text/plain; charset=utf-8 with Transfer-Encoding: chunked
 */

import { NextRequest, NextResponse } from 'next/server';
import { ModelProvider } from '@/types/ai';
import { validateConfig } from '@/lib/validateConfig';
import { getProvider } from '@/lib/providers';
import { ProviderError } from '@/lib/providers/base';

export const runtime = 'nodejs';

const VALID_PROVIDERS: ModelProvider[] = ['groq', 'openai', 'gemini', 'anthropic'];

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const body = await request.json();
        const { messages, provider } = body;

        // Validate provider
        if (!provider || !VALID_PROVIDERS.includes(provider)) {
            return NextResponse.json(
                { error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required and must not be empty' },
                { status: 400 }
            );
        }

        // Validate API key is configured
        const validation = validateConfig(provider);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: `Missing API key(s) for ${provider}: ${validation.missingKeys.join(', ')}`,
                    provider,
                    configured: false,
                },
                { status: 503 }
            );
        }

        // Get the provider strategy and create stream
        const aiProvider = getProvider(provider);
        const stream = await aiProvider.createStream(messages);

        // Return streaming response
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Provider': provider,
            },
        });
    } catch (error) {
        if (error instanceof ProviderError) {
            return NextResponse.json(
                {
                    error: error.message,
                    provider: error.provider,
                },
                { status: error.statusCode }
            );
        }

        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
