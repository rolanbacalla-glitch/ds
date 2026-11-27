"use client";

import React, { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { SlidingTabList } from "@/components/ui/sliding-tab-list";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { ADMIN_EMAIL } from "@/lib/firebase";
import {
  MICRO_LOADERS,
  MicroLoaderPreview,
  buildLoaderReactSnippet,
  type GestureSubgroup,
  type MicroLoaderCategory,
  type MicroLoaderSpec,
} from "@/components/dashboard/micro-loaders";
import {
  MagnifyingGlass,
  Play,
  Pause,
  Copy,
  Check,
  Code,
  Activity,
  LockSimple,
} from "phosphor-react";

type FilterCategory = "all" | MicroLoaderCategory;
type GestureGroupFilter = "all" | GestureSubgroup;

const CATEGORIES: Array<{ id: FilterCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "circular", label: "Circular" },
  { id: "dots", label: "Dots" },
  { id: "linear", label: "Linear" },
  { id: "bars", label: "Bars" },
  { id: "geometric", label: "Geometric" },
  { id: "radar", label: "Radar" },
  { id: "gestures", label: "Gestures" },
];

const GESTURE_GROUPS: Array<{ id: GestureGroupFilter; label: string }> = [
  { id: "all", label: "All Gestures" },
  { id: "action", label: "Discrete Actions" },
  { id: "navigation", label: "Navigation & Flow" },
  { id: "transform", label: "Multi-Touch Transforms" },
];

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;

