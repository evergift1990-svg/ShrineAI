/**
 * SHRINE AI - Model Panel Component
 * 
 * Individual model stream panel used in Grid/Comparison view.
 * Shows a single provider's streaming response with its header,
 * content area, and error/loading states.
 * 
 * Logic:
 * 1. Display model name/icon in header
 * 2. Show streaming content with auto-scroll
 * 3. Show loading spinner while streaming
 * 4. Graceful degradation: show error state without crashing others
 * 5. Empty state when no response yet
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, Sparkles, Brain, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MODEL_CONFIGS, ModelProvider, StreamState } from '@/types/ai';

const ICON_MAP: Record<string, React.ElementType> = {
    Zap,
    Bot,
    Sparkles,
    Brain,
};

interface ModelPanelProps {
    provider: ModelProvider;
    streamState: StreamState;
}

export function ModelPanel({ provider, streamState }: ModelPanelProps): React.JSX.Element {
    const config = MODEL_CONFIGS[provider];
    const Icon = ICON_MAP[config.icon];
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll during streaming
    useEffect(() => {
        if (streamState.isStreaming && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [streamState.content, streamState.isStreaming]);

    return (
        <motion.div
            className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Panel Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-2.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800/80 ${config.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-zinc-300">{config.name}</span>

                {/* Status Badge */}
                {streamState.isStreaming && (
                    <Badge variant="outline" className="ml-auto border-amber-400/30 bg-amber-400/5 text-[10px] text-amber-400">
                        <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                        Streaming
                    </Badge>
                )}
                {streamState.isComplete && !streamState.error && (
                    <Badge variant="outline" className="ml-auto border-green-400/30 bg-green-400/5 text-[10px] text-green-400">
                        Complete
                    </Badge>
                )}
                {streamState.error && (
                    <Badge variant="outline" className="ml-auto border-red-400/30 bg-red-400/5 text-[10px] text-red-400">
                        <AlertCircle className="mr-1 h-2.5 w-2.5" />
                        Error
                    </Badge>
                )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div ref={scrollRef} className="h-full overflow-y-auto p-4">
                    {/* Error State - Graceful Degradation */}
                    {streamState.error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-3 py-8 text-center"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <AlertCircle className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-400">Provider Unavailable</p>
                                <p className="mt-1 text-xs text-zinc-500">{streamState.error}</p>
                            </div>
                            <p className="text-[10px] text-zinc-600">
                                Other models continue to function normally
                            </p>
                        </motion.div>
                    ) : streamState.content ? (
                        /* Streaming / Complete Content */
                        <div className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                            {streamState.content}
                            {streamState.isStreaming && (
                                <motion.span
                                    className="ml-0.5 inline-block h-4 w-[2px] bg-amber-400"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                                />
                            )}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <Icon className={`h-8 w-8 ${config.color} opacity-20`} />
                            <p className="text-xs text-zinc-600">Awaiting your message...</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </motion.div>
    );
}
