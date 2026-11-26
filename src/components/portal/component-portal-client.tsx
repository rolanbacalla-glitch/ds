"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SlidingTabList } from "@/components/ui/sliding-tab-list";
import {
  COMPONENT_REGISTRY,
  COMPONENT_SLUGS,
  getComponentSemanticTokens,
  getComponentTier3Tokens,
  type ComponentSlug,
  type InteractiveStateMode,
} from "@/lib/component-registry";
import {
  ArrowLeft,
  Sun,
  Moon,
  Copy,
  Check,
  Code,
  Eye,
  ShieldCheck,
  WarningCircle,
  CheckCircle,
  Sparkle,
  Keyboard,
  Swatches,
  Sliders,
  MagnifyingGlass,
  ArrowsDownUp,
  X,
  Info,
  Cube,
  Lock,
  LockKey,
  SignOut,
} from "phosphor-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";

interface ComponentPortalClientProps {
  initialSlug: ComponentSlug;
  embedded?: boolean;
  onSelectSlug?: (slug: ComponentSlug) => void;
  onClose?: () => void;
}

const STATE_MODES: { id: InteractiveStateMode; label: string; badge: string }[] = [
  { id: "default", label: "Default", badge: "Resting" },
  { id: "hover", label: "Hover", badge: ":hover" },
  { id: "focus-visible", label: "Focus-Visible", badge: "WCAG 2.4.11" },
  { id: "active", label: "Active / Pressed", badge: ":active" },
  { id: "disabled", label: "Disabled", badge: ":disabled" },
  { id: "error", label: "Error / Invalid", badge: "aria-invalid" },
];

