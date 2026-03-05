/**
 * SHRINE AI - Chat Input Component
 * 
 * Input bar with send button, auto-resize textarea, and keyboard shortcuts.
 * 
 * Logic:
 * 1. Textarea auto-resizes as content grows
 * 2. Submit on Enter (Shift+Enter for newline)
 * 3. Disable send while streaming
 * 4. Show selected model indicator
 * 5. Cancel button appears during streaming
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
    onSend: (message: string) => void;
    onCancel: () => void;
    isStreaming: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    onCancel,
    isStreaming,
    placeholder = 'Send a message to the shrine...',
}: ChatInputProps): React.JSX.Element {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [input, adjustHeight]);

    const handleSubmit = useCallback(() => {
        if (input.trim() && !isStreaming) {
            onSend(input.trim());
            setInput('');
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    }, [input, isStreaming, onSend]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    return (
        <motion.div
            className="border-t border-amber-400/10 bg-zinc-950/80 px-4 py-3 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
        >
            <div className="mx-auto flex max-w-4xl items-end gap-3">
                {/* Input */}
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        className="w-full resize-none rounded-xl border border-amber-400/10 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/30 focus:shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                        style={{ maxHeight: '200px' }}
                    />
                </div>

                {/* Send / Cancel Button */}
                <AnimatePresence mode="wait">
                    {isStreaming ? (
                        <motion.div
                            key="cancel"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Button
                                onClick={onCancel}
                                size="icon"
                                className="h-11 w-11 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                                <Square className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="send"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Button
                                onClick={handleSubmit}
                                disabled={!input.trim()}
                                size="icon"
                                className="h-11 w-11 rounded-xl bg-amber-400/20 text-amber-400 transition-all hover:bg-amber-400/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:opacity-30"
                            >
                                {isStreaming ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="mx-auto mt-2 max-w-4xl text-center text-[10px] text-zinc-600">
                Press Enter to send · Shift+Enter for new line
            </p>
        </motion.div>
    );
}
