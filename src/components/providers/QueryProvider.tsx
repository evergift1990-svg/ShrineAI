/**
 * SHRINE AI - Query Provider
 * 
 * Wraps the app with TanStack Query's QueryClientProvider
 * for managing API state across the application.
 * 
 * Logic:
 * 1. Create QueryClient with default options
 * 2. Provide it to the entire app tree
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
