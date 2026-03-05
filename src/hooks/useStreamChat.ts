/**
 * SHRINE AI - Streaming Chat Hook
 * 
 * Custom hook for streaming AI responses from a single provider.
 * 
 * Logic:
 * 1. Maintain messages array and streaming state
 * 2. sendMessage: Posts to /api/chat with provider + messages
 * 3. Reads the response as a ReadableStream via getReader()
 * 4. Appends text chunks in real-time to the assistant message
 * 5. Handles errors gracefully per-provider
 * 6. Supports abort via AbortController for cancellation
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ModelProvider } from '@/types/ai';

interface UseStreamChatReturn {
    messages: ChatMessage[];
    isStreaming: boolean;
    error: string | null;
    sendMessage: (content: string, provider: ModelProvider) => Promise<void>;
    clearMessages: () => void;
    cancelStream: () => void;
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useStreamChat(): UseStreamChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (content: string, provider: ModelProvider) => {
        if (!content.trim()) return;

        setError(null);

        // Add user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        };

        // Add placeholder assistant message
        const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: '',
            provider,
            timestamp: Date.now(),
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setIsStreaming(true);

        // Create abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    messages: [
                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                        { role: 'user', content: content.trim() },
                    ],
                }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                fullContent += text;

                // Update the assistant message content in real-time
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessage.id
                            ? { ...msg, content: fullContent, isStreaming: true }
                            : msg
                    )
                );
            }

            // Mark streaming as complete
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessage.id
                        ? { ...msg, content: fullContent, isStreaming: false }
                        : msg
                )
            );
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // User cancelled - mark message as complete with current content
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessage.id
                            ? { ...msg, isStreaming: false }
                            : msg
                    )
                );
            } else {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);

                // Update assistant message with error
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessage.id
                            ? {
                                ...msg,
                                content: '',
                                isStreaming: false,
                            }
                            : msg
                    )
                );
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [messages]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    const cancelStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    return {
        messages,
        isStreaming,
        error,
        sendMessage,
        clearMessages,
        cancelStream,
    };
}
