"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Layers, X } from "lucide-react";
import {
  CRAFT_ARCHIVE_ITEMS,
  type ArchiveCategory,
  type ArchiveItem,
} from "@/data/portfolio-works";

const CATEGORIES: ArchiveCategory[] = [
  "All",
  "Product UI",
  "Web & Editorial",
  "Brand & Spatial",
];

export function CraftArchiveSection() {
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory>("All");
  const [activeItem, setActiveItem] = useState<ArchiveItem | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const visibleItems =
    selectedCategory === "All"
      ? CRAFT_ARCHIVE_ITEMS
      : CRAFT_ARCHIVE_ITEMS.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    if (!activeItem) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeItem]);

  return (
    <section id="archive" aria-labelledby="archive-heading" className="scroll-mt-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
            Tier 2 · Curated Craft, Web &amp; Brand Archive
          </p>
          <h2
            id="archive-heading"
            className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--sys-on-surface)]"
          >
            Visual Craft &amp; Cross-Disciplinary Explorations
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--sys-on-surface-secondary)]">
            Additional shipped websites, conversion flows, dashboard systems, and brand identities—organised in a scannable archive so the four flagship case studies stay razor-focused.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter craft archive by category"
          className="flex flex-wrap gap-2"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2 ${
                  isSelected
                    ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)]"
                    : "border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-secondary)] hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filterable Bento Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <article
            key={item.id}
            className="tonal-card group flex flex-col justify-between p-5 hover:border-[var(--sys-outline)]"
          >
            <div>
              {/* Adaptive Neutral Stage Thumbnail */}
              <div
                className={`relative overflow-hidden rounded-xl border p-4 ${
                  item.stageTone === "dark"
                    ? "border-white/10 bg-[#12141A] text-white"
                    : "border-slate-200 bg-[#F8FAFC] text-[#0F172A]"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider opacity-75">
                  <span>{item.category}</span>
                  <span>{item.dimensions}</span>
                </div>

                {/* Palette Swatch Strip */}
                <div className="mt-4 flex items-center gap-1.5">
                  {item.palette.map((hex) => (
                    <span
                      key={hex}
                      title={hex}
                      className="h-5 w-5 rounded-full border border-black/15"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                <p className="mt-4 text-xs font-medium opacity-90">{item.highlight}</p>
              </div>

              <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--sys-on-surface)]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sys-on-surface-secondary)]">
                {item.summary}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--sys-outline-variant)] pt-4">
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--sys-surface-low)] px-2 py-1 font-mono text-[11px] text-[var(--sys-on-surface-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveItem(item)}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[var(--sys-primary)] transition-colors hover:bg-[var(--sys-primary-container)]/40 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
              >
                Inspect
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Z-Level 2 Liquid Glass Archive Inspector Dialogue */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="liquid-glass-regular w-full max-w-2xl rounded-[var(--sys-radius-xl)] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--sys-outline-variant)] pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                  {activeItem.category} · {activeItem.aspectProfile}
                </p>
                <h3
                  id="archive-modal-title"
                  className="mt-1 text-xl font-semibold text-[var(--sys-on-surface)]"
                >
                  {activeItem.title}
                </h3>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="Close archive inspector"
                onClick={() => setActiveItem(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--sys-outline)] bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm leading-relaxed text-[var(--sys-on-surface-secondary)]">
                {activeItem.summary}
              </p>

              <div className="rounded-xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-lowest)] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sys-on-surface)]">
                  <Layers className="h-4 w-4 text-[var(--sys-primary)]" aria-hidden="true" />
                  Source Album Artefact Metadata
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--sys-on-surface-tertiary)]">Original File</dt>
                    <dd className="font-mono text-[var(--sys-on-surface)]">
                      {activeItem.sourceFilename}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--sys-on-surface-tertiary)]">Canvas Dimensions</dt>
                    <dd className="font-mono text-[var(--sys-on-surface)]">
                      {activeItem.dimensions} px
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  {activeItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] px-3 py-1 font-mono text-xs text-[var(--sys-on-surface-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={activeItem.assetHref ?? "#"}
                  className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-[var(--sys-primary)] px-4 text-xs font-semibold text-[var(--sys-on-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
                >
                  Open Source Board
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
