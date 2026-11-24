"use client";

import React from "react";
import { Sun, Moon, Swatches, DownloadSimple, ArrowUp } from "phosphor-react";
import { SEED_PRESETS, type SeedConfig } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface FloatingStudioDockProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  seed: SeedConfig;
  onSelectPreset: (preset: SeedConfig) => void;
  onJumpExport: () => void;
  showScrollTop: boolean;
  onScrollTop: () => void;
}

/**
 * Figma-inspired Floating Studio Dock (Z-Level 2 Liquid Glass)
 * Quick-access pill for Light/Dark polarity, OKLCH brand preset cycling, and exports.
 */
export const FloatingStudioDock: React.FC<FloatingStudioDockProps> = ({
  theme,
  onToggleTheme,
  seed,
  onSelectPreset,
  onJumpExport,
  showScrollTop,
  onScrollTop,
}) => {
  const handleCyclePreset = () => {
    const idx = SEED_PRESETS.findIndex((p) => p.name === seed.name);
    const next = SEED_PRESETS[(idx + 1) % SEED_PRESETS.length];
    if (next) onSelectPreset(next);
  };

  return (
    <div
      role="region"
      aria-label="Studio Quick Controls"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)]"
    >
      <div className="liquid-glass-regular rounded-full px-2 py-1.5 shadow-2xl border border-[var(--sys-outline)] flex items-center gap-1.5">
        {/* Light / Dark Polarity Switch */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className={cn(
            "min-h-[36px] px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors",
            "bg-[var(--sys-surface-low)]/80 hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)]"
          )}
        >
          {theme === "dark" ? (
            <>
              <Sun size={15} weight="bold" className="text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} weight="bold" className="text-[var(--sys-primary)]" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        <span aria-hidden="true" className="w-px h-5 bg-[var(--sys-outline-variant)]" />

        {/* OKLCH Preset Cycler */}
        <button
          type="button"
          onClick={handleCyclePreset}
          title="Cycle OKLCH brand seed preset"
          className="min-h-[36px] px-3 rounded-full text-xs font-mono inline-flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--sys-surface-high)]/70 text-[var(--sys-on-surface)]"
        >
          <span
            aria-hidden="true"
            className="w-2.5 h-2.5 rounded-full bg-[var(--sys-primary)] ring-2 ring-[var(--sys-primary)]/30 shrink-0"
          />
          <span className="truncate max-w-[120px] sm:max-w-[160px]">{seed.name}</span>
          <Swatches size={14} className="text-[var(--sys-on-surface-tertiary)] shrink-0" />
        </button>

        <span aria-hidden="true" className="w-px h-5 bg-[var(--sys-outline-variant)]" />

        {/* Quick Export Jump */}
        <button
          type="button"
          onClick={onJumpExport}
          className="min-h-[36px] px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer bg-[var(--sys-primary)] text-[var(--sys-on-primary)] hover:opacity-95 transition-opacity"
        >
          <DownloadSimple size={14} weight="bold" />
          <span>Export</span>
        </button>

        {showScrollTop && (
          <button
            type="button"
            onClick={onScrollTop}
            aria-label="Back to top"
            className="min-w-[36px] min-h-[36px] rounded-full inline-flex items-center justify-center cursor-pointer hover:bg-[var(--sys-surface-high)]/70 text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] transition-colors"
          >
            <ArrowUp size={15} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
};
