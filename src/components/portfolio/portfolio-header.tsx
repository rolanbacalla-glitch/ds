"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function PortfolioHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4 sm:px-6">
      <nav
        aria-label="Primary portfolio navigation"
        className="liquid-glass-regular flex items-center justify-between rounded-full px-4 py-2 sm:px-6"
      >
        <Link
          href="/portfolio"
          className="inline-flex min-h-[40px] items-center gap-2.5 text-sm font-semibold tracking-tight text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2 rounded-full px-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sys-primary)] font-mono text-xs font-bold text-[var(--sys-on-primary)]">
            RB
          </span>
          <span>Rolan Bacalla</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <Link
            href="/portfolio#work"
            className="inline-flex min-h-[40px] items-center rounded-full px-3.5 text-xs font-medium text-[var(--sys-on-surface-secondary)] transition-colors hover:text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            Case Studies
          </Link>
          <Link
            href="/portfolio#archive"
            className="inline-flex min-h-[40px] items-center rounded-full px-3.5 text-xs font-medium text-[var(--sys-on-surface-secondary)] transition-colors hover:text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            Craft Archive
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-[var(--sys-on-surface-secondary)] transition-colors hover:text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Design System
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] transition-colors hover:bg-[var(--sys-surface-high)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <a
            href="mailto:hello@rolanbacalla.com?subject=Senior%20Product%20%26%20Design%20Systems%20Opportunity"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--sys-primary)] px-4 text-xs font-semibold text-[var(--sys-on-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            Connect
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  );
}
