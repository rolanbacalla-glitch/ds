"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SEED_PRESETS, type SeedConfig } from "@/lib/tokens";
import {
  Sun,
  Moon,
  Command,
  MagnifyingGlass,
  Swatches,
  Stack,
  TextT,
  Cube,
  Waves,
  Sparkle,
  Code,
  ArrowRight,
  List,
  X,
  ShieldCheck,
  SignOut,
  LockKey,
} from "phosphor-react";
import { useAuth } from "@/components/auth/auth-provider";

export interface WorkbenchNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  seed: SeedConfig;
  onSelectPreset: (preset: SeedConfig) => void;
}

export const WORKBENCH_SECTIONS = [
  { id: "tokens", index: "01", label: "Colours", title: "Adaptive Colour Palettes & Themes", icon: Swatches },
  { id: "surfaces", index: "02", label: "Surfaces", title: "Clean Cards & Frosted Glass", icon: Stack },
  { id: "typography", index: "03", label: "Typography", title: "Readable Type & Live Numbers", icon: TextT },
  { id: "components", index: "04", label: "Components", title: "Interactive UI Building Blocks", icon: Cube },
  { id: "motion", index: "05", label: "Motion", title: "Smooth Animation & Rounded Corners", icon: Waves },
  { id: "icons", index: "06", label: "Icons", title: "Icon Library & Customiser", icon: Sparkle },
  { id: "usability", index: "07", label: "Usability", title: "Usability Guidelines, Compatibility & Checks", icon: ShieldCheck },
  { id: "export", index: "08", label: "Export", title: "Export for Code, Figma & AI", icon: Code },
] as const;

