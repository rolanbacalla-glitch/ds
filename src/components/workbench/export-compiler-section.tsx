"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SlidingTabList } from "@/components/ui/sliding-tab-list";
import {
  generateTailwindV4Export,
  generateW3CTokensJSON,
  generateDesignMdExport,
  type SeedConfig,
} from "@/lib/tokens";
import {
  Copy,
  Check,
  DownloadSimple,
  FigmaLogo,
  Sparkle,
  TerminalWindow,
  FileCode,
  ShieldCheck,
} from "phosphor-react";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/auth-provider";

interface ExportCompilerSectionProps {
  seed: SeedConfig;
}

type ExportTarget = "tailwind" | "figma" | "stitch" | "cursor";

export const ExportCompilerSection: React.FC<ExportCompilerSectionProps> = ({ seed }) => {
  const [activeTarget, setActiveTarget] = useState<ExportTarget>("tailwind");
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();
  const {
    user,
    isAdmin,
    openAdminConsole,
    logAuditEvent,
  } = useAuth();

  const cursorRulesPreview = useMemo(
    () => `---
description: RB Design System (${seed.name}) — AI Coding Agent Guardrails
globs: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css", "tokens/**/*.json"]
alwaysApply: true
---

# RB Design System Multi-Platform Agent Rules (Cursor & Antigravity)
- Active Preset: ${seed.name} (Hue: ${seed.hue}°, Chroma: ${seed.chroma}, Radius Scale: ${seed.radiusScale}x)
- Typography Stack: Manrope (Sans), Newsreader Variable (Modern Display Serif), IBM Plex Mono (Mono)
- Next.js 16.2+ App Router: dynamic route params are Promises and must be awaited.
- Tailwind CSS v4: bind strictly to Tier-2 Semantic Tokens (--bg-action-primary, --sys-primary, --text-primary, --text-feedback-error).
- Z-Axis Spatial Discipline:
  - Z-Level 1 (.tonal-card): Content cards & data tables (NO backdrop blur).
  - Z-Level 2 (.liquid-glass-regular): Floating navbars, command bars & modals ONLY.
- WCAG 2.2 AA: Minimum 4.5:1 text contrast, 2px solid --border-focus-ring with 2px offset, >= 24x24px hit targets.`,
    [seed]
  );

  const exportOutputs: Record<
    ExportTarget,
    { label: string; filename: string; platform: string; code: string; safeSummary: string }
  > = useMemo(
    () => ({
      tailwind: {
        label: "Tailwind v4 + CSS Vars",
        filename: "src/styles/tokens.generated.css",
        platform: "Next.js 16 + Tailwind CSS v4",
        code: generateTailwindV4Export(seed),
        safeSummary: `/* Antigravity Design System — ${seed.name} */\n/* Target: Tailwind CSS v4 + OKLCH Variables (Manrope · Newsreader · IBM Plex Mono) */\n/* [Full compiled stylesheet protected for portfolio viewing] */`,
      },
      figma: {
        label: "Figma Variables (DTCG)",
        filename: "exports/figma-variables.tokens.json",
        platform: "Figma Variables & Tokens Studio",
        code: generateW3CTokensJSON(seed),
        safeSummary: `{\n  "$schema": "https://tr.designtokens.org/format/",\n  "meta": { "system": "Antigravity Design System", "preset": "${seed.name}" },\n  "status": "Protected portfolio bundle — sign in or request export access"\n}`,
      },
      stitch: {
        label: "Google Stitch (DESIGN.md)",
        filename: "DESIGN.md",
        platform: "Google Stitch (@google/design.md)",
        code: generateDesignMdExport(seed),
        safeSummary: `# Design System Specification: ${seed.name}\n\n> Full multi-platform DESIGN.md specification is restricted to authorised users.`,
      },
      cursor: {
        label: "Antigravity & Cursor Rules",
        filename: ".cursor/rules/design-system.mdc",
        platform: "Google Antigravity & Cursor IDE",
        code: cursorRulesPreview,
        safeSummary: `---\ndescription: Antigravity Design System (${seed.name}) — AI Guardrails\n---\n# Full agent rule file is protected for portfolio viewing.`,
      },
    }),
    [seed, cursorRulesPreview]
  );

  const current = exportOutputs[activeTarget];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    if (user?.emailVerified) {
      void logAuditEvent("export_copy", current.label);
    }
    showToast(`Copied ${current.label} to clipboard`);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = (targetOverride?: ExportTarget) => {
    const item = targetOverride ? exportOutputs[targetOverride] : current;
    const blob = new Blob([item.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename.split("/").pop() || "tokens.txt";
    a.click();
    URL.revokeObjectURL(url);
    if (user?.emailVerified) {
      void logAuditEvent("export_download", item.filename);
    }
    showToast(`Downloaded ${item.filename.split("/").pop()}`);
  };

  return (
    <section id="export" className="scroll-mt-24 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--sys-outline-variant)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--sys-primary)]">
            <span>Export &amp; Handoff</span>
            <span className="text-[var(--sys-on-surface-quaternary)]">·</span>
            <span>Open Access · v3.0</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sys-on-surface)]">
            Export Your Theme for{" "}
            <span className="font-serif italic font-normal text-[var(--sys-primary)]">
              Code, Figma &amp; AI
            </span>
          </h2>
          <p className="text-sm text-[var(--sys-on-surface-secondary)] max-w-3xl leading-relaxed">
            Every colour, typography, and corner adjustment compiles into ready-to-use files for
            Tailwind CSS v4, Figma Variables (W3C DTCG), Google Stitch{" "}
            <code className="font-mono">DESIGN.md</code>, and AI coding rules—free to copy or
            download without sign-in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={openAdminConsole}
              className="min-h-[40px] px-4 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary-container)] text-[var(--sys-on-primary-container)] border border-[var(--sys-primary)]/40 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={15} weight="fill" />
              <span>Manage Access Rules</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDownload("figma")}
            className="min-h-[40px] px-4 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-xs font-mono font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <DownloadSimple size={15} />
            <span>Download Figma Tokens</span>
          </button>
        </div>
      </div>

      <div className="tonal-card overflow-hidden">
        {/* Platform Target Tabs */}
        <div className="p-4 bg-[var(--sys-surface-container)] border-b border-[var(--sys-outline-variant)] flex flex-wrap items-center justify-between gap-3">
          <SlidingTabList
            activeKey={activeTarget}
            ariaLabel="Export Platform Target"
            className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)]"
            indicatorClassName="rounded-lg bg-[var(--sys-primary)] shadow-sm"
          >
            {[
              { id: "tailwind" as const, label: "Tailwind v4 CSS", icon: FileCode },
              { id: "figma" as const, label: "Figma Variables (DTCG)", icon: FigmaLogo },
              { id: "stitch" as const, label: "Google Stitch (DESIGN.md)", icon: Sparkle },
              { id: "cursor" as const, label: "Antigravity / Cursor Rules", icon: TerminalWindow },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTarget === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setActiveTarget(tab.id)}
                  className={cn(
                    "relative z-10 min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-colors duration-200",
                    active
                      ? "text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </SlidingTabList>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload()}
              className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <DownloadSimple size={14} />
              <span>Save File</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--sys-primary)] text-[var(--sys-on-primary)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} weight="bold" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Output</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="px-6 py-2.5 bg-[var(--sys-surface-lowest)] border-b border-[var(--sys-outline-variant)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--sys-on-surface-tertiary)]">
          <span>
            Target Path: <strong className="text-[var(--sys-on-surface)]">{current.filename}</strong>
          </span>
          <span>
            Platform: <strong className="text-[var(--sys-primary)]">{current.platform}</strong>
          </span>
        </div>

        {/* Open-Access Code Output Well (v3.0) */}
        <pre className="p-6 bg-[var(--sys-surface-lowest)] text-xs font-mono text-[var(--sys-on-surface)] overflow-x-auto leading-relaxed max-h-[460px]">
          <code>{current.code}</code>
        </pre>
      </div>
    </section>
  );
};
