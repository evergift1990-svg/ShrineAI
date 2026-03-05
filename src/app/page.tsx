/**
 * SHRINE AI - Main Dashboard Page
 * 
 * Logic:
 * 1. Render Header at top
 * 2. Sidebar on the left (collapsible)
 * 3. ChatInterface in the main content area
 * 4. Apply shrine-grid-bg and shrine-radial-glow for atmospheric background
 * 5. Full viewport height layout
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useModelContext } from '@/contexts/ModelContext';

export default function Dashboard(): React.JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { viewMode } = useModelContext();

  const handleClearChat = useCallback(() => {
    // Trigger page reload to clear all state for simplicity
    // In production, this would dispatch a clear action
    window.location.reload();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none fixed inset-0 shrine-grid-bg" />
      <div className="pointer-events-none fixed inset-0 shrine-radial-glow" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onClearChat={handleClearChat}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Chat Area */}
        <main className="relative flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}
