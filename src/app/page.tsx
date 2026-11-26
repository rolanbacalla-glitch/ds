"use client";

import React, { useState, useEffect } from "react";
import { SEED_PRESETS, type SeedConfig } from "@/lib/tokens";
import { COMPONENT_SLUGS, type ComponentSlug } from "@/lib/component-registry";
import { TOKEN_BUILD_METADATA } from "@/lib/tokens.generated";
import { DocsShell, type DocSectionId } from "@/components/workbench/docs-shell";
import { TokenEngineSection } from "@/components/workbench/token-engine-section";
import { SurfacesGlassSection } from "@/components/workbench/surfaces-glass-section";
import { TypographySection } from "@/components/workbench/typography-section";
import { ComponentsSection } from "@/components/workbench/components-section";
import { MotionGeometrySection } from "@/components/workbench/motion-geometry-section";
import { ExportCompilerSection } from "@/components/workbench/export-compiler-section";
import { UsabilityChecksSection } from "@/components/workbench/usability-checks-section";
import { IconPlayground } from "@/components/dashboard/icon-playground";
import { AnimationsPlayground } from "@/components/dashboard/animations-playground";
import {
  DownloadSimple,
  Cube,
  Swatches,
  TextT,
  Stack,
  Sparkle,
  PlayCircle,
  ShieldCheck,
  Code,
  ArrowRight,
  ArrowUpRight,
} from "phosphor-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";

const VALID_SECTIONS: DocSectionId[] = [
  "overview",
  "colours",
  "typography",
  "surfaces",
  "components",
  "icons",
  "animations",
  "accessibility",
  "export",
];

