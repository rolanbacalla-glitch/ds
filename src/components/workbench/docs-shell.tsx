"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SEED_PRESETS, type SeedConfig } from "@/lib/tokens";
import { TOKEN_BUILD_METADATA } from "@/lib/tokens.generated";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Sun,
  Moon,
  Command,
  MagnifyingGlass,
  Swatches,
  Stack,
  TextT,
  Cube,
  Sparkle,
  Code,
  ArrowRight,
  ArrowLeft,
  List,
  X,
  ShieldCheck,
  SignOut,
  LockKey,
} from "phosphor-react";

export type DocSectionId =
  | "overview"
  | "colours"
  | "typography"
  | "surfaces"
  | "components"
  | "icons"
  | "accessibility"
  | "export";

export interface NavItem {
  id: DocSectionId;
  label: string;
  description: string;
  group: "Overview" | "Foundations" | "Library" | "Ship";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const DOC_NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Introduction",
    description: "System architecture, brand presets & quick start",
    group: "Overview",
    icon: Sparkle,
  },
  {
    id: "colours",
    label: "Colours & Tokens",
    description: "Adaptive OKLCH palette and semantic colour roles",
    group: "Foundations",
    icon: Swatches,
  },
  {
    id: "typography",
    label: "Typography",
    description: "Geist Sans & Mono type scale and tabular numerals",
    group: "Foundations",
    icon: TextT,
  },
  {
    id: "surfaces",
    label: "Surfaces & Motion",
    description: "Elevation tiers, glass layer, radii & spring curves",
    group: "Foundations",
    icon: Stack,
  },
  {
    id: "components",
    label: "Components",
    description: "Interactive UI primitives and states",
    group: "Library",
    icon: Cube,
  },
  {
    id: "icons",
    label: "Icons",
    description: "Multi-library optical icon explorer",
    group: "Library",
    icon: Sparkle,
  },
  {
    id: "accessibility",
    label: "Accessibility & QA",
    description: "WCAG contrast checks and usability guidelines",
    group: "Ship",
    icon: ShieldCheck,
  },
  {
    id: "export",
    label: "Export Tokens",
    description: "Tailwind v4, Figma DTCG JSON & DESIGN.md",
    group: "Ship",
    icon: Code,
  },
];

const NAV_GROUPS: Array<NavItem["group"]> = ["Overview", "Foundations", "Library", "Ship"];

const COMPONENT_SPECS: Array<{
  slug: "form-field" | "modal-dialog" | "data-table" | "button";
  label: string;
}> = [
  { slug: "form-field", label: "Form Field" },
  { slug: "modal-dialog", label: "Modal Dialogue" },
  { slug: "data-table", label: "Data Table" },
  { slug: "button", label: "M3 Shape-Morphing Action Button" },
];

interface DocsShellProps {
  activeSection: DocSectionId;
  onSelectSection: (id: DocSectionId) => void;
  activeSpecSlug?: "form-field" | "modal-dialog" | "data-table" | "button" | null;
  onSelectSpec?: (slug: "form-field" | "modal-dialog" | "data-table" | "button") => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  seed: SeedConfig;
  onSelectPreset: (preset: SeedConfig) => void;
  children: React.ReactNode;
}

