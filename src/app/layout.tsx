/**
 * SHRINE AI - Root Layout
 * 
 * Logic:
 * 1. Load Inter font from Google Fonts for premium typography
 * 2. Wrap entire app with TooltipProvider, QueryProvider, and ModelContextProvider
 * 3. Set Shrine metadata (title, description)
 * 4. Apply dark background and antialiased text
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ModelContextProvider } from "@/contexts/ModelContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHRINE — AI Sanctuary",
  description:
    "Premier AI aggregator integrating Llama 3.3, GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet in one unified dashboard.",
  keywords: ["AI", "ChatGPT", "Gemini", "Claude", "Llama", "AI aggregator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-50`} suppressHydrationWarning>
        <QueryProvider>
          <ModelContextProvider>
            <TooltipProvider delayDuration={300}>
              {children}
            </TooltipProvider>
          </ModelContextProvider>
        </QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
