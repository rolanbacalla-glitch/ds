"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, Sparkles } from "lucide-react";
import {
  VisualArchivePopout,
  type PopoutPillar,
} from "@/components/portfolio/visual-archive-popout";

const EXISTING_CARDS = [
  {
    title: "StreamMagic",
    category: "Connected Audio · Companion App",
    pillar: "Cambridge Audio" as PopoutPillar,
  },
  {
    title: "Melomania Connect",
    category: "Audio Hardware · Personas & UI",
    pillar: "Cambridge Audio" as PopoutPillar,
  },
  {
    title: "Design Systems Foundations",
    category: "Tokens · Components · WCAG 2.2 AA",
    pillar: "FinTech & SaaS" as PopoutPillar,
  },
];

export default function PortfolioPopoutPreviewPage() {
  const [popoutOpen, setPopoutOpen] = useState(true);
  const [initialPillar, setInitialPillar] = useState<PopoutPillar>("All");

  const openPopout = (pillar: PopoutPillar = "All") => {
    setInitialPillar(pillar);
    setPopoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#EAECEF] px-4 py-6 text-[#10161C] sm:px-6 lg:py-8">
      <div className="mx-auto max-w-[1380px] space-y-5 lg:space-y-6">
        {/* Integration Preview Context Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#D8D4CB] bg-[#0F131A] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 text-[#54D6AE]" aria-hidden="true" />
            <span>
              <strong>rolanbacalla.space Popout Preview</strong> — Click any{" "}
              <span className="text-[#54D6AE]">Visual Archive (18 Works)</span> trigger below to test the drop-in modal.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openPopout("All")}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#2CA884] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Launch Popout
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <Link
              href="/"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10"
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Design System
            </Link>
          </div>
        </div>

        {/* Simulated Section 03 (#work) from rolanbacalla.space */}
        <section
          aria-labelledby="work-section-heading"
          className="rounded-[28px] border border-[#D8D4CB] bg-[#FAF8F5] p-6 shadow-[0_1px_3px_rgba(16,22,28,0.04)] sm:p-10 lg:rounded-[36px] lg:p-14"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-[#D8D4CB] bg-white px-3 py-1 font-mono text-[11px] font-semibold tabular-nums text-[#10161C]">
                03 · SELECTED CASE STUDIES
              </span>
              <h1
                id="work-section-heading"
                className="mt-4 text-3xl font-extrabold tracking-[-0.035em] text-[#10161C] sm:text-5xl"
              >
                Selected <span className="text-[#2CA884]">Case Studies</span>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.6] text-[#6B7280]">
                Your existing 6-card grid stays clean and focused—while visitors can pop open the full 18-work visual archive right here without leaving{" "}
                <strong className="text-[#10161C]">rolanbacalla.space</strong>.
              </p>
            </div>

            {/* Natural Trigger #1: Section Header Pill */}
            <button
              type="button"
              onClick={() => openPopout("All")}
              className="inline-flex min-h-[46px] shrink-0 items-center gap-2 self-start rounded-full bg-[#0F171E] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1E293B] focus-visible:outline-2 focus-visible:outline-[#2CA884] focus-visible:outline-offset-2 lg:self-end"
            >
              Explore Visual Archive (18 Works)
              <ArrowUpRight className="h-4 w-4 text-[#54D6AE]" aria-hidden="true" />
            </button>
          </div>

          {/* 3 Sample Cards Matching rolanbacalla.space's Existing Aesthetic */}
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {EXISTING_CARDS.map((card) => (
              <article
                key={card.title}
                className="flex min-h-[280px] flex-col justify-between rounded-[24px] bg-[#0B0F14] p-7 text-white"
              >
                <span className="text-xs font-medium text-neutral-400">{card.category}</span>
                <div>
                  <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-white">
                    {card.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => openPopout(card.pillar)}
                    className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#54D6AE] hover:underline focus-visible:outline-2 focus-visible:outline-[#54D6AE] focus-visible:outline-offset-2"
                  >
                    Open in Visual Archive →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Simulated Footer Trigger from rolanbacalla.space */}
        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#D8D4CB] bg-[#FAF8F5] px-6 py-6 sm:px-10">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1D7A5E]">
              Footer Integration
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Replaces the external Google Photos link in your footer with an in-site popout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openPopout("All")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D8D4CB] bg-white px-5 text-sm font-semibold text-[#10161C] transition-colors hover:border-[#10161C] focus-visible:outline-2 focus-visible:outline-[#2CA884] focus-visible:outline-offset-2"
          >
            Visual Archive (18)
            <ArrowUpRight className="h-4 w-4 text-[#2CA884]" aria-hidden="true" />
          </button>
        </footer>
      </div>

      {/* The Drop-In Popout Component */}
      <VisualArchivePopout
        isOpen={popoutOpen}
        onClose={() => setPopoutOpen(false)}
        initialPillar={initialPillar}
      />
    </div>
  );
}