export const DocsShell: React.FC<DocsShellProps> = ({
  activeSection,
  onSelectSection,
  activeSpecSlug,
  onSelectSpec,
  theme,
  onToggleTheme,
  seed,
  onSelectPreset,
  children,
}) => {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, isAdmin, openAuthModal, openAdminConsole, signOutUser } = useAuth();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (
        e.key.toLowerCase() === "t" &&
        !commandOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        onToggleTheme();
      } else if (e.key === "Escape") {
        setCommandOpen(false);
        setMobileMenuOpen(false);
        setPresetMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, onToggleTheme]);

  const activeIdx = DOC_NAV_ITEMS.findIndex((item) => item.id === activeSection);
  const prevItem = activeIdx > 0 ? DOC_NAV_ITEMS[activeIdx - 1] : null;
  const nextItem =
    activeIdx >= 0 && activeIdx < DOC_NAV_ITEMS.length - 1 ? DOC_NAV_ITEMS[activeIdx + 1] : null;

  // Spec-aware Previous / Next targets when viewing an inline Component Spec
  const activeSpecIdx =
    activeSection === "components" && activeSpecSlug
      ? COMPONENT_SPECS.findIndex((s) => s.slug === activeSpecSlug)
      : -1;

  const prevTarget: { label: string; onClick: () => void } | null =
    activeSpecIdx >= 0
      ? activeSpecIdx > 0
        ? {
            label: COMPONENT_SPECS[activeSpecIdx - 1].label,
            onClick: () => onSelectSpec?.(COMPONENT_SPECS[activeSpecIdx - 1].slug),
          }
        : prevItem
          ? { label: prevItem.label, onClick: () => handleNavClick(prevItem.id) }
          : null
      : prevItem
        ? { label: prevItem.label, onClick: () => handleNavClick(prevItem.id) }
        : null;

  const nextTarget: { label: string; onClick: () => void } | null =
    activeSpecIdx >= 0
      ? activeSpecIdx < COMPONENT_SPECS.length - 1
        ? {
            label: COMPONENT_SPECS[activeSpecIdx + 1].label,
            onClick: () => onSelectSpec?.(COMPONENT_SPECS[activeSpecIdx + 1].slug),
          }
        : nextItem
          ? { label: nextItem.label, onClick: () => handleNavClick(nextItem.id) }
          : null
      : nextItem
        ? { label: nextItem.label, onClick: () => handleNavClick(nextItem.id) }
        : null;

  const filteredItems = DOC_NAV_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPresets = SEED_PRESETS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavClick = (id: DocSectionId) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--sys-surface-canvas)] text-[var(--sys-on-surface)] flex flex-col">
      {/* Single Clean Hairline Top Bar (56px) */}
      <header className="sticky top-0 z-40 h-14 border-b border-[var(--sys-outline-variant)] bg-[var(--sys-surface-canvas)]/85 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Mobile Drawer Toggle + Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-low)] transition-colors cursor-pointer"
            >
              <List size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("overview")}
              className="flex items-center gap-2.5 text-left cursor-pointer group rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-primary)]"
            >
              <span className="w-6 h-6 rounded-md bg-[var(--sys-on-surface)] text-[var(--sys-surface-canvas)] font-mono text-[11px] font-bold inline-flex items-center justify-center shrink-0">
                RB
              </span>
              <span className="text-sm font-semibold tracking-tight text-[var(--sys-on-surface)] whitespace-nowrap">
                RB Design System
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-tertiary)] border border-[var(--sys-outline-variant)]">
                v{TOKEN_BUILD_METADATA.version}
              </span>
            </button>
          </div>

          {/* Right: Search, Brand Preset, Theme Toggle, Account */}
          <div className="flex items-center gap-2">
            {/* Search / Command Trigger */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="h-8 px-2.5 sm:px-3 rounded-md bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] border border-[var(--sys-outline-variant)] text-xs text-[var(--sys-on-surface-secondary)] inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MagnifyingGlass size={14} />
              <span className="hidden md:inline">Search docs…</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--sys-surface-canvas)] border border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-tertiary)]">
                <Command size={10} />K
              </kbd>
            </button>

            {/* Brand Seed Preset Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPresetMenuOpen((prev) => !prev)}
                aria-expanded={presetMenuOpen}
                aria-label="Switch brand colour preset"
                className="h-8 px-2.5 rounded-md bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] border border-[var(--sys-outline-variant)] text-xs font-medium text-[var(--sys-on-surface)] inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full bg-[var(--sys-primary)] shrink-0"
                />
                <span className="hidden sm:inline max-w-[110px] truncate">{seed.name}</span>
              </button>

              {presetMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPresetMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] shadow-xl p-1.5 z-50">
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                      OKLCH Brand Preset
                    </div>
                    {SEED_PRESETS.map((preset) => {
                      const active = preset.name === seed.name;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            onSelectPreset(preset);
                            setPresetMenuOpen(false);
                          }}
                          className={cn(
                            "w-full px-2.5 py-1.5 rounded-md text-xs text-left flex items-center justify-between transition-colors cursor-pointer",
                            active
                              ? "bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] font-medium"
                              : "text-[var(--sys-on-surface-secondary)] hover:bg-[var(--sys-surface-low)] hover:text-[var(--sys-on-surface)]"
                          )}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: `oklch(0.58 ${preset.chroma} ${preset.hue})`,
                              }}
                            />
                            <span className="truncate">{preset.name}</span>
                          </span>
                          {active && (
                            <span className="text-[10px] font-mono text-[var(--sys-primary)]">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title="Toggle theme (T)"
              className="w-8 h-8 rounded-md bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] border border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Auth / Admin */}
            {isAdmin ? (
              <button
                type="button"
                onClick={openAdminConsole}
                className="hidden sm:inline-flex h-8 px-2.5 rounded-md bg-[var(--sys-primary-container)] text-[var(--sys-on-primary-container)] text-xs font-medium items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} weight="fill" />
                <span>Admin</span>
              </button>
            ) : user ? (
              <button
                type="button"
                onClick={() => signOutUser()}
                title="Sign out"
                className="w-8 h-8 rounded-md bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] border border-[var(--sys-outline-variant)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <SignOut size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                title="Sign in"
                className="hidden sm:inline-flex h-8 px-2.5 rounded-md bg-[var(--sys-surface-low)] hover:bg-[var(--sys-surface-container)] border border-[var(--sys-outline-variant)] text-xs font-medium text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LockKey size={13} />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main 2-Column Workspace */}
      <div className="max-w-[1440px] w-full mx-auto flex-1 flex">
        {/* Desktop Persistent Left Sidebar (240px) */}
        <aside
          aria-label="Documentation navigation"
          className="hidden lg:block w-60 shrink-0 border-r border-[var(--sys-outline-variant)]"
        >
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group} className="space-y-1">
                <div className="px-2.5 pb-1 text-[11px] font-medium text-[var(--sys-on-surface-tertiary)]">
                  {group}
                </div>
                {DOC_NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full px-2.5 py-1.5 rounded-md text-[13px] flex items-center gap-2.5 text-left transition-colors cursor-pointer",
                        active
                          ? "bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] font-medium border border-[var(--sys-outline-variant)]"
                          : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-low)]/60 border border-transparent"
                      )}
                    >
                      <Icon
                        size={15}
                        className={
                          active
                            ? "text-[var(--sys-primary)] shrink-0"
                            : "text-[var(--sys-on-surface-tertiary)] shrink-0"
                        }
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Focused Document Content Column */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="max-w-5xl mx-auto">
            {children}

            {/* Previous / Next Pagination Footer */}
            <footer className="mt-16 pt-6 border-t border-[var(--sys-outline-variant)] flex items-center justify-between gap-4">
              {prevTarget ? (
                <button
                  type="button"
                  onClick={prevTarget.onClick}
                  className="group flex flex-col items-start gap-1 text-left cursor-pointer"
                >
                  <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] inline-flex items-center gap-1">
                    <ArrowLeft size={12} /> Previous
                  </span>
                  <span className="text-sm font-medium text-[var(--sys-on-surface)] group-hover:text-[var(--sys-primary)] transition-colors">
                    {prevTarget.label}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextTarget ? (
                <button
                  type="button"
                  onClick={nextTarget.onClick}
                  className="group flex flex-col items-end gap-1 text-right cursor-pointer"
                >
                  <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] inline-flex items-center gap-1">
                    Next <ArrowRight size={12} />
                  </span>
                  <span className="text-sm font-medium text-[var(--sys-on-surface)] group-hover:text-[var(--sys-primary)] transition-colors">
                    {nextTarget.label}
                  </span>
                </button>
              ) : (
                <div />
              )}
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-[var(--sys-surface-canvas)] border-r border-[var(--sys-outline)] h-full overflow-y-auto p-4 space-y-6 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sys-outline-variant)]">
              <span className="text-sm font-semibold text-[var(--sys-on-surface)]">
                RB Design System
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--sys-on-surface-secondary)] hover:bg-[var(--sys-surface-low)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {NAV_GROUPS.map((group) => (
              <div key={group} className="space-y-1">
                <div className="px-2 pb-1 text-[11px] font-medium text-[var(--sys-on-surface-tertiary)]">
                  {group}
                </div>
                {DOC_NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full px-2.5 py-2 rounded-md text-sm flex items-center gap-2.5 text-left cursor-pointer",
                        active
                          ? "bg-[var(--sys-surface-low)] text-[var(--sys-on-surface)] font-medium"
                          : "text-[var(--sys-on-surface-secondary)] hover:bg-[var(--sys-surface-low)]/60"
                      )}
                    >
                      <Icon
                        size={16}
                        className={active ? "text-[var(--sys-primary)]" : "text-[var(--sys-on-surface-tertiary)]"}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      {commandOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search design system"
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setCommandOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] shadow-2xl overflow-hidden z-10">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--sys-outline-variant)]">
              <MagnifyingGlass size={16} className="text-[var(--sys-on-surface-tertiary)]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to section or switch brand preset…"
                className="flex-1 bg-transparent text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-tertiary)] outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--sys-surface-low)] text-[var(--sys-on-surface-tertiary)] cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-3">
              {filteredItems.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                    Documentation
                  </div>
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleNavClick(item.id);
                          setCommandOpen(false);
                          setQuery("");
                        }}
                        className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[var(--sys-surface-low)] flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon size={15} className="text-[var(--sys-primary)] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-[var(--sys-on-surface)]">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-[var(--sys-on-surface-tertiary)] truncate">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--sys-on-surface-tertiary)] shrink-0">
                          {item.group}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredPresets.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                    Brand Colour Presets
                  </div>
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setCommandOpen(false);
                        setQuery("");
                      }}
                      className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[var(--sys-surface-low)] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-xs text-[var(--sys-on-surface)]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: `oklch(0.58 ${preset.chroma} ${preset.hue})`,
                          }}
                        />
                        {preset.name}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)]">
                        Hue {preset.hue}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