export const FloatingCommandBar: React.FC<WorkbenchNavProps> = ({
  activeSection,
  onSelectSection,
  theme,
  onToggleTheme,
  seed,
  onSelectPreset,
}) => {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, isAdmin, isApprovedForExport, openAuthModal, openAdminConsole, signOutUser } =
    useAuth();

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
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, onToggleTheme]);

  const filteredSections = WORKBENCH_SECTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.index.includes(query)
  );

  const filteredPresets = SEED_PRESETS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const activeSectionMeta =
    WORKBENCH_SECTIONS.find((sec) => sec.id === activeSection) ?? WORKBENCH_SECTIONS[0];

  return (
    <>
      {/* Subtle top viewport mask so scrolling content fades smoothly above the floating glass bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 inset-x-0 h-6 bg-gradient-to-b from-[var(--sys-surface-canvas)]/90 to-transparent pointer-events-none z-40"
      />

      {/* Z-Level 2: Unified Floating Frosted Glass Top Navbar */}
      <nav
        aria-label="Main navigation"
        style={{
          backdropFilter: "blur(40px) saturate(190%)",
          WebkitBackdropFilter: "blur(40px) saturate(190%)",
        }}
        className="fixed top-0 left-0 right-0 z-50 mx-3 sm:mx-6 mt-3 sm:mt-4 rounded-2xl liquid-glass-regular backdrop-blur-2xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-xl"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-3 min-w-0">
          {/* Brand + Version Badge */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
            aria-label="Antigravity Design System — back to top"
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--border-focus-ring)] rounded-lg shrink-0"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--sys-primary)] flex items-center justify-center text-[var(--sys-on-primary)] font-mono text-xs font-bold shadow-sm group-hover:scale-105 transition-transform shrink-0">
              A
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-sm tracking-tight text-[var(--sys-on-surface)] whitespace-nowrap">
                Antigravity
              </span>
              <span className="hidden xs:inline-block sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--sys-surface-high)]/80 text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)]">
                v2.4
              </span>
            </div>
          </button>

          {/* Center Navigation Links — Wide Desktop (xl: 1280px+) so all 8 sections fit with zero clipping */}
          <div className="hidden xl:flex items-center gap-0.5 2xl:gap-1 min-w-0">
            {WORKBENCH_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSection(sec.id)}
                  className={cn(
                    "px-2.5 2xl:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--border-focus-ring)]",
                    isActive
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold shadow-sm"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-high)]/60"
                  )}
                >
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Utility Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Active Theme Colour Indicator (Wide desktop only to prevent crowding on minimised screens) */}
            <button
              type="button"
              onClick={() => onSelectSection("tokens")}
              title="Customise Theme Colour"
              className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[var(--sys-surface-high)]/60 hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/30"
                style={{ backgroundColor: "var(--sys-primary)" }}
              />
              <span className="text-[11px] font-medium">{seed.name.split(" ")[0]}</span>
            </button>

            {/* Quick Search Trigger */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)] transition-colors cursor-pointer"
              aria-label="Open Quick Search"
            >
              <MagnifyingGlass size={14} weight="bold" />
              <span className="hidden md:inline text-[11px]">Search</span>
              <kbd className="hidden lg:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--sys-surface-lowest)]/70 text-[var(--sys-on-surface-tertiary)]">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
              title="Switch between Dark and Light mode (Shortcut: T)"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--sys-primary-container)] text-[var(--sys-on-primary-container)] border border-[var(--sys-outline-variant)] shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              {theme === "dark" ? (
                <>
                  <Moon size={14} weight="fill" />
                  <span className="hidden md:inline text-[11px]">Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} weight="fill" />
                  <span className="hidden md:inline text-[11px]">Light</span>
                </>
              )}
            </button>

            {/* Admin Console Button (Visible Exclusively to Admin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={openAdminConsole}
                title="Open Portfolio Admin Console"
                className="min-h-[36px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--sys-primary)] text-[var(--sys-on-primary)] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShieldCheck size={14} weight="fill" />
                <span className="hidden sm:inline text-[11px]">Admin</span>
              </button>
            )}

            {/* Authentication Trigger or Signed-In Account Controls */}
            {!user ? (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <LockKey size={14} weight="bold" className="text-[var(--sys-primary)]" />
                <span className="text-[11px]">Sign In</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => (isAdmin ? openAdminConsole() : onSelectSection("export"))}
                  title={`${user.email} — ${
                    isAdmin
                      ? "Portfolio Admin"
                      : isApprovedForExport
                      ? "Export Approved"
                      : "Portfolio Viewer"
                  }`}
                  className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)] cursor-pointer max-w-[130px]"
                >
                  <span className="truncate">{user.displayName || user.email?.split("@")[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  aria-label="Sign out"
                  title={`Sign out (${user.email})`}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)] transition-colors cursor-pointer"
                >
                  <SignOut size={14} weight="bold" />
                </button>
              </div>
            )}

            {/* Responsive Drawer Toggle for Mobile, Tablet & Minimised Desktop (< 1280px) */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="xl:hidden min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-[var(--sys-on-surface)] bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-highest)] border border-[var(--sys-outline-variant)] transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              {mobileMenuOpen ? <X size={16} /> : <List size={16} />}
              <span className="hidden sm:inline text-[11px] font-semibold">
                {mobileMenuOpen ? "Close" : activeSectionMeta.label}
              </span>
            </button>
          </div>
        </div>

        {/* Responsive Expandable Glass Drawer (< 1280px) — Shows ALL Sections, Preset & Account Controls */}
        {mobileMenuOpen && (
          <div className="max-w-[1400px] mx-auto xl:hidden mt-3 pt-3 border-t border-[var(--sys-outline-variant)] space-y-3 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {WORKBENCH_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      onSelectSection(sec.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-left transition-all cursor-pointer",
                      isActive
                        ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold shadow-sm"
                        : "bg-[var(--sys-surface-lowest)]/60 text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-high)]/70 border border-[var(--sys-outline-variant)]"
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate">{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Compact Utilities & Account Footer inside Drawer */}
            <div className="pt-2.5 border-t border-[var(--sys-outline-variant)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onSelectSection("tokens");
                  setMobileMenuOpen(false);
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[var(--sys-surface-lowest)]/70 hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)] inline-flex items-center gap-2 cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: "var(--sys-primary)" }}
                />
                <span>Theme: {seed.name}</span>
              </button>

              {user ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-[var(--sys-on-surface-secondary)] truncate max-w-[200px]">
                    {user.email}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAdminConsole();
                      }}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck size={14} weight="fill" />
                      <span>Admin Console</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void signOutUser();
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <SignOut size={14} weight="bold" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LockKey size={14} weight="bold" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Z-Level 2: Quick Search & Theme Switcher Modal */}
      {commandOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCommandOpen(false)}
        >
          <div
            style={{
              backdropFilter: "blur(40px) saturate(190%)",
              WebkitBackdropFilter: "blur(40px) saturate(190%)",
            }}
            className="liquid-glass-regular backdrop-blur-2xl w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--sys-outline-variant)]">
              <Command size={18} className="text-[var(--sys-primary)] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, switch colour themes, or toggle dark mode..."
                className="flex-1 min-w-0 bg-transparent text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-tertiary)] outline-none"
              />
              <button
                type="button"
                aria-label="Close quick search"
                onClick={() => setCommandOpen(false)}
                className="p-1.5 rounded-lg text-[var(--sys-on-surface-tertiary)] hover:text-[var(--sys-on-surface)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
              {/* Sections */}
              <div>
                <div className="px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                  Design System Sections
                </div>
                <div className="space-y-1">
                  {filteredSections.map((sec) => {
                    const Icon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          onSelectSection(sec.id);
                          setCommandOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--sys-surface-high)]/80 text-left transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={16} className="text-[var(--sys-primary)] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[var(--sys-on-surface)]">
                              {sec.label}
                            </div>
                            <div className="text-[11px] text-[var(--sys-on-surface-tertiary)] truncate">
                              {sec.title}
                            </div>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-[var(--sys-on-surface-tertiary)] group-hover:text-[var(--sys-primary)] group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presets */}
              <div>
                <div className="px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                  Colour Theme Presets
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setCommandOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sys-surface-high)]/80 border border-transparent hover:border-[var(--sys-outline-variant)] text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                          style={{
                            backgroundColor: `oklch(0.65 ${preset.chroma} ${preset.hue})`,
                          }}
                        />
                        <span className="text-xs font-medium text-[var(--sys-on-surface)] truncate">
                          {preset.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--sys-on-surface-tertiary)] tabular-nums shrink-0">
                        {preset.hue}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[var(--sys-outline-variant)] bg-[var(--sys-surface-lowest)]/40 flex items-center justify-between gap-2 text-[11px] text-[var(--sys-on-surface-tertiary)] font-mono">
              <span className="truncate">Press [T] anywhere to switch Dark / Light mode</span>
              <span className="shrink-0">ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
