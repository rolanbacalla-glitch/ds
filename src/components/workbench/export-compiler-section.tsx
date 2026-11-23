"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
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
  Lock,
  ShieldCheck,
  Clock,
  PaperPlaneTilt,
  XCircle,
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
  const [organisation, setOrganisation] = useState("");
  const [reason, setReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const { showToast } = useToast();
  const {
    user,
    isAdmin,
    canExport,
    portfolioSettings,
    myAccessRequest,
    openAuthModal,
    openAdminConsole,
    submitAccessRequest,
    logAuditEvent,
  } = useAuth();

  const cursorRulesPreview = useMemo(
    () => `---
description: Antigravity Design System (${seed.name}) — AI Coding Agent Guardrails
globs: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css", "tokens/**/*.json"]
alwaysApply: true
---

# Antigravity Multi-Platform Agent Rules (Cursor & Google Antigravity)
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

  const handleBlockedAction = (targetLabel: string) => {
    if (user?.emailVerified) {
      void logAuditEvent("blocked_export_attempt", targetLabel);
    }
    openAuthModal(
      `Exporting "${targetLabel}" requires admin sign-in or approved portfolio access.`
    );
  };

  const handleCopy = () => {
    if (!canExport) {
      handleBlockedAction(current.label);
      return;
    }
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    void logAuditEvent("export_copy", current.label);
    showToast(`Copied ${current.label} to clipboard`);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = (targetOverride?: ExportTarget) => {
    const item = targetOverride ? exportOutputs[targetOverride] : current;
    if (!canExport) {
      handleBlockedAction(item.label);
      return;
    }
    const blob = new Blob([item.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename.split("/").pop() || "tokens.txt";
    a.click();
    URL.revokeObjectURL(url);
    void logAuditEvent("export_download", item.filename);
    showToast(`Downloaded ${item.filename.split("/").pop()}`);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setRequestError(null);
    try {
      await submitAccessRequest(organisation, reason);
      setOrganisation("");
      setReason("");
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <section id="export" className="scroll-mt-24 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--sys-outline-variant)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--sys-primary)]">
            <span>Export &amp; Handoff</span>
            <span className="text-[var(--sys-on-surface-quaternary)]">·</span>
            <span>{canExport ? "Authorised Access Active" : "Portfolio Protected"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sys-on-surface)]">
            Export Your Theme for{" "}
            <span className="font-serif italic font-normal text-[var(--sys-primary)]">
              Code, Figma &amp; AI
            </span>
          </h2>
          <p className="text-sm text-[var(--sys-on-surface-secondary)] max-w-3xl leading-relaxed">
            Every colour, typography, and corner adjustment compiles into ready-to-use files for
            Tailwind CSS v4, Figma Variables, Google Stitch{" "}
            <code className="font-mono">DESIGN.md</code>, and AI coding rules. Downloads are
            protected to safeguard this live portfolio.
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
            {canExport ? <DownloadSimple size={15} /> : <Lock size={15} className="text-[var(--sys-primary)]" />}
            <span>{canExport ? "Download Figma Tokens" : "Figma Tokens (Locked)"}</span>
          </button>
        </div>
      </div>

      <div className="tonal-card overflow-hidden">
        {/* Platform Target Tabs */}
        <div className="p-4 bg-[var(--sys-surface-container)] border-b border-[var(--sys-outline-variant)] flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Export Platform Target" className="flex flex-wrap gap-2">
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
                    "min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-all",
                    active
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold shadow-sm"
                      : "bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)]"
                  )}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload()}
              className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {canExport ? <DownloadSimple size={14} /> : <Lock size={14} className="text-[var(--sys-primary)]" />}
              <span>{canExport ? "Save File" : "Unlock File"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--sys-primary)] text-[var(--sys-on-primary)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {!canExport ? (
                <>
                  <Lock size={14} weight="bold" />
                  <span>Protected</span>
                </>
              ) : copied ? (
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

        {/* Code Output Well — Unlocked vs Portfolio Protection Gate */}
        {canExport ? (
          <pre className="p-6 bg-[var(--sys-surface-lowest)] text-xs font-mono text-[var(--sys-on-surface)] overflow-x-auto leading-relaxed max-h-[460px]">
            <code>{current.code}</code>
          </pre>
        ) : (
          <div className="p-6 sm:p-8 bg-[var(--sys-surface-lowest)] space-y-6">
            {/* Safe Non-Sensitive Preview Header */}
            <pre className="p-4 rounded-xl bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)] text-xs font-mono text-[var(--sys-on-surface-tertiary)] overflow-x-auto leading-relaxed select-none">
              <code>{current.safeSummary}</code>
            </pre>

            {/* Portfolio Lock Gate Card */}
            <div className="p-6 rounded-2xl bg-[var(--sys-surface-low)] border border-[var(--sys-outline)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--sys-primary-container)] text-[var(--sys-on-primary-container)] flex items-center justify-center">
                    <Lock size={18} weight="bold" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[var(--sys-primary)] font-semibold">
                      Portfolio Showcase Protection
                    </div>
                    <h3 className="text-base font-bold text-[var(--sys-on-surface)]">
                      Exports &amp; Source Downloads Are Restricted
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                  {portfolioSettings.lockMessage}
                </p>

                <div className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] pt-1">
                  Maintained by{" "}
                  <strong className="text-[var(--sys-on-surface)]">
                    {portfolioSettings.ownerDisplayName}
                  </strong>{" "}
                  · Live viewing remains open to everyone
                </div>
              </div>

              {/* Right Column: Dynamic Auth / Verification / Access Request Action */}
              <div className="lg:col-span-6">
                {!user ? (
                  <div className="p-5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[var(--sys-on-surface)]">
                        Authorised Sign-In Required
                      </div>
                      <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                        Sign in with Google, Apple, or Email to unlock Admin exports or submit an
                        export access request.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openAuthModal(
                          "Sign in with Google, Apple, or Email to unlock Admin exports or request access."
                        )
                      }
                      className="w-full min-h-[42px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-opacity"
                    >
                      <Lock size={15} weight="bold" />
                      <span>Sign In with Google, Apple or Email</span>
                    </button>
                  </div>
                ) : !user.emailVerified ? (
                  <div className="p-5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] space-y-3">
                    <div className="text-xs font-bold text-[var(--sys-on-surface)]">
                      Email Verification Needed
                    </div>
                    <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                      Signed in as <strong className="font-mono">{user.email}</strong>. Please
                      verify your email address before requesting export permission.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuthModal("Please verify your email address to continue.")}
                      className="min-h-[40px] px-4 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold cursor-pointer"
                    >
                      Open Verification Controls
                    </button>
                  </div>
                ) : myAccessRequest?.status === "pending" ? (
                  <div className="p-5 rounded-xl bg-[var(--sys-surface-lowest)] border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                      <Clock size={16} weight="fill" />
                      <span>Export Access Request Pending Review</span>
                    </div>
                    <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                      Your request for{" "}
                      <strong className="text-[var(--sys-on-surface)]">
                        {myAccessRequest.organisation}
                      </strong>{" "}
                      has been sent to {portfolioSettings.ownerDisplayName}. Exports will unlock
                      automatically as soon as your request is approved.
                    </p>
                  </div>
                ) : myAccessRequest?.status === "rejected" ? (
                  <div className="p-5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--border-feedback-error)]/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-feedback-error)]">
                      <XCircle size={16} weight="fill" />
                      <span>Export Access Not Approved</span>
                    </div>
                    <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                      Your request for source export access was declined by the portfolio owner.
                      You may continue exploring all interactive visual sections freely.
                    </p>
                  </div>
                ) : portfolioSettings.allowAccessRequests ? (
                  <form
                    onSubmit={handleRequestSubmit}
                    className="p-5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] space-y-3"
                  >
                    <div className="text-xs font-bold text-[var(--sys-on-surface)]">
                      Request Export Permission ({user.email})
                    </div>
                    {requestError && (
                      <div className="text-xs text-[var(--text-feedback-error)]">
                        {requestError}
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      placeholder="Your company or organisation"
                      className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-[var(--sys-surface-low)] border border-[var(--sys-outline)] text-xs text-[var(--sys-on-surface)] outline-none focus:border-[var(--sys-primary)]"
                    />
                    <textarea
                      rows={2}
                      required
                      minLength={5}
                      maxLength={400}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Brief reason (e.g. hiring team technical review)..."
                      className="w-full px-3 py-2 rounded-lg bg-[var(--sys-surface-low)] border border-[var(--sys-outline)] text-xs text-[var(--sys-on-surface)] outline-none focus:border-[var(--sys-primary)] resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingRequest}
                      className="w-full min-h-[40px] px-4 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      <span>{submittingRequest ? "Submitting..." : "Submit Access Request"}</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                    Export access requests are currently paused by{" "}
                    <strong className="text-[var(--sys-on-surface)]">
                      {portfolioSettings.ownerDisplayName}
                    </strong>
                    .
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
