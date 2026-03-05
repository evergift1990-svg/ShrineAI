/**
 * SHRINE AI - Sidebar Component
 * 
 * Model selector sidebar with gold glow effects on selection.
 * 
 * Logic:
 * 1. List all 4 AI models with their icons and colors
 * 2. In single mode: click to select one model
 * 3. In grid mode: toggles to enable/disable models for comparison
 * 4. Gold glow animation on selected model using Framer Motion
 * 5. Show model descriptions and status
 * 6. Clear chat button
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Bot,
    Sparkles,
    Brain,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useModelContext } from '@/contexts/ModelContext';
import { MODEL_CONFIGS, ModelProvider } from '@/types/ai';

const ICON_MAP: Record<string, React.ElementType> = {
    Zap,
    Bot,
    Sparkles,
    Brain,
};

interface SidebarProps {
    onClearChat: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar({
    onClearChat,
    collapsed,
    onToggleCollapse,
}: SidebarProps): React.JSX.Element {
    const {
        selectedProvider,
        activeProviders,
        viewMode,
        setSelectedProvider,
        toggleProvider,
        isProviderActive,
    } = useModelContext();

    const handleModelClick = (provider: ModelProvider): void => {
        if (viewMode === 'single') {
            setSelectedProvider(provider);
        } else {
            toggleProvider(provider);
        }
    };

    const providers = Object.values(MODEL_CONFIGS);

    return (
        <motion.aside
            className="relative flex h-full flex-col border-r border-amber-400/10 bg-zinc-950/60 backdrop-blur-xl"
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {/* Toggle Button */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-3 top-20 z-10 rounded-full border border-amber-400/20 bg-zinc-900 p-1 text-zinc-400 transition-colors hover:text-amber-400"
            >
                {collapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </button>

            {/* Models Header */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-semibold uppercase tracking-widest text-zinc-500"
                        >
                            {viewMode === 'single' ? 'Select Model' : 'Active Models'}
                        </motion.h2>
                    )}
                </AnimatePresence>
            </div>

            {/* Model List */}
            <div className="flex-1 space-y-1 px-2">
                {providers.map((config) => {
                    const Icon = ICON_MAP[config.icon];
                    const isSelected =
                        viewMode === 'single'
                            ? selectedProvider === config.id
                            : isProviderActive(config.id);

                    return (
                        <Tooltip key={config.id}>
                            <TooltipTrigger asChild>
                                <motion.button
                                    onClick={() => handleModelClick(config.id)}
                                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 ${isSelected
                                            ? 'bg-amber-400/5'
                                            : 'hover:bg-zinc-800/50'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Gold Glow Effect */}
                                    {isSelected && (
                                        <motion.div
                                            className="absolute inset-0 rounded-xl border border-amber-400/30"
                                            layoutId="sidebar-glow"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: 1,
                                                boxShadow: '0 0 20px rgba(251, 191, 36, 0.15), inset 0 0 20px rgba(251, 191, 36, 0.05)',
                                            }}
                                            transition={{ duration: 0.4, type: 'spring' }}
                                        />
                                    )}

                                    {/* Icon */}
                                    <div
                                        className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${isSelected
                                                ? `bg-gradient-to-br from-amber-400/20 to-amber-600/10 ${config.color}`
                                                : 'bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300'
                                            }`}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>

                                    {/* Label */}
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="relative z-10 flex-1 text-left"
                                            >
                                                <div
                                                    className={`text-sm font-medium transition-colors ${isSelected ? 'text-amber-200' : 'text-zinc-400 group-hover:text-zinc-200'
                                                        }`}
                                                >
                                                    {config.name}
                                                </div>
                                                <div className="text-[10px] text-zinc-600">
                                                    {config.description}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Active Indicator */}
                                    {!collapsed && isSelected && (
                                        <motion.div
                                            className="relative z-10 h-2 w-2 rounded-full bg-amber-400"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        />
                                    )}
                                </motion.button>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right">{config.name}</TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>

            <Separator className="bg-amber-400/10" />

            {/* Clear Chat */}
            <div className="p-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            onClick={onClearChat}
                            className={`w-full gap-2 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 ${collapsed ? 'px-0' : ''
                                }`}
                            size="sm"
                        >
                            <Trash2 className="h-4 w-4 flex-shrink-0" />
                            <AnimatePresence mode="wait">
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs"
                                    >
                                        Clear Chat
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </TooltipTrigger>
                    {collapsed && (
                        <TooltipContent side="right">Clear Chat</TooltipContent>
                    )}
                </Tooltip>
            </div>
        </motion.aside>
    );
}
