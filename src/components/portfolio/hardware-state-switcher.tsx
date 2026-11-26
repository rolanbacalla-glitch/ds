"use client";

import React, { useState } from "react";
import { Disc3, Radio, SlidersHorizontal, Speaker, Volume2, Wifi } from "lucide-react";

interface HardwareState {
  id: string;
  label: string;
  model: "EVO 150" | "CXN100" | "EXN100";
  screenTitle: string;
  screenSubtitle: string;
  meta: string;
  volumePercent: number;
  mobileStatus: string;
  inputHint: string;
  accent: string;
}

const HARDWARE_STATES: HardwareState[] = [
  {
    id: "now-playing",
    label: "Now Playing",
    model: "EVO 150",
    screenTitle: "Midnight Architecture",
    screenSubtitle: "Nils Frahm · TIDAL Connect",
    meta: "FLAC 24-bit / 192 kHz",
    volumePercent: 64,
    mobileStatus: "Synced · Living Room EVO 150",
    inputHint: "Rotary dial adjusts volume in 1 dB steps",
    accent: "#D4A359",
  },
  {
    id: "input-source",
    label: "Input Source",
    model: "CXN100",
    screenTitle: "HDMI ARC · Active",
    screenSubtitle: "Next: Optical 1 · USB Audio · Phono",
    meta: "Variant B · 3m Legibility Grid",
    volumePercent: 52,
    mobileStatus: "Source switched via StreamMagic",
    inputHint: "Single-turn rotary selector replaces 4 nested menus",
    accent: "#60A5FA",
  },
  {
    id: "volume-arc",
    label: "Volume Telemetry",
    model: "EXN100",
    screenTitle: "-24.0 dB",
    screenSubtitle: "Pre-Amp Output · High Contrast Arc",
    meta: "Zero-latency hardware feedback",
    volumePercent: 72,
    mobileStatus: "Live slider locked to rotary encoder",
    inputHint: "Auto-returns to Now Playing after 2.5s idle",
    accent: "#34D399",
  },
  {
    id: "melomania-handoff",
    label: "Melomania Handoff",
    model: "EVO 150",
    screenTitle: "Headphone Output",
    screenSubtitle: "Melomania P100 · aptX Lossless",
    meta: "ANC: Transparency · Custom EQ",
    volumePercent: 48,
    mobileStatus: "Melomania Connect profile active",
    inputHint: "Seamless transition from speakers to personal audio",
    accent: "#F59E0B",
  },
];

export function HardwareStateSwitcher() {
  const [activeId, setActiveId] = useState<string>(HARDWARE_STATES[0].id);
  const current = HARDWARE_STATES.find((s) => s.id === activeId) ?? HARDWARE_STATES[0];

  return (
    <section
      aria-label="Interactive Cambridge Audio Hardware-to-App Split View"
      className="tonal-card p-6 sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--sys-outline-variant)] pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
            Interactive Physical-to-Digital Split View
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--sys-on-surface)]">
            Cambridge Audio OLED Display ↔ StreamMagic Sync
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-[var(--sys-on-surface-secondary)]">
            Instead of scrolling a 7,236 px static strip, toggle live hardware display states below to inspect how physical rotary inputs and companion mobile screens stay synchronised.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Hardware display states"
          className="flex flex-wrap gap-2"
        >
          {HARDWARE_STATES.map((state) => {
            const isSelected = state.id === current.id;
            return (
              <button
                key={state.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveId(state.id)}
                className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2 ${
                  isSelected
                    ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)]"
                    : "bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)] hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
                }`}
              >
                {state.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Split View: Physical Brushed-Aluminium Chassis vs. Mobile Companion */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Brushed Aluminium Hardware Bezel */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-[var(--sys-radius-lg)] border border-white/15 bg-gradient-to-b from-[#2A2D33] via-[#1C1E22] to-[#141619] p-5 sm:p-6 text-white shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-neutral-400">
            <span className="flex items-center gap-2">
              <Speaker className="h-3.5 w-3.5" aria-hidden="true" />
              CAMBRIDGE AUDIO · {current.model}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              ONLINE
            </span>
          </div>

          {/* Embedded OLED Screen */}
          <div className="my-5 rounded-xl border border-white/10 bg-[#07080A] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${current.accent}44, #0D0F14 80%)`,
                  }}
                >
                  {current.id === "input-source" ? (
                    <Radio className="h-7 w-7" style={{ color: current.accent }} aria-hidden="true" />
                  ) : current.id === "volume-arc" ? (
                    <Volume2 className="h-7 w-7" style={{ color: current.accent }} aria-hidden="true" />
                  ) : current.id === "melomania-handoff" ? (
                    <SlidersHorizontal className="h-7 w-7" style={{ color: current.accent }} aria-hidden="true" />
                  ) : (
                    <Disc3 className="h-7 w-7" style={{ color: current.accent }} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                    {current.meta}
                  </p>
                  <p className="mt-0.5 text-2xl sm:text-3xl font-semibold tracking-tight text-white tabular-nums">
                    {current.screenTitle}
                  </p>
                  <p className="mt-1 text-sm text-neutral-300">{current.screenSubtitle}</p>
                </div>
              </div>

              {/* Simulated Dual-Concentric Rotary Dial */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <div
                  aria-hidden="true"
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-500 bg-gradient-to-br from-neutral-700 to-neutral-900 shadow-lg"
                >
                  <div className="h-9 w-9 rounded-full border border-white/20 bg-neutral-800 flex items-center justify-center">
                    <span className="font-mono text-[11px] font-semibold text-white tabular-nums">
                      {current.volumePercent}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  Rotary Dial
                </span>
              </div>
            </div>

            {/* Volume / Progress Bar */}
            <div className="mt-5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${current.volumePercent}%`, backgroundColor: current.accent }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-300">
            <span className="font-semibold text-white">Hardware Constraint Note:</span>{" "}
            {current.inputHint}
          </p>
        </div>

        {/* Right: Companion Mobile App Sync Card */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-[var(--sys-radius-lg)] border border-[var(--sys-outline)] bg-[var(--sys-surface-low)] p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Companion App
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium"
                style={{
                  backgroundColor: `${current.accent}22`,
                  color: "var(--sys-on-surface)",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: current.accent }}
                />
                Synced
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-lowest)] p-4">
              <p className="text-xs font-medium text-[var(--sys-on-surface-tertiary)]">
                {current.mobileStatus}
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--sys-on-surface)]">
                {current.screenTitle}
              </p>
              <p className="mt-0.5 text-xs text-[var(--sys-on-surface-secondary)]">
                {current.screenSubtitle}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--sys-outline-variant)] pt-3 text-xs text-[var(--sys-on-surface-secondary)]">
                <span>Output Level</span>
                <span className="font-mono font-semibold text-[var(--sys-on-surface)] tabular-nums">
                  {current.volumePercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-[var(--sys-surface-container)] p-3 text-xs text-[var(--sys-on-surface-secondary)]">
            <strong className="text-[var(--sys-on-surface)]">Why this matters:</strong>{" "}
            Shared state vocabulary between mobile touch and front-panel OLED removes friction when switching between sofa remote, phone, and physical dial.
          </div>
        </div>
      </div>
    </section>
  );
}
