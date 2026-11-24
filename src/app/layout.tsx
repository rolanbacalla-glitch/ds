/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "RB Design System — Perceptual & Spatial Workbench (v3.0)",
  description:
    "A three-tier OKLCH token architecture, tonal surface hierarchy, and optical Liquid Glass design system portfolio workbench crafted by Rolan Bacalla.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      data-theme="light"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('antigravity-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.toggle('dark',t==='dark');}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full bg-[var(--sys-surface-canvas)] text-[var(--sys-on-surface)] font-sans selection:bg-[var(--sys-primary)]/25 selection:text-[var(--sys-on-surface)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