export const AnimationsPlayground: React.FC = () => {
  const [selectedLoader, setSelectedLoader] = useState<MicroLoaderSpec>(MICRO_LOADERS[0]);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [activeGestureGroup, setActiveGestureGroup] = useState<GestureGroupFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [size, setSize] = useState(56);
  const [speed, setSpeed] = useState<number>(1);
  const [paused, setPaused] = useState(false);
  const [reducedPreview, setReducedPreview] = useState(false);
  const [showKeylines, setShowKeylines] = useState(true);
  const [copiedType, setCopiedType] = useState<"jsx" | "svg" | null>(null);
  const previewStageRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { user, isPrimaryAdmin, openAuthModal, logAuditEvent } = useAuth();

  const gestureCount = useMemo(
    () => MICRO_LOADERS.filter((item) => item.category === "gestures").length,
    []
  );
  const loaderCount = MICRO_LOADERS.length - gestureCount;

  const filteredLoaders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MICRO_LOADERS.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      if (
        activeCategory === "gestures" &&
        activeGestureGroup !== "all" &&
        item.gestureGroup !== activeGestureGroup
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.useCase.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, activeGestureGroup, searchQuery]);

  const reactSnippet = useMemo(
    () => buildLoaderReactSnippet(selectedLoader, size, speed),
    [selectedLoader, size, speed]
  );

  const handleLockedAttempt = (kind: string) => {
    if (user?.emailVerified) {
      void logAuditEvent("blocked_export_attempt", `Animation (${kind}): ${selectedLoader.name}`);
    }
    showToast(`Exports are locked — available only under ${ADMIN_EMAIL}.`);
    openAuthModal(
      `Animation code exports are temporarily locked and restricted to ${ADMIN_EMAIL}.`
    );
  };

  const handleCopyJsx = async () => {
    if (!isPrimaryAdmin) {
      handleLockedAttempt("jsx");
      return;
    }
    try {
      await navigator.clipboard.writeText(reactSnippet);
      setCopiedType("jsx");
      if (user?.emailVerified) {
        void logAuditEvent("export_copy", `Animation (jsx): ${selectedLoader.name}`);
      }
      showToast(`Copied React JSX for ${selectedLoader.name}`);
      window.setTimeout(() => setCopiedType(null), 1800);
    } catch {
      showToast("Clipboard permission denied");
    }
  };

  const handleCopySvg = async () => {
    if (!isPrimaryAdmin) {
      handleLockedAttempt("svg");
      return;
    }
    const svgEl = previewStageRef.current?.querySelector("svg");
    if (!svgEl) return;
    try {
      await navigator.clipboard.writeText(svgEl.outerHTML);
      setCopiedType("svg");
      if (user?.emailVerified) {
        void logAuditEvent("export_copy", `Animation (svg): ${selectedLoader.name}`);
      }
      showToast(`Copied SVG markup for ${selectedLoader.name}`);
      window.setTimeout(() => setCopiedType(null), 1800);
    } catch {
      showToast("Clipboard permission denied");
    }
  };

  return (
    <section id="animations" className="scroll-mt-24 space-y-10">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--sys-outline-variant)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-[var(--sys-primary)]">
            <span>07 // ANIMATIONS, LOADERS &amp; GESTURES</span>
            <span className="text-[var(--sys-on-surface-quaternary)]">•</span>
            <span>60FPS TOKENISED SVG + CSS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sys-on-surface)]">
            Micro-Animation Library &amp;{" "}
            <span className="font-serif italic font-normal text-[var(--sys-primary)]">
              Live Customiser
            </span>
          </h2>
          <p className="text-sm text-[var(--sys-on-surface-secondary)] max-w-3xl leading-relaxed">
            A curated library of{" "}
            <strong className="text-[var(--sys-on-surface)]">
              {loaderCount} minimalist geometric loaders
            </strong>{" "}
            and{" "}
            <strong className="text-[var(--sys-on-surface)]">
              {gestureCount} touch &amp; pointer gesture icons
            </strong>{" "}
            built with zero-dependency SVG and GPU-composited CSS keyframes. Every animation
            automatically inherits your live OKLCH brand seed, light/dark polarity, and{" "}
            <code className="font-mono">prefers-reduced-motion</code> rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Sticky Live Motion Inspector */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 tonal-card p-6 flex flex-col gap-5">
          {/* Preview Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--sys-primary)] leading-none whitespace-nowrap">
                  Motion Preview
                </span>
                <span className="font-mono text-[10px] text-[var(--sys-on-surface-tertiary)] truncate">
                  {selectedLoader.useCase}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeylines((prev) => !prev)}
                aria-pressed={showKeylines}
                className={cn(
                  "h-7 px-2.5 rounded-lg border font-mono text-[11px] whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                  showKeylines
                    ? "bg-[var(--sys-surface-high)] border-[var(--sys-outline)] text-[var(--sys-on-surface)]"
                    : "bg-[var(--sys-surface-lowest)] border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-tertiary)] hover:text-[var(--sys-on-surface)]"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    showKeylines ? "bg-[var(--sys-primary)]" : "bg-[var(--sys-outline)]"
                  )}
                />
                Guides: {showKeylines ? "ON" : "OFF"}
              </button>
            </div>

            {/* Stage */}
            <div
              ref={previewStageRef}
              className="relative h-56 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-center justify-center overflow-hidden"
            >
              {showKeylines && (
                <>
                  <div className="absolute inset-0 swiss-grid-bg opacity-60 pointer-events-none" />
                  <div className="absolute w-32 h-32 rounded-full border border-dashed border-[var(--sys-primary)]/35 pointer-events-none" />
                  <div className="absolute w-28 h-28 border border-[var(--sys-primary)]/25 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--sys-primary)]/25 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--sys-primary)]/25 pointer-events-none" />
                </>
              )}

              <div className="relative z-10">
                <MicroLoaderPreview
                  loader={selectedLoader}
                  size={size}
                  speed={speed}
                  paused={paused}
                  reducedMotion={reducedPreview}
                />
              </div>

              <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between font-mono text-[10px] text-[var(--sys-on-surface-tertiary)]">
                <span className="truncate pr-2">{selectedLoader.name}</span>
                <span className="tabular-nums shrink-0">
                  {size}×{size}px • {speed}×
                  {paused ? " • paused" : ""}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
              {selectedLoader.description}
            </p>
          </div>

          {/* Playback & Reduced Motion Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              aria-pressed={paused}
              className={cn(
                "min-h-[40px] px-3 rounded-xl border text-xs font-mono font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                paused
                  ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] border-[var(--sys-primary)]"
                  : "bg-[var(--sys-surface-lowest)] border-[var(--sys-outline-variant)] text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-high)]"
              )}
            >
              {paused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
              <span>{paused ? "Resume" : "Pause"}</span>
            </button>

            <button
              type="button"
              onClick={() => setReducedPreview((prev) => !prev)}
              aria-pressed={reducedPreview}
              className={cn(
                "min-h-[40px] px-3 rounded-xl border text-xs font-mono font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                reducedPreview
                  ? "bg-[var(--sys-surface-high)] border-[var(--sys-primary)] text-[var(--sys-primary)]"
                  : "bg-[var(--sys-surface-lowest)] border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
              )}
            >
              <Activity size={14} />
              <span>Reduced: {reducedPreview ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--sys-on-surface-secondary)]">Playback Speed</span>
              <span className="font-mono font-bold text-[var(--sys-primary)] tabular-nums">
                {speed}×
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpeed(option)}
                  className={cn(
                    "py-2 px-2 rounded-lg text-xs font-mono tabular-nums border transition-all cursor-pointer",
                    speed === option
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] border-[var(--sys-primary)] font-semibold"
                      : "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] border-[var(--sys-outline-variant)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  {option}×
                </button>
              ))}
            </div>
          </div>

          {/* Optical Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--sys-on-surface-secondary)]">Optical Size</span>
              <span className="font-mono font-bold text-[var(--sys-primary)] tabular-nums">
                {size}px
              </span>
            </div>
            <input
              type="range"
              min={24}
              max={96}
              step={4}
              value={size}
              aria-label="Animation size in pixels"
              onChange={(e) => setSize(Number(e.target.value))}
              className="precision-slider"
            />
          </div>

          {/* Copy Export Buttons (Locked to Admin) */}
          <div className="space-y-2 pt-2 border-t border-[var(--sys-outline-variant)]">
            {isPrimaryAdmin ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJsx}
                    className="min-h-[40px] py-2 px-3 rounded-xl bg-[var(--sys-primary)] hover:opacity-95 text-[var(--sys-on-primary)] flex items-center justify-center gap-1.5 text-xs font-mono font-semibold transition-opacity cursor-pointer"
                  >
                    {copiedType === "jsx" ? (
                      <>
                        <Check size={14} weight="bold" />
                        <span>Copied JSX</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy React JSX</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySvg}
                    className="min-h-[40px] py-2 px-3 rounded-xl bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] border border-[var(--sys-outline-variant)] flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-[var(--sys-on-surface)] transition-colors cursor-pointer"
                  >
                    {copiedType === "svg" ? (
                      <>
                        <Check size={14} className="text-emerald-400" weight="bold" />
                        <span>Copied SVG</span>
                      </>
                    ) : (
                      <>
                        <Code size={14} className="text-[var(--sys-on-surface-tertiary)]" />
                        <span>Copy SVG</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="px-3 py-2 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] truncate">
                  {`<MicroLoaderPreview loader={${selectedLoader.id}} size={${size}} speed={${speed}} />`}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleLockedAttempt("inspector")}
                className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] border border-[var(--sys-outline)] flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-[var(--sys-on-surface-secondary)] transition-colors cursor-pointer"
              >
                <LockSimple size={14} weight="bold" className="text-[var(--sys-primary)]" />
                <span>Exports Locked (Admin Only)</span>
              </button>
            )}
          </div>
        </div>

        {/* Right 8 Cols: Searchable & Categorised Micro-Animation Grid */}
        <div className="lg:col-span-8 tonal-card p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-4 border-b border-[var(--sys-outline-variant)] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--sys-on-surface)] flex items-center gap-2">
                  <span>Browse Animations</span>
                  <span className="text-[11px] font-mono font-normal text-[var(--sys-primary)] tabular-nums">
                    ({filteredLoaders.length} of {MICRO_LOADERS.length})
                  </span>
                </h3>
                <p className="text-xs text-[var(--sys-on-surface-tertiary)]">
                  Select any loader or gesture icon to inspect on the keyline grid, tune speed, or copy production markup.
                </p>
              </div>
            </div>

            {/* Search & Category Filters */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <MagnifyingGlass
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-tertiary)] pointer-events-none"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search animations by name, gesture, or tag (e.g. swipe, pinch, radar, dots)…"
                  aria-label="Search animations"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] focus:border-[var(--sys-primary)] focus:outline-none text-xs text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-tertiary)] transition-colors"
                />
              </div>

              <div className="overflow-x-auto pb-0.5">
                <SlidingTabList
                  activeKey={activeCategory}
                  ariaLabel="Animation Category Filter"
                  className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-xs font-medium"
                  indicatorClassName="rounded-lg bg-[var(--sys-primary)] shadow-xs"
                >
                  {CATEGORIES.map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        data-tab-key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          if (cat.id !== "gestures") {
                            setActiveGestureGroup("all");
                          }
                        }}
                        className={cn(
                          "relative z-10 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer",
                          active
                            ? "text-[var(--sys-on-primary)] font-semibold"
                            : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                        )}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </SlidingTabList>
              </div>

              {activeCategory === "gestures" && (
                <div
                  role="group"
                  aria-label="Gesture taxonomy filter"
                  className="flex flex-wrap items-center gap-1.5 pt-0.5"
                >
                  {GESTURE_GROUPS.map((group) => {
                    const active = activeGestureGroup === group.id;
                    const count =
                      group.id === "all"
                        ? gestureCount
                        : MICRO_LOADERS.filter(
                            (item) => item.category === "gestures" && item.gestureGroup === group.id
                          ).length;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setActiveGestureGroup(group.id)}
                        className={cn(
                          "min-h-[30px] px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer inline-flex items-center gap-1.5",
                          active
                            ? "bg-[var(--sys-primary-container)] border-[var(--sys-primary)] text-[var(--sys-on-primary-container)] font-semibold"
                            : "bg-[var(--sys-surface-lowest)] border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:border-[var(--sys-outline)]"
                        )}
                      >
                        <span>{group.label}</span>
                        <span className="tabular-nums opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Animation Cards Grid */}
          {filteredLoaders.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-medium text-[var(--sys-on-surface)]">
                No matching animations found
              </p>
              <p className="text-xs text-[var(--sys-on-surface-tertiary)]">
                Try clearing your search or switching back to the All category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredLoaders.map((loader) => {
                const isSelected = loader.id === selectedLoader.id;
                return (
                  <button
                    key={loader.id}
                    type="button"
                    onClick={() => setSelectedLoader(loader)}
                    aria-pressed={isSelected}
                    className={cn(
                      "group rounded-2xl p-4 text-left flex flex-col items-center justify-between gap-3 border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]",
                      isSelected
                        ? "bg-[var(--sys-surface-low)] border-[var(--sys-primary)] ring-1 ring-[var(--sys-primary)]/30"
                        : "bg-[var(--sys-surface-lowest)] border-[var(--sys-outline-variant)] hover:border-[var(--sys-outline)] hover:bg-[var(--sys-surface-low)]"
                    )}
                  >
                    <div className="h-20 w-full flex items-center justify-center">
                      <MicroLoaderPreview
                        loader={loader}
                        size={44}
                        speed={speed}
                        paused={paused}
                        reducedMotion={reducedPreview}
                      />
                    </div>
                    <div className="w-full space-y-0.5 text-center">
                      <div
                        className={cn(
                          "text-xs font-semibold truncate transition-colors",
                          isSelected
                            ? "text-[var(--sys-primary)]"
                            : "text-[var(--sys-on-surface)] group-hover:text-[var(--sys-primary)]"
                        )}
                      >
                        {loader.name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--sys-on-surface-tertiary)] truncate">
                        {loader.useCase}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
