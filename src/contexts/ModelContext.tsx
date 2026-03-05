/**
 * SHRINE AI - Model Context
 * 
 * React Context for managing model selection state across the application.
 * 
 * Logic:
 * 1. Track selected provider(s) for single and grid view
 * 2. Track the current view mode (single vs grid)
 * 3. Provide actions to toggle providers and switch view mode
 * 4. Persist selection in localStorage (client-side only)
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ModelProvider, ViewMode } from '@/types/ai';

interface ModelContextState {
    selectedProvider: ModelProvider;
    activeProviders: ModelProvider[];
    viewMode: ViewMode;
    setSelectedProvider: (provider: ModelProvider) => void;
    toggleProvider: (provider: ModelProvider) => void;
    setViewMode: (mode: ViewMode) => void;
    isProviderActive: (provider: ModelProvider) => boolean;
}

const ModelContext = createContext<ModelContextState | null>(null);

export function ModelContextProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [selectedProvider, setSelectedProvider] = useState<ModelProvider>('openai');
    const [activeProviders, setActiveProviders] = useState<ModelProvider[]>([
        'groq',
        'openai',
        'gemini',
        'anthropic',
    ]);
    const [viewMode, setViewMode] = useState<ViewMode>('single');

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('shrine-model-state');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.selectedProvider) setSelectedProvider(parsed.selectedProvider);
                if (parsed.activeProviders) setActiveProviders(parsed.activeProviders);
                if (parsed.viewMode) setViewMode(parsed.viewMode);
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(
                'shrine-model-state',
                JSON.stringify({ selectedProvider, activeProviders, viewMode })
            );
        } catch {
            // Ignore localStorage errors
        }
    }, [selectedProvider, activeProviders, viewMode]);

    const toggleProvider = useCallback((provider: ModelProvider) => {
        setActiveProviders((prev) => {
            if (prev.includes(provider)) {
                // Don't allow removing all providers
                if (prev.length <= 1) return prev;
                return prev.filter((p) => p !== provider);
            }
            return [...prev, provider];
        });
    }, []);

    const isProviderActive = useCallback(
        (provider: ModelProvider) => activeProviders.includes(provider),
        [activeProviders]
    );

    return (
        <ModelContext.Provider
            value={{
                selectedProvider,
                activeProviders,
                viewMode,
                setSelectedProvider,
                toggleProvider,
                setViewMode,
                isProviderActive,
            }}
        >
            {children}
        </ModelContext.Provider>
    );
}

export function useModelContext(): ModelContextState {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModelContext must be used within a ModelContextProvider');
    }
    return context;
}
