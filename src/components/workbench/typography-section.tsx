"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TextT, Play, Pause, CheckCircle, Warning } from "phosphor-react";

export const TypographySection: React.FC = () => {
  const [emphasized, setEmphasized] = useState(false);
  const [liveTicker, setLiveTicker] = useState(14829.42);
  const [isTicking, setIsTicking] = useState(true);

  useEffect(() => {
    if (!isTicking) return;
    const timer = setInterval(() => {
      setLiveTicker((prev) => Number((prev + (Math.random() * 24 - 11.5)).toFixed(2)));
    }, 140);
    return () => clearInterval(timer);
  }, [isTicking]);

  const typeScale = [
    {
      role: "Display Large",
      token: "--type-display-lg",
      size: "3.25rem (52px)",
      lineHeight: "1.06",
      tracking: "-0.03em",
      baseWeight: "font-semibold",
      emphWeight: "font-extrabold",
      className: "text-4xl sm:text-5xl tracking-[-0.03em] leading-[1.06]",
      sample: "Designed for Clarity and Everyday Comfort",
    },
    {
      role: "Editorial Hero (Variable Serif)",
      token: "--type-editorial-xl",
      size: "2.75rem (44px)",
      lineHeight: "1.08",
      tracking: "-0.02em",
      baseWeight: "font-normal",
      emphWeight: "italic font-medium",
      className:
        "font-serif text-3xl sm:text-4xl tracking-[-0.02em] leading-[1.08] text-[var(--sys-primary)]",
      sample: "Optical Editorial Craft Meets Spatial UI",
    },
    {
      role: "Headline Medium",
      token: "--type-headline-md",
      size: "1.75rem (28px)",
      lineHeight: "1.20",
      tracking: "-0.02em",
      baseWeight: "font-semibold",
      emphWeight: "font-bold",
      className: "text-2xl sm:text-[28px] tracking-[-0.02em] leading-[1.2]",
      sample: "Clear Visual Hierarchy Guides the Eye Naturally",
    },
    {
      role: "Title Medium",
      token: "--type-title-md",
      size: "1.125rem (18px)",
      lineHeight: "1.35",
      tracking: "-0.01em",
      baseWeight: "font-medium",
      emphWeight: "font-bold",
      className: "text-lg tracking-[-0.01em] leading-[1.35]",
      sample: "Consistent Card Titles and Section Subheadings",
    },
    {
      role: "Body Default",
      token: "--type-body-md",
      size: "0.9375rem (15px)",
      lineHeight: "1.65",
      tracking: "0em",
      baseWeight: "font-normal",
      emphWeight: "font-medium",
      className: "text-[15px] leading-[1.65] text-[var(--sys-on-surface-secondary)]",
      sample:
        "Semi-condensed geometric apertures in Manrope preserve generous 65–72 character line measures and effortless dark-mode legibility across every screen.",
    },
    {
      role: "Token & Telemetry Mono",
      token: "--type-label-mono",
      size: "0.75rem (12px)",
      lineHeight: "1.40",
      tracking: "0.04em",
      baseWeight: "font-mono font-medium",
      emphWeight: "font-mono font-semibold",
      className: "font-mono text-xs tracking-[0.04em] text-[var(--sys-primary)] tabular-nums",
      sample: "--sys-primary · Contrast 16.2:1 AAA · opsz 144",
    },
  ];

  const typographyAudit = [
    {
      role: "Interface & Body Sans",
      previous: "Plus Jakarta Sans",
      upgraded: "Manrope (400–800)",
      rationale:
        "Tighter semi-condensed metrics fit dense Swiss tables cleanly, with open apertures and balanced stem weight on dark canvases.",
    },
    {
      role: "Editorial Display Serif",
      previous: "Instrument Serif (400 only)",
      upgraded: "Fraunces Variable (opsz 9..144)",
      rationale:
        "True optical sizing automatically thickens hairlines at subheading scales and sharpens strokes at hero sizes—eliminating spindly dark-mode rendering.",
    },
    {
      role: "Data & Code Monospace",
      previous: "JetBrains Mono",
      upgraded: "IBM Plex Mono (400–600)",
      rationale:
        "Architectural Swiss proportions with unmistakable 0/O and 1/l/I differentiation and calm tabular alignment for design token specs.",
    },
  ];

  return (
    <section id="typography" className="scroll-mt-24 space-y-10">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--sys-outline-variant)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--sys-primary)]">
            <span>Typography</span>
            <span className="text-[var(--sys-on-surface-quaternary)]">·</span>
            <span>Upgraded Optical 2+1 Font Stack</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sys-on-surface)]">
            Clear Hierarchy &amp;{" "}
            <span className="font-serif italic font-normal text-[var(--sys-primary)]">
              Effortless Reading
            </span>
          </h2>
          <p className="text-sm text-[var(--sys-on-surface-secondary)] max-w-3xl leading-relaxed">
            Pairs architectural <strong className="text-[var(--sys-on-surface)]">Manrope</strong>{" "}
            for everyday interface copy with optically sized{" "}
            <strong className="text-[var(--sys-on-surface)]">Fraunces</strong> for sculptural
            editorial accents and{" "}
            <strong className="text-[var(--sys-on-surface)]">IBM Plex Mono</strong> for token
            coordinates and tabular figures.
          </p>
        </div>

        {/* Standard vs Bold Emphasis Switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)] self-start">
          <button
            type="button"
            onClick={() => setEmphasized(false)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              !emphasized
                ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold"
                : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
            )}
          >
            Standard Weight
          </button>
          <button
            type="button"
            onClick={() => setEmphasized(true)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              emphasized
                ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold"
                : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
            )}
          >
            Bold Emphasis
          </button>
        </div>
      </div>

      {/* Main Grid: Type Specimen Table + Tabular Nums Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Specimen Table */}
        <div className="lg:col-span-8 tonal-card divide-y divide-[var(--sys-outline-variant)] overflow-hidden">
          {typeScale.map((row) => (
            <div
              key={row.token}
              className="p-5 sm:p-6 flex flex-col gap-3 hover:bg-[var(--sys-surface-container)]/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--sys-on-surface)]">{row.role}</span>
                  <span className="font-mono text-[var(--sys-primary)]">{row.token}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] tabular-nums">
                  <span>{row.size}</span>
                  <span>·</span>
                  <span>Line Height: {row.lineHeight}</span>
                </div>
              </div>

              <div
                className={cn(
                  "text-[var(--sys-on-surface)] transition-all duration-150",
                  row.className,
                  emphasized ? row.emphWeight : row.baseWeight
                )}
              >
                {row.sample}
              </div>
            </div>
          ))}
        </div>

        {/* Right 4 Cols: Font Triad + Tabular-Nums Proof */}
        <div className="lg:col-span-4 space-y-6">
          {/* Font Stack Card */}
          <div className="tonal-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--sys-primary)]">
              <TextT size={16} /> Active Font Triad (2+1)
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)]">
                <div className="text-[11px] font-medium text-[var(--sys-on-surface-tertiary)]">
                  Interface &amp; Body Copy
                </div>
                <div className="text-lg font-bold text-[var(--sys-on-surface)] mt-0.5">
                  Manrope
                </div>
                <div className="text-xs text-[var(--sys-on-surface-secondary)] mt-1 tabular-nums">
                  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj 0123456789
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)]">
                <div className="text-[11px] font-medium text-[var(--sys-on-surface-tertiary)]">
                  Editorial Headings &amp; Optical Highlights
                </div>
                <div className="font-serif italic text-2xl text-[var(--sys-primary)] mt-0.5">
                  Fraunces Variable
                </div>
                <div className="text-xs text-[var(--sys-on-surface-secondary)] mt-1">
                  Variable optical size (9–144pt) with expressive soft serifs.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)]">
                <div className="text-[11px] font-medium text-[var(--sys-on-surface-tertiary)]">
                  Tokens, Coordinates &amp; Live Counters
                </div>
                <div className="font-mono text-base font-semibold text-[var(--sys-on-surface)] mt-0.5">
                  IBM Plex Mono
                </div>
                <div className="font-mono text-xs text-[var(--sys-on-surface-secondary)] mt-1 tabular-nums">
                  {"--sys-primary · 16.2:1 AAA"}
                </div>
              </div>
            </div>
          </div>

          {/* Tabular Numerals Live Proof */}
          <div className="tonal-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sys-primary)]">
                Jitter-Free Live Numbers
              </span>
              <button
                type="button"
                onClick={() => setIsTicking(!isTicking)}
                className="px-2.5 py-1 rounded-lg bg-[var(--sys-surface-high)] text-xs font-medium text-[var(--sys-on-surface)] flex items-center gap-1.5 cursor-pointer"
              >
                {isTicking ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
                {isTicking ? "Pause" : "Run"}
              </button>
            </div>

            <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
              Equal-width numbers (<code className="font-mono">tabular-nums</code>) keep live prices,
              timers, and counters from shaking horizontally as digits change.
            </p>

            {/* Bad: Proportional */}
            <div className="p-3.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-amber-500">
                <span className="flex items-center gap-1">
                  <Warning size={12} weight="fill" /> Standard Numbers (Shakes)
                </span>
                <span>Avoid</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  style={{ fontVariantNumeric: "proportional-nums" }}
                  className="text-2xl font-bold text-[var(--sys-on-surface)]"
                >
                  £{liveTicker.toFixed(2)}
                </span>
                <span className="text-xs text-[var(--sys-on-surface-tertiary)]">
                  ← Notice label jitter
                </span>
              </div>
            </div>

            {/* Good: Tabular */}
            <div className="p-3.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-emerald-500">
                <span className="flex items-center gap-1">
                  <CheckCircle size={12} weight="fill" /> Fixed-Width Numbers (Steady)
                </span>
                <span>Recommended</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--sys-on-surface)] tabular-nums">
                  £{liveTicker.toFixed(2)}
                </span>
                <span className="text-xs text-[var(--sys-on-surface-tertiary)]">
                  ← Rock-solid alignment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typographic Audit & Selection Rationale */}
      <div className="tonal-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--sys-outline-variant)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--sys-on-surface)]">
              Typography Analysis &amp; Stack Upgrade Rationale
            </h3>
            <p className="text-xs text-[var(--sys-on-surface-secondary)] mt-0.5">
              Why the system migrated from generic defaults to an optically engineered 2+1 pairing.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--sys-primary)]">
            Manrope · Fraunces · IBM Plex Mono
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {typographyAudit.map((item) => (
            <div
              key={item.role}
              className="p-4 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] space-y-2"
            >
              <div className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)]">
                {item.role}
              </div>
              <div className="text-sm font-bold text-[var(--sys-on-surface)]">{item.upgraded}</div>
              <div className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                Replaced: <span className="line-through">{item.previous}</span>
              </div>
              <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed pt-1">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
