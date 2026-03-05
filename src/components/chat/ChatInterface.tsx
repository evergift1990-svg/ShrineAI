/**
 * SHRINE AI - Chat Interface Component
 * 
 * Main chat container that switches between Single and Grid view.
 * 
 * Logic:
 * 1. In single mode: traditional chat with messages and input
 * 2. In grid mode: render GridView with parallel streams
 * 3. Use useStreamChat for single mode
 * 4. Auto-scroll to bottom on new messages
 * 5. Welcome state when no messages
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Bot, Sparkles, Brain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessageBubble } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { GridView } from './GridView';
import { useModelContext } from '@/contexts/ModelContext';
import { useStreamChat } from '@/hooks/useStreamChat';
import { MODEL_CONFIGS } from '@/types/ai';

const ICON_MAP: Record<string, React.ElementType> = {
    Zap,
    Bot,
    Sparkles,
    Brain,
};

export function ChatInterface(): React.JSX.Element {
    const { viewMode, selectedProvider } = useModelContext();
    const { messages, isStreaming, error, sendMessage, clearMessages, cancelStream } =
        useStreamChat();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const config = MODEL_CONFIGS[selectedProvider];
    const SelectedIcon = ICON_MAP[config.icon];

    if (viewMode === 'grid') {
        return <GridView />;
    }

    return (
        <div className="flex h-full flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-hidden">
                <div ref={scrollRef} className="h-full overflow-y-auto">
                    {messages.length === 0 ? (
                        /* Welcome State */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex h-full flex-col items-center justify-center gap-6 p-8"
                        >
                            {/* Animated Shrine Icon */}
                            <motion.div
                                className="relative"
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Flame className="h-16 w-16 text-amber-400/60" />
                                <div className="absolute inset-0 animate-pulse blur-2xl">
                                    <Flame className="h-16 w-16 text-amber-400/30" />
                                </div>
                            </motion.div>

                            <div className="text-center">
                                <h2 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-2xl font-bold text-transparent">
                                    Welcome to the Shrine
                                </h2>
                                <p className="mt-2 max-w-md text-sm text-zinc-500">
                                    Your AI sanctuary awaits. Choose a model from the sidebar and begin your query.
                                </p>
                            </div>

                            {/* Current Model Info */}
                            <motion.div
                                className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <SelectedIcon className={`h-4 w-4 ${config.color}`} />
                                <span className="text-sm text-zinc-300">
                                    Currently selected: <span className="text-amber-400">{config.name}</span>
                                </span>
                            </motion.div>

                            {/* Quick Start Suggestions */}
                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {[
                                    'Explain quantum computing in simple terms',
                                    'Write a haiku about artificial intelligence',
                                    'Compare REST vs GraphQL architectures',
                                    'Help me debug a React component',
                                ].map((suggestion, idx) => (
                                    <motion.button
                                        key={suggestion}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                        onClick={() => sendMessage(suggestion, selectedProvider)}
                                        className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 text-left text-xs text-zinc-400 transition-all hover:border-amber-400/20 hover:bg-amber-400/5 hover:text-zinc-300"
                                    >
                                        {suggestion}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        /* Message List */
                        <div className="mx-auto max-w-4xl space-y-4 p-4">
                            <AnimatePresence mode="popLayout">
                                {messages.map((message, index) => (
                                    <ChatMessageBubble key={message.id} message={message} index={index} />
                                ))}
                            </AnimatePresence>

                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center text-sm text-red-400"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <ChatInput
                onSend={(msg) => sendMessage(msg, selectedProvider)}
                onCancel={cancelStream}
                isStreaming={isStreaming}
                placeholder={`Message ${config.name}...`}
            />
        </div>
    );
}
