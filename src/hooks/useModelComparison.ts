/**
 * SHRINE AI - Model Comparison Hook
 * 
 * Custom hook for running parallel streams across multiple providers
 * in the Comparison/Grid View mode.
 * 
 * Logic:
 * 1. Accept a list of active providers
 * 2. sendToAll: Fires off parallel fetch requests to /api/chat for each provider
 * 3. Each stream runs independently - if one fails, others continue (graceful degradation)
 * 4. Maintains per-provider StreamState for independent UI updates
 * 5. Uses AbortController per-stream for individual cancellation
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ModelProvider, StreamState } from '@/types/ai';

interface UseModelComparisonReturn {
    streamStates: Record<ModelProvider, StreamState>;
    userMessages: ChatMessage[];
    isAnyStreaming: boolean;
    sendToAll: (content: string, providers: ModelProvider[]) => Promise<void>;
    clearAll: () => void;
    cancelAll: () => void;
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const initialStreamState = (provider: ModelProvider): StreamState => ({
    provider,
    isStreaming: false,
    content: '',
    error: null,
    isComplete: false,
});

export function useModelComparison(): UseModelComparisonReturn {
    const [streamStates, setStreamStates] = useState<Record<ModelProvider, StreamState>>({
        groq: initialStreamState('groq'),
        openai: initialStreamState('openai'),
        gemini: initialStreamState('gemini'),
        anthropic: initialStreamState('anthropic'),
    });
    const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
    const [isAnyStreaming, setIsAnyStreaming] = useState(false);
    const abortControllersRef = useRef<Map<ModelProvider, AbortController>>(new Map());

    const streamFromProvider = useCallback(
        async (content: string, provider: ModelProvider, allMessages: ChatMessage[]) => {
            const abortController = new AbortController();
            abortControllersRef.current.set(provider, abortController);

            // Set streaming state
            setStreamStates((prev) => ({
                ...prev,
                [provider]: {
                    ...prev[provider],
                    isStreaming: true,
                    content: '',
                    error: null,
                    isComplete: false,
                },
            }));

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider,
                        messages: [
                            ...allMessages.map((m) => ({ role: m.role, content: m.content })),
                            { role: 'user', content },
                        ],
                    }),
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                if (!response.body) throw new Error('No response body');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    fullContent += text;

                    setStreamStates((prev) => ({
                        ...prev,
                        [provider]: {
                            ...prev[provider],
                            content: fullContent,
                            isStreaming: true,
                        },
                    }));
                }

                setStreamStates((prev) => ({
                    ...prev,
                    [provider]: {
                        ...prev[provider],
                        content: fullContent,
                        isStreaming: false,
                        isComplete: true,
                    },
                }));
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    setStreamStates((prev) => ({
                        ...prev,
                        [provider]: {
                            ...prev[provider],
                            isStreaming: false,
                            isComplete: true,
                        },
                    }));
                } else {
                    setStreamStates((prev) => ({
                        ...prev,
                        [provider]: {
                            ...prev[provider],
                            isStreaming: false,
                            error: err instanceof Error ? err.message : 'An error occurred',
                            isComplete: true,
                        },
                    }));
                }
            } finally {
                abortControllersRef.current.delete(provider);
            }
        },
        []
    );

    const sendToAll = useCallback(
        async (content: string, providers: ModelProvider[]) => {
            if (!content.trim() || providers.length === 0) return;

            const userMessage: ChatMessage = {
                id: generateId(),
                role: 'user',
                content: content.trim(),
                timestamp: Date.now(),
            };

            setUserMessages((prev) => [...prev, userMessage]);
            setIsAnyStreaming(true);

            // Fire all streams in parallel - they run independently
            const promises = providers.map((provider) =>
                streamFromProvider(content.trim(), provider, userMessages)
            );

            await Promise.allSettled(promises);
            setIsAnyStreaming(false);
        },
        [streamFromProvider, userMessages]
    );

    const clearAll = useCallback(() => {
        setUserMessages([]);
        setStreamStates({
            groq: initialStreamState('groq'),
            openai: initialStreamState('openai'),
            gemini: initialStreamState('gemini'),
            anthropic: initialStreamState('anthropic'),
        });
    }, []);

    const cancelAll = useCallback(() => {
        abortControllersRef.current.forEach((controller) => controller.abort());
        abortControllersRef.current.clear();
        setIsAnyStreaming(false);
    }, []);

    return {
        streamStates,
        userMessages,
        isAnyStreaming,
        sendToAll,
        clearAll,
        cancelAll,
    };
}
