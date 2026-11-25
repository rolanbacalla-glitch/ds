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
      role: "Display",
      token: "--type-display-lg",
      size: "3rem (48px)",
      lineHeight: "1.08",
      tracking: "-0.035em",
      baseWeight: "font-semibold",
      emphWeight: "font-bold",
      className: "text-3xl sm:text-5xl tracking-[-0.035em] leading-[1.08]",
      sample: "Built for clarity, precision, and speed.",
    },
    {
      role: "Heading 1",
      token: "--type-headline-lg",
      size: "2rem (32px)",
      lineHeight: "1.15",
      tracking: "-0.03em",
      baseWeight: "font-semibold",
      emphWeight: "font-bold",
      className: "text-2xl sm:text-[32px] tracking-[-0.03em] leading-[1.15]",
      sample: "Consistent visual hierarchy across every surface",
    },
    {
      role: "Heading 2",
      token: "--type-headline-md",
      size: "1.375rem (22px)",
      lineHeight: "1.28",
      tracking: "-0.02em",
      baseWeight: "font-semibold",
      emphWeight: "font-bold",
      className: "text-xl sm:text-[22px] tracking-[-0.02em] leading-[1.28]",
      sample: "Clear section titles that scan effortlessly",
    },
    {
      role: "Title",
      token: "--type-title-md",
      size: "1rem (16px)",
      lineHeight: "1.40",
      tracking: "-0.01em",
      baseWeight: "font-medium",
      emphWeight: "font-semibold",
      className: "text-base tracking-[-0.01em] leading-[1.4]",
      sample: "Card headers, dialogue titles, and navigation labels",
    },
    {
      role: "Body",
      token: "--type-body-md",
      size: "0.9375rem (15px)",
      lineHeight: "1.60",
      tracking: "0em",
      baseWeight: "font-normal",
      emphWeight: "font-medium",
      className: "text-[15px] leading-[1.6] text-[var(--sys-on-surface-secondary)]",
      sample:
        "Geist Sans delivers crisp neo-grotesque geometry with open counters, balanced stem weights in dark mode, and comfortable 65–72 character line measures.",
    },
    {
      role: "Code & Tokens",
      token: "--type-label-mono",
      size: "0.8125rem (13px)",
      lineHeight: "1.45",
      tracking: "0em",
      baseWeight: "font-mono font-normal",
      emphWeight: "font-mono font-medium",
      className: "font-mono text-[13px] text-[var(--sys-primary)] tabular-nums",
      sample: "--sys-primary · oklch(0.49 0.19 258) · 16.2:1 AAA",
    },
  ];

  const typographyRationale = [
    {
      role: "Interface & Display Sans",
      upgraded: "Geist Sans (Variable)",
      replaced: "Manrope + Newsreader Serif",
      rationale:
        "A single neo-grotesque variable family eliminates editorial serif friction and delivers razor-sharp legibility from 12px micro-labels to 48px product headlines.",
    },
    {
      role: "Code, Tokens & Data",
      upgraded: "Geist Mono (Variable)",
      replaced: "IBM Plex Mono",
      rationale:
        "Engineered alongside Geist Sans with matching x-height, unmistakable 0/O and 1/l glyphs, and rock-solid tabular alignment for design tokens and metrics.",
    },
  ];

  return (
    <section id="typography" className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--sys-outline-variant)]">
        <div className="space-y-1.5">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--sys-primary)]">
            Foundations / Typography
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[var(--sys-on-surface)]">
            Typography
          </h2>
          <p className="text-sm text-[var(--sys-on-surface-secondary)] max-w-2xl leading-relaxed">
            A disciplined 2-font product stack pairing{" "}
            <strong className="font-medium text-[var(--sys-on-surface)]">Geist Sans</strong> for
            interfaces and display headings with{" "}
            <strong className="font-medium text-[var(--sys-on-surface)]">Geist Mono</strong> for
            tokens, code snippets, and tabular numerals.
          </p>
        </div>

        {/* Standard vs Emphasised Switch */}
        <div className="inline-flex items-center p-1 rounded-lg bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)] self-start">
          <button
            type="button"
            onClick={() => setEmphasized(false)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
              !emphasized
                ? "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface)] shadow-xs border border-[var(--sys-outline-variant)]"
                : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
            )}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setEmphasized(true)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
              emphasized
                ? "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface)] shadow-xs border border-[var(--sys-outline-variant)]"
                : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
            )}
          >
            Emphasised
          </button>
        </div>
      </div>

      {/* Main Grid: Type Specimen Table + Font Pair & Tabular Nums */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Specimen Table */}
        <div className="lg:col-span-8 tonal-card divide-y divide-[var(--sys-outline-variant)] overflow-hidden">
          {typeScale.map((row) => (
            <div
              key={row.token}
              className="p-5 sm:p-6 flex flex-col gap-2.5 hover:bg-[var(--sys-surface-low)]/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--sys-on-surface)]">{row.role}</span>
                  <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--sys-surface-low)] text-[var(--sys-primary)]">
                    {row.token}
                  </code>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] tabular-nums">
                  <span>{row.size}</span>
                  <span>·</span>
                  <span>LH {row.lineHeight}</span>
                  <span>·</span>
                  <span>Track {row.tracking}</span>
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

        {/* Right 4 Cols: Active Pair + Tabular Numerals */}
        <div className="lg:col-span-4 space-y-6">
          <div className="tonal-card p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
              <TextT size={15} /> Active Typeface Pair
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)]">
                <div className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                  UI &amp; Display
                </div>
                <div className="text-lg font-semibold tracking-tight text-[var(--sys-on-surface)] mt-0.5">
                  Geist Sans
                </div>
                <div className="text-xs text-[var(--sys-on-surface-secondary)] mt-1 tabular-nums">
                  Aa Bb Cc Dd Ee Ff Gg Hh 0123456789
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)]">
                <div className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                  Code, Tokens &amp; Telemetry
                </div>
                <div className="font-mono text-base font-medium text-[var(--sys-on-surface)] mt-0.5">
                  Geist Mono
                </div>
                <div className="font-mono text-xs text-[var(--sys-on-surface-secondary)] mt-1 tabular-nums">
                  {"--sys-primary · 16.2:1 AAA"}
                </div>
              </div>
            </div>
          </div>

          {/* Tabular Numerals Live Proof */}
          <div className="tonal-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Tabular Numerals
              </span>
              <button
                type="button"
                onClick={() => setIsTicking(!isTicking)}
                className="px-2.5 py-1 rounded-md bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)] text-xs font-medium text-[var(--sys-on-surface)] flex items-center gap-1.5 cursor-pointer hover:bg-[var(--sys-surface-high)] transition-colors"
              >
                {isTicking ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
                {isTicking ? "Pause" : "Run"}
              </button>
            </div>

            <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
              Equal-width digits (<code className="font-mono">tabular-nums</code>) prevent layout
              jitter in live counters, prices, and tables.
            </p>

            <div className="p-3 rounded-lg bg-[var(--sys-surface-low)] border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-amber-500">
                <span className="flex items-center gap-1">
                  <Warning size={12} weight="fill" /> Proportional
                </span>
                <span>Avoid</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  style={{ fontVariantNumeric: "proportional-nums" }}
                  className="text-xl font-semibold text-[var(--sys-on-surface)]"
                >
                  £{liveTicker.toFixed(2)}
                </span>
                <span className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                  ← Jitters horizontally
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--sys-surface-low)] border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-emerald-500">
                <span className="flex items-center gap-1">
                  <CheckCircle size={12} weight="fill" /> Tabular
                </span>
                <span>Standard</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-[var(--sys-on-surface)] tabular-nums">
                  £{liveTicker.toFixed(2)}
                </span>
                <span className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                  ← Steady columns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Concise Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {typographyRationale.map((item) => (
          <div key={item.role} className="tonal-card p-5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)]">
                {item.role}
              </span>
              <span className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                Replaced <span className="line-through">{item.replaced}</span>
              </span>
            </div>
            <div className="text-sm font-semibold text-[var(--sys-on-surface)]">{item.upgraded}</div>
            <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed pt-0.5">
              {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
