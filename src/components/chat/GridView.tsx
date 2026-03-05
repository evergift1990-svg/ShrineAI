/**
 * SHRINE AI - Grid View Component
 * 
 * 2x2 CSS Grid comparison layout where 4 streams run in parallel.
 * 
 * Logic:
 * 1. Render active providers in a grid-cols-2 layout
 * 2. Display user's message above the grid
 * 3. Each ModelPanel streams independently
 * 4. Pass streamStates from useModelComparison to each panel
 * 5. Responsive: collapses to single column on small screens
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { ModelPanel } from './ModelPanel';
import { ChatInput } from './ChatInput';
import { useModelContext } from '@/contexts/ModelContext';
import { useModelComparison } from '@/hooks/useModelComparison';
import { ChatMessage as ChatMessageType } from '@/types/ai';

export function GridView(): React.JSX.Element {
    const { activeProviders } = useModelContext();
    const { streamStates, userMessages, isAnyStreaming, sendToAll, clearAll, cancelAll } =
        useModelComparison();

    const handleSend = (content: string): void => {
        sendToAll(content, activeProviders);
    };

    const lastUserMessage = userMessages[userMessages.length - 1];

    return (
        <div className="flex h-full flex-col">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* User Message Display */}
                {lastUserMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto mb-4 max-w-4xl"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="rounded-2xl bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                                {lastUserMessage.content}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Grid of Model Panels */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2" style={{ minHeight: '400px' }}>
                    {activeProviders.map((provider) => (
                        <ModelPanel
                            key={provider}
                            provider={provider}
                            streamState={streamStates[provider]}
                        />
                    ))}
                </div>
            </div>

            {/* Input */}
            <ChatInput
                onSend={handleSend}
                onCancel={cancelAll}
                isStreaming={isAnyStreaming}
                placeholder={`Compare across ${activeProviders.length} models...`}
            />
        </div>
    );
}