export default function Home() {
  const { portfolioSettings } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [customSeed, setCustomSeed] = useState<SeedConfig | null>(null);
  const [activeSection, setActiveSection] = useState<DocSectionId>("overview");
  const [activeSpecSlug, setActiveSpecSlug] = useState<ComponentSlug | null>(null);

  const seed =
    customSeed ??
    SEED_PRESETS.find((p) => p.name === portfolioSettings.defaultPresetName) ??
    SEED_PRESETS[0];

  // Sync URL hash and ?spec= query param to focused documentation section
  useEffect(() => {
    const syncFromHash = () => {
      const params = new URLSearchParams(window.location.search);
      const specParam = params.get("spec") as ComponentSlug | null;
      if (specParam && COMPONENT_SLUGS.includes(specParam)) {
        setActiveSection("components");
        setActiveSpecSlug(specParam);
        return;
      }
      const hash = window.location.hash.replace("#", "") as DocSectionId;
      if (VALID_SECTIONS.includes(hash)) {
        setActiveSection(hash);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Sync live OKLCH seed parameters to root CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--seed-hue", String(seed.hue));
    root.style.setProperty("--seed-chroma", String(seed.chroma));
    root.style.setProperty("--seed-secondary-hue", String(seed.secondaryHue));
    root.style.setProperty("--seed-tertiary-hue", String(seed.tertiaryHue));
    root.style.setProperty("--seed-neutral-chroma", String(seed.neutralChroma));
    root.style.setProperty("--seed-radius-scale", String(seed.radiusScale));
  }, [seed]);

  const handleSelectSection = (id: DocSectionId) => {
    setActiveSection(id);
    if (id !== "components") {
      setActiveSpecSlug(null);
    }
    if (typeof window !== "undefined") {
      const nextHash = id === "overview" ? "" : `#${id}`;
      window.history.replaceState(null, "", nextHash || window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectSpec = (slug: ComponentSlug) => {
    setActiveSection("components");
    setActiveSpecSlug(slug);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#components");
      window.setTimeout(() => {
        const el = document.getElementById("inline-component-spec");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 60);
    }
  };

  const totalTokens =
    TOKEN_BUILD_METADATA.tier1Count +
    TOKEN_BUILD_METADATA.tier2Count +
    TOKEN_BUILD_METADATA.tier3Count;

  const overviewCards: Array<{
    id: DocSectionId;
    group: string;
    title: string;
    summary: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    {
      id: "colours",
      group: "Foundations",
      title: "Colours & Tokens",
      summary: `${totalTokens} OKLCH tokens across 3 tiers with live seed modulation and automatic light/dark polarity.`,
      icon: Swatches,
    },
    {
      id: "typography",
      group: "Foundations",
      title: "Typography",
      summary: "Geist Sans & Geist Mono variable type scale with tabular numerals for jitter-free data.",
      icon: TextT,
    },
    {
      id: "surfaces",
      group: "Foundations",
      title: "Surfaces & Motion",
      summary: "Tonal surface elevation, floating glass rules, concentric radii, and tactile spring curves.",
      icon: Stack,
    },
    {
      id: "components",
      group: "Library",
      title: "Components",
      summary: "Accessible Radix-backed UI primitives, form controls, dialogues, and interactive states.",
      icon: Cube,
    },
    {
      id: "icons",
      group: "Library",
      title: "Icons",
      summary: "Unified multi-library icon playground supporting Lucide, Phosphor, and Material Symbols.",
      icon: Sparkle,
    },
    {
      id: "animations",
      group: "Library",
      title: "Animations",
      summary: "35 minimalist 60fps geometric micro-loaders built with tokenised SVG and CSS keyframes.",
      icon: PlayCircle,
    },
    {
      id: "export",
      group: "Ship",
      title: "Export & Accessibility",
      summary: "WCAG AAA verification plus instant exports for Tailwind v4, Figma Variables, JSON, and AI.",
      icon: Code,
    },
  ];

  return (
    <DocsShell
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      activeSpecSlug={activeSpecSlug}
      onSelectSpec={handleSelectSpec}
      theme={theme}
      onToggleTheme={toggleTheme}
      seed={seed}
      onSelectPreset={(preset) => setCustomSeed(preset)}
    >
      {activeSection === "overview" && (
        <div className="space-y-12">
          {/* Clean, Modern Product Hero (Zero Serif Clutter, Zero Nested Box Noise) */}
          <section className="space-y-6 pb-10 border-b border-[var(--sys-outline-variant)]">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--sys-on-surface-tertiary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--sys-primary)]" />
              <span>RB Design System v{TOKEN_BUILD_METADATA.version}</span>
              <span aria-hidden="true">·</span>
              <span>{portfolioSettings.ownerDisplayName}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] leading-[1.08] text-[var(--sys-on-surface)] max-w-3xl text-balance">
              Design tokens, primitives, and foundations — built to ship.
            </h1>

            <p className="text-base text-[var(--sys-on-surface-secondary)] max-w-2xl leading-relaxed">
              A focused, perceptual OKLCH design system pairing{" "}
              <strong className="font-medium text-[var(--sys-on-surface)]">
                Geist Sans &amp; Mono
              </strong>{" "}
              with accessible React 19 primitives and ready-to-use token exports for code and Figma.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSelectSection("components")}
                className="h-10 px-4 rounded-lg bg-[var(--sys-on-surface)] text-[var(--sys-surface-canvas)] text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Cube size={16} />
                <span>Browse Components</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSection("export")}
                className="h-10 px-4 rounded-lg bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <DownloadSimple size={16} />
                <span>Export Tokens</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSpec("form-field")}
                className="h-10 px-3.5 rounded-lg text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-low)] text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Component Specs</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </section>

          {/* Compact Live Theme & Seed Strip */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Live Brand Seed
              </h2>
              <span className="text-xs font-mono text-[var(--sys-on-surface-tertiary)] tabular-nums">
                Hue {seed.hue}° · Chroma {seed.chroma} · {theme === "dark" ? "Dark" : "Light"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {SEED_PRESETS.map((preset) => {
                const isSelected = preset.name === seed.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCustomSeed(preset)}
                    className={
                      isSelected
                        ? "h-9 px-3 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-primary)] text-xs font-medium text-[var(--sys-on-surface)] inline-flex items-center gap-2 cursor-pointer"
                        : "h-9 px-3 rounded-lg bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] border border-[var(--sys-outline-variant)] text-xs text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] inline-flex items-center gap-2 transition-colors cursor-pointer"
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: `oklch(0.58 ${preset.chroma} ${preset.hue})` }}
                    />
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Clean 2x3 Architecture Directory */}
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
              Explore the System
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overviewCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleSelectSection(card.id)}
                    className="group tonal-card p-5 text-left flex flex-col justify-between gap-4 hover:border-[var(--sys-outline)] transition-colors cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-md bg-[var(--sys-surface-low)] border border-[var(--sys-outline-variant)] inline-flex items-center justify-center text-[var(--sys-primary)]">
                          <Icon size={16} />
                        </span>
                        <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)]">
                          {card.group}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] group-hover:text-[var(--sys-primary)] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                        {card.summary}
                      </p>
                    </div>

                    <div className="text-xs font-medium text-[var(--sys-on-surface-tertiary)] group-hover:text-[var(--sys-on-surface)] inline-flex items-center gap-1 transition-colors">
                      <span>Open</span>
                      <ArrowRight size={13} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Subtle Compliance Line */}
          <section className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-[var(--sys-on-surface-tertiary)] tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              WCAG 2.2 AAA (16.2:1 contrast)
            </span>
            <span>{totalTokens} semantic tokens</span>
            <span>Tailwind CSS v4 + W3C DTCG</span>
            <span>React 19 + Radix Primitives</span>
          </section>
        </div>
      )}

      {activeSection === "colours" && (
        <TokenEngineSection seed={seed} onChangeSeed={setCustomSeed} theme={theme} />
      )}

      {activeSection === "typography" && <TypographySection />}

      {activeSection === "surfaces" && (
        <div className="space-y-16">
          <SurfacesGlassSection theme={theme} />
          <div className="border-t border-[var(--sys-outline-variant)] pt-12">
            <MotionGeometrySection />
          </div>
        </div>
      )}

      {activeSection === "components" && (
        <ComponentsSection
          activeSpecSlug={activeSpecSlug}
          onSelectSpecSlug={setActiveSpecSlug}
        />
      )}

      {activeSection === "icons" && <IconPlayground />}

      {activeSection === "animations" && <AnimationsPlayground />}

      {activeSection === "accessibility" && <UsabilityChecksSection theme={theme} />}

      {activeSection === "export" && <ExportCompilerSection seed={seed} />}
    </DocsShell>
  );
}
