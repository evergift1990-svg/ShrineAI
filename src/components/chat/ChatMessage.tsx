/**
 * SHRINE AI - Chat Message Component
 * 
 * Individual message bubble with provider badge, streaming cursor,
 * and markdown-like formatting.
 * 
 * Logic:
 * 1. Render user messages right-aligned, assistant left-aligned
 * 2. Show provider badge with icon and color
 * 3. Animate streaming with a blinking cursor
 * 4. Fade-in animation via Framer Motion
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, Sparkles, Brain, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType, MODEL_CONFIGS, ModelProvider } from '@/types/ai';

const ICON_MAP: Record<string, React.ElementType> = {
    Zap,
    Bot,
    Sparkles,
    Brain,
};

interface ChatMessageProps {
    message: ChatMessageType;
    index: number;
}

export function ChatMessageBubble({ message, index }: ChatMessageProps): React.JSX.Element {
    const isUser = message.role === 'user';
    const config = message.provider ? MODEL_CONFIGS[message.provider] : null;
    const ProviderIcon = config ? ICON_MAP[config.icon] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isUser
                        ? 'bg-amber-400/20 text-amber-400'
                        : config
                            ? `bg-gradient-to-br from-zinc-800 to-zinc-900 ${config.color}`
                            : 'bg-zinc-800 text-zinc-400'
                    }`}
            >
                {isUser ? (
                    <User className="h-4 w-4" />
                ) : ProviderIcon ? (
                    <ProviderIcon className="h-4 w-4" />
                ) : (
                    <Bot className="h-4 w-4" />
                )}
            </div>

            {/* Message Bubble */}
            <div
                className={`max-w-[80%] space-y-1 ${isUser ? 'items-end text-right' : 'items-start'
                    }`}
            >
                {/* Provider Badge */}
                {!isUser && config && (
                    <Badge
                        variant="outline"
                        className={`border-zinc-800 bg-zinc-900/50 text-[10px] ${config.color}`}
                    >
                        {config.name}
                    </Badge>
                )}

                {/* Content */}
                <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                            ? 'bg-amber-400/10 text-amber-100'
                            : 'bg-zinc-900/80 text-zinc-200 border border-zinc-800/50'
                        }`}
                >
                    {message.content || (
                        <span className="text-zinc-500 italic">Thinking...</span>
                    )}
                    {/* Streaming Cursor */}
                    {message.isStreaming && (
                        <motion.span
                            className="ml-0.5 inline-block h-4 w-[2px] bg-amber-400"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
