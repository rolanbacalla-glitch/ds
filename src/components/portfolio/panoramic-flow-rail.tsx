"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import type { FlowStep } from "@/data/portfolio-works";

interface PanoramicFlowRailProps {
  title: string;
  subtitle: string;
  steps: FlowStep[];
}

export function PanoramicFlowRail({ title, subtitle, steps }: PanoramicFlowRailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageMode, setStageMode] = useState<"auto" | "dark" | "light">("auto");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const activeStep = steps[activeIndex] ?? steps[0];

  useEffect(() => {
    if (!lightboxOpen) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        setZoom(1);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % steps.length);
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + steps.length) % steps.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, steps.length]);

  const resolvedStageClass =
    stageMode === "dark"
      ? "bg-[#111318] text-white border-white/15"
      : stageMode === "light"
        ? "bg-[#F8FAFC] text-[#0F172A] border-slate-200"
        : activeStep.stageTone === "dark" || activeStep.stageTone === "hardware"
          ? "bg-[#111318] text-white border-white/15"
          : "bg-[#F8FAFC] text-[#0F172A] border-slate-200";

  const resolvedMutedClass =
    stageMode === "dark" ||
    (stageMode === "auto" && (activeStep.stageTone === "dark" || activeStep.stageTone === "hardware"))
      ? "text-neutral-300"
      : "text-slate-600";

  return (
    <section aria-label={title} className="tonal-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
            Panoramic Flow Rail · Adaptive Stage
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--sys-on-surface)]">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-[var(--sys-on-surface-secondary)]">
            {subtitle}
          </p>
        </div>

        {/* Stage Polarity Toggle + Deep-Zoom Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Stage backdrop mode"
            className="inline-flex rounded-full border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] p-1"
          >
            {(["auto", "light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setStageMode(mode)}
                className={`min-h-[32px] rounded-full px-3 text-xs font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2 ${
                  stageMode === mode
                    ? "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface)] shadow-sm"
                    : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--sys-outline)] bg-[var(--sys-surface-low)] px-4 text-xs font-medium text-[var(--sys-on-surface)] transition-colors hover:bg-[var(--sys-surface-high)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            <Expand className="h-3.5 w-3.5" aria-hidden="true" />
            Deep-Zoom
          </button>
        </div>
      </div>

      {/* Step Jump Pills */}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Flow steps">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={`min-h-[40px] rounded-lg px-3.5 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2 ${
                isActive
                  ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)]"
                  : "border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-secondary)] hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
              }`}
            >
              <span className="font-mono opacity-80">{step.stepNumber}</span> · {step.title}
            </button>
          );
        })}
      </div>

      {/* Adaptive Neutral Stage Preview */}
      <div
        className={`mt-5 rounded-[var(--sys-radius-lg)] border p-6 sm:p-8 transition-colors ${resolvedStageClass}`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-current/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wider">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: activeStep.accentHex }}
              />
              Step {activeStep.stepNumber} · {activeStep.platform}
            </div>
            <h4 className="mt-3 text-2xl font-semibold tracking-tight">{activeStep.title}</h4>
            <p className={`mt-2 text-sm leading-relaxed ${resolvedMutedClass}`}>
              {activeStep.summary}
            </p>
            <p className="mt-4 inline-block rounded-lg border border-current/15 px-3.5 py-2 text-xs font-medium">
              Key Decision: {activeStep.keyDetail}
            </p>
          </div>

          {/* Step Wireframe Telemetry Tile */}
          <div className="w-full md:w-64 shrink-0 rounded-xl border border-current/15 p-4">
            <div className="flex items-center justify-between font-mono text-[11px] opacity-70">
              <span>FRAME {activeStep.stepNumber}</span>
              <span>
                {activeIndex + 1} / {steps.length}
              </span>
            </div>
            <div
              className="mt-3 h-24 rounded-lg border border-current/10 p-3 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${activeStep.accentHex}26 0%, transparent 100%)`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeStep.accentHex }} />
                <span className="h-1.5 w-16 rounded-full bg-current/25" />
              </div>
              <div className="space-y-1.5">
                <span className="block h-2 w-3/4 rounded-full bg-current/30" />
                <span className="block h-1.5 w-1/2 rounded-full bg-current/20" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous flow step"
                onClick={() => setActiveIndex((prev) => (prev - 1 + steps.length) % steps.length)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="font-mono text-[11px] opacity-75">Use ← / → keys</span>
              <button
                type="button"
                aria-label="Next flow step"
                onClick={() => setActiveIndex((prev) => (prev + 1) % steps.length)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Z-Level 2 Liquid Glass Deep-Zoom Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Deep-zoom inspector: ${activeStep.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8"
          onClick={() => {
            setLightboxOpen(false);
            setZoom(1);
          }}
        >
          <div
            className="liquid-glass-regular w-full max-w-4xl rounded-[var(--sys-radius-xl)] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--sys-outline-variant)] pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                  Step {activeStep.stepNumber} of {steps.length} · {activeStep.platform}
                </p>
                <h4 className="text-lg font-semibold text-[var(--sys-on-surface)]">
                  {activeStep.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--sys-outline)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
                >
                  <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-[48px] text-center font-mono text-xs tabular-nums text-[var(--sys-on-surface)]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => setZoom((z) => Math.min(2, Number((z + 0.25).toFixed(2))))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--sys-outline)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  ref={closeBtnRef}
                  type="button"
                  aria-label="Close deep-zoom inspector"
                  onClick={() => {
                    setLightboxOpen(false);
                    setZoom(1);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--sys-outline)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-auto rounded-xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-lowest)] p-6">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                className="transition-transform duration-200"
              >
                <p className="text-sm leading-relaxed text-[var(--sys-on-surface-secondary)]">
                  {activeStep.summary}
                </p>
                <p className="mt-3 text-sm font-medium text-[var(--sys-on-surface)]">
                  Design Rationale: {activeStep.keyDetail}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--sys-outline-variant)] pt-4">
                  <span className="font-mono text-xs text-[var(--sys-on-surface-tertiary)]">
                    High-resolution Figma frame placeholder
                  </span>
                  <a
                    href={activeStep.assetHref ?? "#"}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--sys-primary)] px-4 text-xs font-semibold text-[var(--sys-on-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
                  >
                    Open Full Board
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