export const ComponentPortalClient: React.FC<ComponentPortalClientProps> = ({
  initialSlug,
  embedded = false,
  onSelectSlug,
  onClose,
}) => {
  const spec = COMPONENT_REGISTRY[initialSlug] ?? COMPONENT_REGISTRY["form-field"];
  const semanticTokens = getComponentSemanticTokens(spec.slug);
  const tier3Tokens = getComponentTier3Tokens(spec.slug);

  const { theme, toggleTheme } = useTheme();
  const [simulatedState, setSimulatedState] = useState<InteractiveStateMode>("default");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const {
    user,
    isAdmin,
    canCopySnippets,
    portfolioSettings,
    openAuthModal,
    openAdminConsole,
    signOutUser,
    logAuditEvent,
  } = useAuth();

  // Live Interactive FormField state
  const [fieldValue, setFieldValue] = useState("oklch(0.77 0.152 258)");
  const [emailValue, setEmailValue] = useState("architect@rolanbacalla.online");
  const formInputId = useId();

  // Live Interactive ModalDialog state (with FocusScope trap)
  const [modalOpen, setModalOpen] = useState(true);
  const [modalExportFormat, setModalExportFormat] = useState<"dtcg" | "tailwind" | "stitch">("dtcg");
  const modalRef = useRef<HTMLDivElement>(null);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);
  const modalTitleId = useId();
  const modalDescId = useId();

  // Live Interactive DataTable state
  const [tableFilter, setTableFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>(["--bg-action-primary"]);

  // FocusScope keyboard trap when ModalDialog specimen is active & open
  useEffect(() => {
    if (spec.slug !== "modal-dialog" || !modalOpen) return;
    const container = modalRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setModalOpen(false);
        modalTriggerRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const focusables = container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spec.slug, modalOpen]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (user?.emailVerified) {
      void logAuditEvent("export_copy", `Portal: ${spec.slug}/${key}`);
    }
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isInvalidField =
    simulatedState === "error" ||
    (fieldValue.trim().length > 0 && !fieldValue.trim().startsWith("oklch("));
  const isDisabled = simulatedState === "disabled";
  const isFocusSimulated = simulatedState === "focus-visible";
  const isHoverSimulated = simulatedState === "hover";
  const isActiveSimulated = simulatedState === "active";

  const filteredTokensForTable = semanticTokens
    .filter(
      (t) =>
        t.name.toLowerCase().includes(tableFilter.toLowerCase()) ||
        t.category.toLowerCase().includes(tableFilter.toLowerCase())
    )
    .sort((a, b) => {
      const cA = theme === "dark" ? a.contrastVsDarkCanvas : a.contrastVsLightCanvas;
      const cB = theme === "dark" ? b.contrastVsDarkCanvas : b.contrastVsLightCanvas;
      return sortAsc ? cA - cB : cB - cA;
    });

  const toggleRowSelection = (cssVar: string) => {
    setSelectedRows((prev) =>
      prev.includes(cssVar) ? prev.filter((item) => item !== cssVar) : [...prev, cssVar]
    );
  };

  return (
    <div
      className={
        embedded
          ? "linear-shell p-4 sm:p-6 text-[var(--sys-on-surface)] space-y-6"
          : "min-h-screen bg-[var(--sys-surface-canvas)] text-[var(--sys-on-surface)] pb-24"
      }
    >
      {embedded ? (
        onClose ? (
          <div className="flex items-center justify-end pb-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <X size={14} />
              <span>Close Spec</span>
            </button>
          </div>
        ) : null
      ) : (
      /* Z-Level 2: Unified Floating Liquid Glass Top Portal Chrome */
      <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4">
        <div
          style={{
            backdropFilter: "blur(40px) saturate(190%)",
            WebkitBackdropFilter: "blur(40px) saturate(190%)",
          }}
          className="max-w-[1400px] mx-auto rounded-2xl liquid-glass-regular backdrop-blur-2xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-xl space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-high)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back to Design System</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <span className="text-[var(--sys-on-surface-tertiary)] shrink-0" aria-hidden="true">
                /
              </span>
              <span className="text-[var(--sys-on-surface-secondary)] hidden md:inline shrink-0">Components</span>
              <span className="text-[var(--sys-on-surface-tertiary)] hidden md:inline shrink-0" aria-hidden="true">
                /
              </span>
              <span
                aria-current="page"
                className="font-semibold text-[var(--sys-primary)] px-2 py-0.5 rounded bg-[var(--sys-primary-container)] truncate"
              >
                {spec.name}
              </span>
            </nav>

            {/* Component Route Switcher — Wide Desktop (xl+) */}
            <div
              role="navigation"
              aria-label="Component Switcher"
              className="hidden xl:flex items-center gap-1 p-1 rounded-full bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] shrink-0"
            >
              {COMPONENT_SLUGS.map((slug) => {
                const item = COMPONENT_REGISTRY[slug];
                const active = slug === spec.slug;
                return (
                  <Link
                    key={slug}
                    href={`/components/${slug}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                      active
                        ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold shadow-sm"
                        : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Polarity & Auth Switchers */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
                className="min-h-[36px] px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-[var(--sys-surface-container)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)] cursor-pointer transition-all whitespace-nowrap"
              >
                {theme === "dark" ? (
                  <>
                    <Moon size={15} weight="fill" className="text-[var(--sys-primary)]" />
                    <span className="hidden md:inline">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={15} weight="fill" className="text-[var(--sys-primary)]" />
                    <span className="hidden md:inline">Light Mode</span>
                  </>
                )}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openAdminConsole}
                  className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--sys-primary)] text-[var(--sys-on-primary)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                <ShieldCheck size={14} weight="fill" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              )}

              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="min-h-[36px] px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--sys-surface-container)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LockKey size={14} weight="bold" className="text-[var(--sys-primary)]" />
                  <span>Sign In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  aria-label="Sign out"
                  title={`Sign out (${user.email})`}
                  className="min-h-[36px] min-w-[36px] rounded-full bg-[var(--sys-surface-container)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline)] flex items-center justify-center cursor-pointer"
                >
                  <SignOut size={14} weight="bold" />
                </button>
              )}
            </div>
          </div>

          {/* Responsive Component Switcher — Mobile, Tablet & Minimised Desktop (< 1280px) */}
          <div
            role="navigation"
            aria-label="Mobile Component Switcher"
            className="flex xl:hidden items-center gap-1.5 pt-2 border-t border-[var(--sys-outline-variant)] overflow-x-auto"
          >
            {COMPONENT_SLUGS.map((slug) => {
              const item = COMPONENT_REGISTRY[slug];
              const active = slug === spec.slug;
              return (
                <Link
                  key={slug}
                  href={`/components/${slug}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "min-h-[34px] px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 inline-flex items-center",
                    active
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold shadow-sm"
                      : "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)]"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      )}

      <div className={embedded ? "space-y-10" : "max-w-[1400px] mx-auto px-4 sm:px-8 pt-10 space-y-12"}>
        {/* 1. Component Title & Architectural Metadata Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--sys-outline-variant)]">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--sys-primary-container)] text-[var(--sys-primary)] font-semibold">
                {spec.bucket}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--sys-surface-container)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)]">
                {spec.zLayer}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-feedback-success-subtle)] text-[var(--text-feedback-success)] font-semibold flex items-center gap-1">
                <ShieldCheck size={14} weight="fill" />
                WCAG 2.2 AA Verified
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--sys-on-surface)]">
              {spec.name}
            </h1>
            <p className="text-base text-[var(--sys-on-surface-secondary)] leading-relaxed">
              {spec.tagline}
            </p>
          </div>

          {/* Mobile/Tablet Component Switcher Pills */}
          <div className="flex flex-wrap gap-1.5 lg:hidden">
            {COMPONENT_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/components/${slug}`}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono border",
                  slug === spec.slug
                    ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] border-transparent font-semibold"
                    : "bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-secondary)] border-[var(--sys-outline-variant)]"
                )}
              >
                /components/{slug}
              </Link>
            ))}
          </div>
        </section>

        {/* 2. Interactive Playground & Multi-State Matrix */}
        <section aria-labelledby="playground-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 8 Columns: Live Component Stage + State Matrix Controls */}
          <div className="lg:col-span-8 tonal-card overflow-hidden flex flex-col">
            {/* Toolbar: State Simulator + Preview/Code Toggle */}
            <div className="p-4 bg-[var(--sys-surface-container)] border-b border-[var(--sys-outline-variant)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[var(--sys-primary)]" />
                <span
                  id="playground-heading"
                  className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--sys-on-surface)]"
                >
                  Interactive State Simulator
                </span>
              </div>

              {/* Preview vs Code View Toggle */}
              <SlidingTabList
                activeKey={viewMode}
                ariaLabel="Specimen View Mode"
                className="inline-flex p-1 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)]"
                indicatorClassName="rounded-md bg-[var(--sys-primary)] shadow-xs"
              >
                <button
                  role="tab"
                  type="button"
                  aria-selected={viewMode === "preview"}
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "relative z-10 px-3 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors duration-200",
                    viewMode === "preview"
                      ? "text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  <Eye size={14} />
                  <span>Live Render</span>
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={viewMode === "code"}
                  onClick={() => setViewMode("code")}
                  className={cn(
                    "relative z-10 px-3 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors duration-200",
                    viewMode === "code"
                      ? "text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  <Code size={14} />
                  <span>React / TS Source</span>
                </button>
              </SlidingTabList>
            </div>

            {/* State Matrix Selector Bar */}
            <div
              role="group"
              aria-label="Simulate interactive component state"
              className="px-4 py-3 bg-[var(--sys-surface-low)] border-b border-[var(--sys-outline-variant)] flex flex-wrap items-center gap-2"
            >
              <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] mr-1">
                STATE MATRIX:
              </span>
              {STATE_MODES.map((mode) => {
                const active = simulatedState === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSimulatedState(mode.id)}
                    aria-pressed={active}
                    className={cn(
                      "min-h-[32px] px-3 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]",
                      active
                        ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] border-transparent font-semibold shadow-sm"
                        : "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] border-[var(--sys-outline-variant)] hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
                    )}
                  >
                    <span>{mode.label}</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.2 rounded",
                        active
                          ? "bg-black/20 text-[var(--sys-on-primary)]"
                          : "bg-[var(--sys-surface-container)] text-[var(--sys-on-surface-tertiary)]"
                      )}
                    >
                      {mode.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Stage: Either Live Component or Copyable Code */}
            {viewMode === "preview" ? (
              <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center swiss-grid-bg min-h-[380px]">
                {/* SPECIMEN 1: FORM FIELD INPUT */}
                {spec.slug === "form-field" && (
                  <div className="max-w-lg w-full mx-auto tonal-card-elevated p-6 space-y-6 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[var(--sys-outline-variant)] pb-3">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-[var(--sys-primary)] font-semibold">
                          LIVE SPECIMEN // FORM-FIELD
                        </span>
                        <h2 className="text-sm font-bold text-[var(--sys-on-surface)]">
                          Token Coordinate & Identity Configuration
                        </h2>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)]">
                        State: {simulatedState.toUpperCase()}
                      </span>
                    </div>

                    {/* Primary Monospace Token Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor={formInputId}
                        className="flex items-center justify-between text-xs font-semibold text-[var(--comp-form-field-text-label)]"
                      >
                        <span>
                          Primary Seed OKLCH Coordinate{" "}
                          <span className="text-[var(--text-feedback-error)]" aria-hidden="true">
                            *
                          </span>
                        </span>
                        <span className="font-mono text-[11px] text-[var(--sys-on-surface-tertiary)]">
                          Tier-1 Reference
                        </span>
                      </label>

                      <div className="relative flex items-center">
                        <span
                          aria-hidden="true"
                          className="w-4 h-4 rounded-full border border-white/25 absolute left-3.5 pointer-events-none"
                          style={{ backgroundColor: "var(--sys-primary)" }}
                        />
                        <input
                          id={formInputId}
                          type="text"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          disabled={isDisabled}
                          required
                          aria-invalid={isInvalidField}
                          aria-describedby={
                            isInvalidField
                              ? `${formInputId}-helper ${formInputId}-error`
                              : `${formInputId}-helper`
                          }
                          aria-errormessage={isInvalidField ? `${formInputId}-error` : undefined}
                          placeholder="oklch(0.77 0.152 258)"
                          className={cn(
                            "w-full min-h-[44px] pl-10 pr-20 py-2.5 rounded-[var(--comp-form-field-radius)] text-sm font-mono tabular-nums transition-all",
                            "bg-[var(--comp-form-field-bg-default)] text-[var(--comp-form-field-text-value)]",
                            "border border-[var(--comp-form-field-border-default)]",
                            "hover:bg-[var(--comp-form-field-bg-hover)]",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--comp-form-field-border-focus)]",
                            "disabled:opacity-45 disabled:cursor-not-allowed",
                            isHoverSimulated && "bg-[var(--comp-form-field-bg-hover)]",
                            isFocusSimulated &&
                              "outline-2 outline-offset-2 outline-[var(--comp-form-field-border-focus)]",
                            isActiveSimulated &&
                              "scale-[0.995] bg-[var(--comp-form-field-bg-hover)]",
                            isInvalidField &&
                              "border-[var(--comp-form-field-border-error)] bg-[var(--comp-form-field-bg-error)] outline-[var(--comp-form-field-border-error)]"
                          )}
                        />
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() =>
                            setFieldValue(
                              simulatedState === "error"
                                ? "invalid-hex-token"
                                : "oklch(0.77 0.152 258)"
                            )
                          }
                          className="absolute right-2 min-h-[28px] px-2 rounded text-[11px] font-mono bg-[var(--sys-surface-container)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)] cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>

                      <p
                        id={`${formInputId}-helper`}
                        className="text-xs text-[var(--comp-form-field-text-helper)]"
                      >
                        Format: <code className="font-mono">oklch(L C H)</code> perceptual colour
                        coordinate. Tab moves focus cleanly without trapping.
                      </p>

                      {/* Polite Live Validation Region */}
                      <div aria-live="polite" role="status" className="min-h-[22px]">
                        {isInvalidField ? (
                          <p
                            id={`${formInputId}-error`}
                            className="text-xs font-medium text-[var(--comp-form-field-text-error)] flex items-center gap-1.5"
                          >
                            <WarningCircle size={15} weight="fill" aria-hidden="true" />
                            <span>
                              Validation Error: Value must begin with{" "}
                              <code className="font-mono">oklch(</code> to maintain perceptual
                              gamut integrity.
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-[var(--text-feedback-success)] flex items-center gap-1.5">
                            <CheckCircle size={15} weight="fill" aria-hidden="true" />
                            <span>
                              Valid OKLCH coordinate — WCAG 2.2 contrast ratio verified (8.4:1 AAA).
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Secondary Floating-Style Maintainer Email Input */}
                    <div className="space-y-1.5 pt-2 border-t border-[var(--sys-outline-variant)]">
                      <label
                        htmlFor={`${formInputId}-email`}
                        className="block text-xs font-semibold text-[var(--comp-form-field-text-label)]"
                      >
                        Design System Governance Owner
                      </label>
                      <input
                        id={`${formInputId}-email`}
                        type="email"
                        value={emailValue}
                        disabled={isDisabled}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className={cn(
                          "w-full min-h-[44px] px-3.5 py-2 rounded-[var(--comp-form-field-radius)] text-sm transition-all",
                          "bg-[var(--comp-form-field-bg-default)] text-[var(--comp-form-field-text-value)] border border-[var(--comp-form-field-border-default)]",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--comp-form-field-border-focus)]",
                          "disabled:opacity-45 disabled:cursor-not-allowed"
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* SPECIMEN 2: FOCUS-TRAPPED MODAL DIALOG */}
                {spec.slug === "modal-dialog" && (
                  <div className="max-w-xl w-full mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        ref={modalTriggerRef}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setModalOpen((prev) => !prev)}
                        className="min-h-[40px] px-4 py-2 rounded-[var(--comp-button-radius-rest)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]"
                      >
                        {modalOpen ? "Close Modal Specimen (or Press Esc)" : "Launch Focus-Trapped Modal"}
                      </button>
                      <span className="text-xs font-mono text-[var(--sys-on-surface-secondary)]">
                        FocusScope Trap: <strong>{modalOpen ? "ACTIVE" : "IDLE"}</strong>
                      </span>
                    </div>

                    {modalOpen ? (
                      <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={modalTitleId}
                        aria-describedby={modalDescId}
                        className={cn(
                          "rounded-[var(--comp-modal-dialog-radius)] p-6 bg-[var(--comp-modal-dialog-bg-surface)] border border-[var(--comp-modal-dialog-border-surface)] shadow-2xl space-y-5 transition-all",
                          isFocusSimulated &&
                            "outline-2 outline-offset-2 outline-[var(--sys-primary)]",
                          isInvalidField && "border-[var(--border-feedback-error)]",
                          isDisabled && "opacity-50 pointer-events-none"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--sys-primary)] font-semibold">
                              Z-LEVEL 2 // RADIX FOCUSSCOPE DIALOG
                            </span>
                            <h2
                              id={modalTitleId}
                              className="text-lg font-bold text-[var(--comp-modal-dialog-text-title)]"
                            >
                              Export Multi-Platform Token Bundle
                            </h2>
                            <p
                              id={modalDescId}
                              className="text-xs text-[var(--comp-modal-dialog-text-body)] leading-relaxed"
                            >
                              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] font-mono">Tab</kbd> to verify keyboard focus stays trapped inside this dialogue, or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] font-mono">Esc</kbd> to dismiss and restore focus.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setModalOpen(false);
                              modalTriggerRef.current?.focus();
                            }}
                            aria-label="Close export dialog"
                            className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)] cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div
                          role="radiogroup"
                          aria-label="Target platform format"
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                        >
                          {[
                            { id: "dtcg", title: "Figma DTCG JSON", sub: "Variables & Modes" },
                            { id: "tailwind", title: "Tailwind v4 CSS", sub: "@theme inline" },
                            { id: "stitch", title: "Google Stitch", sub: "DESIGN.md Spec" },
                          ].map((opt) => {
                            const selected = modalExportFormat === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setModalExportFormat(opt.id as "dtcg" | "tailwind" | "stitch")}
                                className={cn(
                                  "p-3 rounded-xl text-left border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]",
                                  selected
                                    ? "bg-[var(--sys-primary-container)] border-[var(--sys-primary)] text-[var(--sys-on-surface)]"
                                    : "bg-[var(--sys-surface-lowest)] border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-secondary)] hover:bg-[var(--sys-surface-high)]"
                                )}
                              >
                                <div className="text-xs font-bold">{opt.title}</div>
                                <div className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] mt-0.5">
                                  {opt.sub}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {simulatedState === "error" && (
                          <div
                            role="alert"
                            className="p-3 rounded-lg bg-[var(--bg-feedback-error-subtle)] border border-[var(--border-feedback-error)] text-xs text-[var(--text-feedback-error)] flex items-center gap-2"
                          >
                            <WarningCircle size={16} weight="fill" />
                            <span>
                              Schema lock active: Resolve uncommitted token overrides before
                              publishing to production.
                            </span>
                          </div>
                        )}

                        <footer className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--sys-outline-variant)]">
                          <button
                            type="button"
                            onClick={() => {
                              setModalOpen(false);
                              modalTriggerRef.current?.focus();
                            }}
                            className="min-h-[40px] px-4 py-2 rounded-[var(--comp-button-radius-rest)] bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline)] text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy("modal-export", `Exported ${modalExportFormat.toUpperCase()}`)
                            }
                            className="min-h-[40px] px-4 py-2 rounded-[var(--comp-button-radius-rest)] active:rounded-full bg-[var(--sys-primary)] hover:bg-[var(--bg-action-primary-hover)] text-[var(--sys-on-primary)] text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)] transition-all"
                          >
                            {copiedKey === "modal-export"
                              ? "Bundle Copied!"
                              : `Copy ${modalExportFormat.toUpperCase()} Bundle`}
                          </button>
                        </footer>
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-[var(--sys-outline)] text-center space-y-2">
                        <p className="text-sm font-medium text-[var(--sys-on-surface-secondary)]">
                          Modal closed via Escape / Cancel and focus returned to the trigger button.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* SPECIMEN 3: INTERACTIVE DATA TABLE */}
                {spec.slug === "data-table" && (
                  <div className="w-full space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--sys-surface-container)] p-3 rounded-xl border border-[var(--sys-outline-variant)]">
                      <div className="relative flex-1 min-w-[200px]">
                        <MagnifyingGlass
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-tertiary)]"
                        />
                        <input
                          type="search"
                          value={tableFilter}
                          disabled={isDisabled}
                          onChange={(e) => setTableFilter(e.target.value)}
                          aria-label="Filter semantic tokens"
                          placeholder="Filter by token name or category..."
                          className="w-full min-h-[38px] pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)]"
                        />
                      </div>
                      <div
                        aria-live="polite"
                        className="text-xs font-mono tabular-nums text-[var(--sys-on-surface-secondary)]"
                      >
                        {selectedRows.length} selected • {filteredTokensForTable.length} tokens
                      </div>
                    </div>

                    <div className="rounded-[var(--comp-data-table-radius)] bg-[var(--comp-data-table-bg-container)] border border-[var(--comp-data-table-border-row)] overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--comp-data-table-bg-header)] border-b border-[var(--comp-data-table-border-row)]">
                          <tr>
                            <th scope="col" className="py-3 px-4 w-10">
                              <span className="sr-only">Select row</span>
                            </th>
                            <th
                              scope="col"
                              className="py-3 px-4 text-[11px] font-mono uppercase text-[var(--comp-data-table-text-header)]"
                            >
                              Tier-2 Semantic Token
                            </th>
                            <th
                              scope="col"
                              className="py-3 px-4 text-[11px] font-mono uppercase text-[var(--comp-data-table-text-header)]"
                            >
                              Resolved Value ({theme})
                            </th>
                            <th
                              scope="col"
                              aria-sort={sortAsc ? "ascending" : "descending"}
                              className="py-3 px-4 text-[11px] font-mono uppercase text-[var(--comp-data-table-text-header)]"
                            >
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setSortAsc((prev) => !prev)}
                                className="min-h-[28px] inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)]"
                              >
                                <span>WCAG Contrast</span>
                                <ArrowsDownUp size={12} />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--comp-data-table-border-row)] font-mono text-xs tabular-nums">
                          {filteredTokensForTable.slice(0, 6).map((tok) => {
                            const isSelected = selectedRows.includes(tok.cssVar);
                            const ratio =
                              theme === "dark"
                                ? tok.contrastVsDarkCanvas
                                : tok.contrastVsLightCanvas;
                            return (
                              <tr
                                key={tok.cssVar}
                                aria-selected={isSelected}
                                className={cn(
                                  "transition-colors hover:bg-[var(--comp-data-table-bg-row-hover)]",
                                  isSelected && "bg-[var(--comp-data-table-bg-row-selected)]",
                                  isHoverSimulated && "bg-[var(--comp-data-table-bg-row-hover)]"
                                )}
                              >
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => toggleRowSelection(tok.cssVar)}
                                    aria-label={`Select token ${tok.cssVar}`}
                                    className="w-4 h-4 accent-[var(--sys-primary)] rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)]"
                                  />
                                </td>
                                <td className="py-3 px-4 font-semibold text-[var(--comp-data-table-text-cell)]">
                                  {tok.cssVar}
                                </td>
                                <td className="py-3 px-4 text-[var(--sys-on-surface-secondary)] flex items-center gap-2">
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                    style={{
                                      backgroundColor:
                                        theme === "dark" ? tok.darkHex : tok.lightHex,
                                    }}
                                  />
                                  <span>{theme === "dark" ? tok.darkOklch : tok.lightOklch}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--bg-feedback-success-subtle)] text-[var(--text-feedback-success)] font-semibold">
                                    {ratio}:1
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SPECIMEN 4: M3 SHAPE-MORPHING BUTTON */}
                {spec.slug === "button" && (
                  <div className="max-w-lg w-full mx-auto tonal-card-elevated p-6 space-y-6">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase text-[var(--sys-primary)] font-semibold">
                        01 // M3 EXPRESSIVE SHAPE MORPH
                      </span>
                      <h2 className="text-sm font-bold text-[var(--sys-on-surface)]">
                        Press & Hold Any Button to Observe 12px → 9999px Pill Morph
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={isDisabled}
                        className={cn(
                          "min-h-[42px] px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all duration-150",
                          "rounded-[var(--comp-button-radius-rest)] active:rounded-[var(--comp-button-radius-pressed)] active:scale-[0.97]",
                          "bg-[var(--comp-button-bg-primary)] hover:bg-[var(--comp-button-bg-primary-hover)] text-[var(--comp-button-text-primary)]",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--comp-button-border-focus)]",
                          "disabled:opacity-45 disabled:pointer-events-none",
                          isHoverSimulated && "bg-[var(--comp-button-bg-primary-hover)]",
                          isFocusSimulated &&
                            "outline-2 outline-offset-2 outline-[var(--comp-button-border-focus)]",
                          isActiveSimulated && "rounded-full scale-[0.97]"
                        )}
                      >
                        <Sparkle size={15} weight="fill" />
                        <span>Primary Action</span>
                      </button>

                      <button
                        type="button"
                        disabled={isDisabled}
                        className={cn(
                          "min-h-[42px] px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all duration-150",
                          "rounded-[var(--comp-button-radius-rest)] active:rounded-full active:scale-[0.97]",
                          "bg-[var(--sys-primary-container)] text-[var(--sys-primary)] border border-[var(--sys-outline-variant)]",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]",
                          "disabled:opacity-45 disabled:pointer-events-none",
                          isActiveSimulated && "rounded-full scale-[0.97]"
                        )}
                      >
                        <span>Tonal Secondary</span>
                      </button>

                      <button
                        type="button"
                        disabled={isDisabled}
                        className={cn(
                          "min-h-[42px] px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all duration-150",
                          "rounded-[var(--comp-button-radius-rest)] active:rounded-full active:scale-[0.97]",
                          "bg-[var(--bg-feedback-error-subtle)] text-[var(--text-feedback-error)] border border-[var(--border-feedback-error)]",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-feedback-error)]",
                          "disabled:opacity-45 disabled:pointer-events-none"
                        )}
                      >
                        <WarningCircle size={15} weight="fill" />
                        <span>Destructive Action</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Copyable React / TypeScript Code Block View (Open Access — v3.0) */
              <div className="p-6 bg-[var(--sys-surface-lowest)] flex-1 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--sys-on-surface-secondary)]">
                    src/components/ui/{spec.slug}.tsx · Strict TypeScript · Zero `any`
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("code-snippet", spec.codeSnippet)}
                    className="min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--sys-primary)] text-[var(--sys-on-primary)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === "code-snippet" ? (
                      <>
                        <Check size={14} weight="bold" />
                        <span>Copied TSX</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Implementation</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-black/40 border border-[var(--sys-outline-variant)] text-xs font-mono text-[var(--sys-on-surface)] overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{spec.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Right 4 Columns: WAI-ARIA Contract, Keyboard Map & Cross-Platform Bindings */}
          <div className="lg:col-span-4 space-y-6">
            {/* WAI-ARIA & Keyboard Navigation Card */}
            <div className="tonal-card p-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--sys-primary)] font-semibold">
                <Keyboard size={16} />
                <span>Keyboard & WAI-ARIA 1.2 Spec</span>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-[var(--sys-on-surface-secondary)]">Primary ARIA Role:</div>
                <div className="font-mono text-xs px-3 py-2 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-[var(--sys-on-surface)]">
                  {spec.ariaRole}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-[var(--sys-on-surface-secondary)]">Required ARIA Attributes:</div>
                <ul className="space-y-1.5">
                  {spec.ariaAttributes.map((attr) => (
                    <li
                      key={attr}
                      className="text-xs font-mono px-2.5 py-1.5 rounded bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)]"
                    >
                      {attr}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--sys-outline-variant)]">
                <div className="text-xs font-semibold text-[var(--sys-on-surface)]">
                  Keyboard Interaction Map:
                </div>
                <div className="space-y-2">
                  {spec.keyboardMap.map((k) => (
                    <div
                      key={k.key}
                      className="p-2.5 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] space-y-1"
                    >
                      <kbd className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--sys-primary-container)] text-[var(--sys-primary)]">
                        {k.key}
                      </kbd>
                      <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                        {k.behavior}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross-Platform Bindings (Figma + Stitch) */}
            <div className="tonal-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--sys-primary)] font-semibold">
                <Cube size={16} />
                <span>Multi-Platform Sync Keys</span>
              </div>
              <div className="text-xs space-y-2 font-mono">
                <div className="flex justify-between py-1.5 border-b border-[var(--sys-outline-variant)]">
                  <span className="text-[var(--sys-on-surface-tertiary)]">Figma Node:</span>
                  <span className="text-[var(--sys-on-surface)]">{spec.figmaNodePath}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--sys-outline-variant)]">
                  <span className="text-[var(--sys-on-surface-tertiary)]">Google Stitch:</span>
                  <span className="text-[var(--sys-primary)]">{spec.stitchComponentKey}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[var(--sys-on-surface-tertiary)]">Concentric Formula:</span>
                  <span className="text-[var(--sys-on-surface-secondary)] text-right max-w-[200px]">
                    {spec.concentricFormula}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tier-2 Semantic & Tier-3 Component Token Lineage Table */}
        <section aria-labelledby="token-lineage-heading" className="tonal-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--sys-outline-variant)] pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--sys-primary)] font-semibold">
                <Swatches size={16} />
                <span>3-TIER TOKEN LINEAGE & POLARITY INSPECTOR</span>
              </div>
              <h2 id="token-lineage-heading" className="text-2xl font-bold text-[var(--sys-on-surface)]">
                Active Semantic Tokens Fueling <code className="font-mono text-[var(--sys-primary)]">{spec.slug}</code>
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--sys-on-surface-secondary)]">
              Showing {semanticTokens.length} Tier-2 Semantic & {tier3Tokens.length} Tier-3 Component Bindings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--sys-outline-variant)] text-[11px] font-mono uppercase text-[var(--sys-on-surface-tertiary)]">
                  <th scope="col" className="py-3 px-4">
                    Tier-2 Semantic Variable
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Workbench Alias
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Light Mode (Tier-1 Ref + OKLCH)
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Dark Mode (Tier-1 Ref + OKLCH)
                  </th>
                  <th scope="col" className="py-3 px-4">
                    WCAG 2.2 Contrast
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sys-outline-variant)] font-mono text-xs tabular-nums">
                {semanticTokens.map((tok) => (
                  <tr
                    key={tok.cssVar}
                    className="hover:bg-[var(--sys-surface-high)] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleCopy(tok.cssVar, `var(${tok.cssVar})`)}
                        className="font-semibold text-[var(--sys-on-surface)] hover:text-[var(--sys-primary)] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{tok.cssVar}</span>
                        {copiedKey === tok.cssVar ? (
                          <Check size={12} className="text-[var(--text-feedback-success)]" />
                        ) : (
                          <Copy size={12} className="opacity-50" />
                        )}
                      </button>
                      <div className="text-[11px] font-sans text-[var(--sys-on-surface-tertiary)] mt-0.5">
                        {tok.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--sys-on-surface-secondary)]">
                      {tok.workbenchAlias}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: tok.lightHex }}
                        />
                        <div>
                          <div className="text-[var(--sys-on-surface)]">{tok.lightOklch}</div>
                          <div className="text-[10px] text-[var(--sys-on-surface-tertiary)]">
                            {tok.lightRef} ({tok.lightHex})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: tok.darkHex }}
                        />
                        <div>
                          <div className="text-[var(--sys-on-surface)]">{tok.darkOklch}</div>
                          <div className="text-[10px] text-[var(--sys-on-surface-tertiary)]">
                            {tok.darkRef} ({tok.darkHex})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[var(--bg-feedback-success-subtle)] text-[var(--text-feedback-success)] font-semibold">
                        D: {tok.contrastVsDarkCanvas}:1 / L: {tok.contrastVsLightCanvas}:1
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Visual Anatomy, Usage Guardrails & WCAG 2.2 Benchmarks */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Anatomy Breakdown */}
          <div className="lg:col-span-6 tonal-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--sys-on-surface)]">
              Visual Anatomy & Slot Geometry
            </h3>
            <div className="space-y-3">
              {spec.anatomy.map((item) => (
                <div
                  key={item.slot}
                  className="p-3.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[var(--sys-primary)]">{item.slot}</span>
                    <span className="text-[var(--sys-on-surface-tertiary)]">{item.element}</span>
                  </div>
                  <div className="text-xs text-[var(--sys-on-surface)] font-medium">
                    {item.geometry}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--sys-on-surface-secondary)]">
                    Token: {item.tokenBinding}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Do / Don't + WCAG 2.2 Verification */}
          <div className="lg:col-span-6 space-y-6">
            <div className="tonal-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-[var(--text-feedback-success)] font-bold flex items-center gap-1.5">
                  <CheckCircle size={15} weight="fill" />
                  <span>When to Use (Do)</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                  {spec.whenToUse.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-[var(--text-feedback-error)] font-bold flex items-center gap-1.5">
                  <WarningCircle size={15} weight="fill" />
                  <span>When Not to Use (Don&apos;t)</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                  {spec.whenNotToUse.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="tonal-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[var(--sys-primary)] font-semibold">
                <Info size={16} />
                <span>WCAG 2.2 AA Verification Gates</span>
              </div>
              <div className="space-y-2.5">
                {spec.accessibilityRules.map((rule) => (
                  <div
                    key={rule.criterion}
                    className="p-3 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[var(--sys-on-surface)]">
                        {rule.criterion}
                      </div>
                      <p className="text-xs text-[var(--sys-on-surface-secondary)]">{rule.requirement}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-feedback-success-subtle)] text-[var(--text-feedback-success)] font-semibold">
                      {rule.wcagRef}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
