/**
 * SHRINE AI - Header Component
 * 
 * Top bar with SHRINE branding, view mode toggle, and model info.
 * 
 * Logic:
 * 1. Display SHRINE logo with amber glow
 * 2. View mode toggle buttons (Single / Grid)
 * 3. Current model indicator
 * 4. Shrine-themed glassmorphism styling
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Columns2, MessageSquare, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useModelContext } from '@/contexts/ModelContext';

export function Header(): React.JSX.Element {
    const { viewMode, setViewMode } = useModelContext();

    return (
        <header className="sticky top-0 z-50 border-b border-amber-400/10 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative">
                        <Flame className="h-8 w-8 text-amber-400" />
                        <div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-amber-400/20 blur-xl" />
                    </div>
                    <div>
                        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-xl font-bold tracking-wider text-transparent">
                            SHRINE
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                            AI Sanctuary
                        </p>
                    </div>
                </motion.div>

                {/* View Toggle */}
                <motion.div
                    className="flex items-center gap-1 rounded-lg border border-amber-400/10 bg-zinc-900/50 p-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('single')}
                                className={`h-8 gap-2 px-3 text-xs transition-all duration-300 ${viewMode === 'single'
                                        ? 'bg-amber-400/10 text-amber-400 shadow-inner shadow-amber-400/10'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Single
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Chat with one model</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`h-8 gap-2 px-3 text-xs transition-all duration-300 ${viewMode === 'grid'
                                        ? 'bg-amber-400/10 text-amber-400 shadow-inner shadow-amber-400/10'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <Columns2 className="h-3.5 w-3.5" />
                                Compare
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Compare all models side by side</TooltipContent>
                    </Tooltip>
                </motion.div>

                {/* Status */}
                <motion.div
                    className="flex items-center gap-2 text-xs text-zinc-500"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                    <span>Systems Online</span>
                </motion.div>
            </div>
        </header>
    );
}
