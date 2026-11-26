"use client";

import React, { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { SlidingTabList } from "@/components/ui/sliding-tab-list";
import * as Icons from "phosphor-react";
import {
  SpotifyIcon,
  AirplayIcon,
  AirplayAudioIcon,
  SpotifyAirplayIcon,
  CastIcon,
  CastConnectedIcon,
  BluetoothAudioIcon,
  LosslessAudioIcon,
  type MediaIconProps,
} from "@antigravity/icons";
import materialIconsData from "@/data/material-icons.json";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/auth-provider";

type IconWeight = "thin" | "light" | "regular" | "bold";
type PhosphorIconComponent = React.ComponentType<Icons.IconProps>;
type CustomMediaIconComponent = React.ComponentType<MediaIconProps>;
type IconSetType = "all" | "material" | "phosphor" | "media";

interface UnifiedIconItem {
  id: string;
  name: string;
  source: "material" | "phosphor" | "media";
  category?: string;
  tags?: string[];
  phosphorIcon?: PhosphorIconComponent;
  customIcon?: CustomMediaIconComponent;
  materialName?: string;
}

export const IconPlayground: React.FC = () => {
  const [selectedIcon, setSelectedIcon] = useState<UnifiedIconItem>({
    id: "material:volume_up",
    name: "volume_up",
    source: "material",
    materialName: "volume_up",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSet, setActiveSet] = useState<IconSetType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [size, setSize] = useState(56);
  const [weight, setWeight] = useState<IconWeight>("regular");
  const [filled, setFilled] = useState(false);
  const [showKeylines, setShowKeylines] = useState(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { user, logAuditEvent } = useAuth();

  const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "av", label: "Audio & Video" },
    { id: "action", label: "Actions" },
    { id: "communication", label: "Communication" },
    { id: "device", label: "Devices" },
    { id: "hardware", label: "Hardware" },
    { id: "navigation", label: "Navigation" },
    { id: "image", label: "Media & Photo" },
    { id: "social", label: "Social" },
  ] as const;

  // Phosphor Icon items (deduplicated by canonical source:name ID)
  const PHOSPHOR_ICONS: UnifiedIconItem[] = useMemo(() => {
    const seen = new Map<string, UnifiedIconItem>();
    for (const [name, Icon] of Object.entries(Icons)) {
      if (
        typeof Icon === "string" ||
        name === "IconContext" ||
        name === "Icons" ||
        !/^[A-Z]/.test(name)
      ) {
        continue;
      }
      const canonicalId = `phosphor:${name}`;
      if (!seen.has(canonicalId)) {
        seen.set(canonicalId, {
          id: canonicalId,
          name,
          source: "phosphor" as const,
          phosphorIcon: Icon as unknown as PhosphorIconComponent,
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Material Design Icons list (deduplicated by canonical source:name ID)
  const MATERIAL_ICONS: UnifiedIconItem[] = useMemo(() => {
    const seen = new Map<string, UnifiedIconItem>();
    for (const item of materialIconsData as { name: string; tags: string[]; category: string }[]) {
      const canonicalId = `material:${item.name}`;
      if (!seen.has(canonicalId)) {
        seen.set(canonicalId, {
          id: canonicalId,
          name: item.name,
          source: "material" as const,
          category: item.category,
          tags: item.tags,
          materialName: item.name,
        });
      }
    }
    return Array.from(seen.values());
  }, []);

  // Antigravity Media & Brand Icons (Spotify, AirPlay, Cast, Bluetooth, Lossless)
  const MEDIA_ICONS: UnifiedIconItem[] = useMemo(
    () => [
      {
        id: "media-spotify",
        name: "SpotifyIcon",
        source: "media",
        category: "av",
        tags: ["spotify", "music", "audio", "streaming", "brand", "sound"],
        customIcon: SpotifyIcon,
      },
      {
        id: "media-airplay",
        name: "AirplayIcon",
        source: "media",
        category: "av",
        tags: ["airplay", "apple", "cast", "screen", "mirror", "streaming", "video"],
        customIcon: AirplayIcon,
      },
      {
        id: "media-airplay-audio",
        name: "AirplayAudioIcon",
        source: "media",
        category: "av",
        tags: ["airplay", "audio", "apple", "speaker", "music", "wireless", "sound"],
        customIcon: AirplayAudioIcon,
      },
      {
        id: "media-spotify-airplay",
        name: "SpotifyAirplayIcon",
        source: "media",
        category: "av",
        tags: ["spotify", "airplay", "connect", "speaker", "cast", "audio", "device"],
        customIcon: SpotifyAirplayIcon,
      },
      {
        id: "media-cast",
        name: "CastIcon",
        source: "media",
        category: "av",
        tags: ["cast", "chromecast", "google", "tv", "stream", "mirror", "airplay"],
        customIcon: CastIcon,
      },
      {
        id: "media-cast-connected",
        name: "CastConnectedIcon",
        source: "media",
        category: "av",
        tags: ["cast", "chromecast", "connected", "active", "stream", "tv"],
        customIcon: CastConnectedIcon,
      },
      {
        id: "media-bluetooth-audio",
        name: "BluetoothAudioIcon",
        source: "media",
        category: "av",
        tags: ["bluetooth", "audio", "wireless", "headphones", "speaker", "connect"],
        customIcon: BluetoothAudioIcon,
      },
      {
        id: "media-lossless-audio",
        name: "LosslessAudioIcon",
        source: "media",
        category: "av",
        tags: ["lossless", "hires", "audio", "waveform", "sound", "music", "studio"],
        customIcon: LosslessAudioIcon,
      },
    ],
    []
  );

  // Combined pool
  const ALL_ICONS = useMemo(() => {
    if (activeSet === "media") return MEDIA_ICONS;
    if (activeSet === "material") return MATERIAL_ICONS;
    if (activeSet === "phosphor") return PHOSPHOR_ICONS;
    return [...MEDIA_ICONS, ...MATERIAL_ICONS, ...PHOSPHOR_ICONS];
  }, [activeSet, MEDIA_ICONS, MATERIAL_ICONS, PHOSPHOR_ICONS]);

  const filteredIcons = useMemo(() => {
    let pool = ALL_ICONS;

    // Filter by category if not 'all'
    if (selectedCategory !== "all") {
      pool = pool.filter((item) => {
        if (item.source === "material") {
          return item.category === selectedCategory;
        }
        // Phosphor fallback tag match
        return (
          item.name.toLowerCase().includes(selectedCategory) ||
          (item.tags && item.tags.includes(selectedCategory))
        );
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return pool.slice(0, 72);
    }

    const cleanQ = q.replace(/[-_\s]+/g, "");

    return pool
      .filter((item) => {
        const nameClean = item.name.toLowerCase().replace(/[-_\s]+/g, "");
        if (nameClean.includes(cleanQ)) return true;
        if (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) return true;
        return false;
      })
      .slice(0, 72);
  }, [searchQuery, selectedCategory, ALL_ICONS]);

  const handleCopy = (type: string, content: string, label?: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    if (user?.emailVerified) {
      void logAuditEvent("export_copy", `Icon (${type}): ${selectedIcon.name}`);
    }
    showToast(`Copied ${selectedIcon.name} ${label ?? "React JSX"} to clipboard`);
    setTimeout(() => setCopiedType(null), 1600);
  };

  const handleCopySvg = () => {
    const svgEl = previewRef.current?.querySelector("svg");
    if (svgEl) {
      handleCopy("svg", svgEl.outerHTML, "SVG");
      return;
    }
    // Material Symbols render as variable font glyphs; copy the HTML glyph snippet as fallback
    const fallbackHtml = `<span class="material-symbols-outlined" style="font-size:${size}px;font-variation-settings:'FILL' ${
      filled ? 1 : 0
    },'wght' ${materialWeightNumeric},'GRAD' 0,'opsz' 48">${selectedIcon.materialName ?? selectedIcon.name}</span>`;
    handleCopy("svg", fallbackHtml, "HTML glyph");
  };

  // Convert weight string to numeric font-variation weight for Material Symbols
  const materialWeightNumeric = useMemo(() => {
    switch (weight) {
      case "thin":
        return 200;
      case "light":
        return 300;
      case "regular":
        return 400;
      case "bold":
        return 700;
      default:
        return 400;
    }
  }, [weight]);

  // Effective Phosphor weight (fill toggle overrides stroke weight for Phosphor)
  const effectivePhosphorWeight: Icons.IconWeight = filled ? "fill" : weight;

  // Generate code snippet based on selected icon source
  const exports = useMemo(() => {
    if (selectedIcon.source === "material") {
      const code = `<span className="material-symbols-outlined text-[var(--sys-primary)]" style={{ fontSize: ${size}, fontVariationSettings: "'FILL' ${
        filled ? 1 : 0
      }, 'wght' ${materialWeightNumeric}, 'GRAD' 0, 'opsz' 48" }}>\n  ${selectedIcon.materialName}\n</span>`;
      return {
        code,
        label: "React / HTML Code",
      };
    }
    const code = `<${selectedIcon.name} size={${size}} weight="${effectivePhosphorWeight}" className="text-[var(--sys-primary)]" />`;
    return {
      code,
      label: "Phosphor React Code",
    };
  }, [selectedIcon, size, filled, materialWeightNumeric, effectivePhosphorWeight]);

  return (
    <section id="icons" className="scroll-mt-24 space-y-10">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--sys-outline-variant)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-[var(--sys-primary)]">
            <span>06 // ICONS & SYMBOLS</span>
            <span className="text-[var(--sys-on-surface-quaternary)]">•</span>
            <span>GOOGLE MATERIAL DESIGN + PHOSPHOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sys-on-surface)]">
            Icon Library &{" "}
            <span className="font-serif italic font-normal text-[var(--sys-primary)]">
              Live Customiser
            </span>
          </h2>
          <p className="text-sm text-[var(--sys-on-surface-secondary)] max-w-3xl leading-relaxed">
            Connected to the official{" "}
            <strong className="text-[var(--sys-on-surface)]">Google Material Design Icons</strong>{" "}
            database (2,120+ symbols) and Phosphor Icons (1,040+ SF Symbols style). Search by name,
            keyword, or action (e.g. <code className="font-mono">volume</code>,{" "}
            <code className="font-mono">settings</code>, <code className="font-mono">lock</code>).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Optical Keyline Inspector & Weight Controls */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 tonal-card p-6 flex flex-col gap-5">
          {/* Keyline Preview Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--sys-primary)] leading-none whitespace-nowrap">
                  Icon Preview
                </span>
                <span className="font-mono text-[10px] text-[var(--sys-on-surface-tertiary)] truncate">
                  {selectedIcon.source === "material"
                    ? "Material Design"
                    : selectedIcon.source === "media"
                      ? "@antigravity/icons"
                      : "Phosphor Icons"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeylines(!showKeylines)}
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

            <div
              ref={previewRef}
              className="relative h-56 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-center justify-center overflow-hidden"
            >
              {showKeylines && (
                <>
                  <div className="absolute inset-0 swiss-grid-bg opacity-60 pointer-events-none" />
                  {/* Keyline Circle & Square Guides */}
                  <div className="absolute w-32 h-32 rounded-full border border-dashed border-[var(--sys-primary)]/35 pointer-events-none" />
                  <div className="absolute w-28 h-28 border border-[var(--sys-primary)]/25 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--sys-primary)]/25 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--sys-primary)]/25 pointer-events-none" />
                </>
              )}

              {/* Live Icon Rendering */}
              {selectedIcon.source === "material" ? (
                <span
                  className="material-symbols-outlined text-[var(--sys-primary)] select-none transition-all duration-150"
                  style={{
                    fontSize: `${size}px`,
                    fontVariationSettings: `'FILL' ${
                      filled ? 1 : 0
                    }, 'wght' ${materialWeightNumeric}, 'GRAD' 0, 'opsz' 48`,
                  }}
                >
                  {selectedIcon.materialName}
                </span>
              ) : selectedIcon.customIcon ? (
                <selectedIcon.customIcon
                  size={size}
                  strokeWidth={weight === "thin" ? 1.2 : weight === "light" ? 1.5 : weight === "bold" ? 2.4 : 1.8}
                  className="text-[var(--sys-primary)] relative z-10 transition-all duration-150"
                />
              ) : selectedIcon.phosphorIcon ? (
                <selectedIcon.phosphorIcon
                  size={size}
                  weight={effectivePhosphorWeight}
                  className="text-[var(--sys-primary)] relative z-10 transition-all duration-150"
                />
              ) : null}

              <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between font-mono text-[10px] text-[var(--sys-on-surface-tertiary)]">
                <span className="truncate pr-2">{selectedIcon.name}</span>
                <span className="tabular-nums shrink-0">
                  {size}×{size}px • {weight}
                  {filled ? " • fill" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Weight Matrix */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-[var(--sys-on-surface-secondary)]">
              Stroke Weight
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(["thin", "light", "regular", "bold"] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={cn(
                    "py-2 px-2 rounded-lg text-xs font-mono capitalize border transition-all cursor-pointer",
                    weight === w
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] border-[var(--sys-primary)] font-semibold"
                      : "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] border-[var(--sys-outline-variant)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Independent Fill Toggle */}
          <div className="p-3 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[var(--sys-on-surface)]">Fill</div>
              <div className="text-[11px] text-[var(--sys-on-surface-tertiary)]">
                {filled ? "Filled glyph (keeps weight)" : "Outlined glyph"}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={filled}
              aria-label="Toggle icon fill"
              onClick={() => setFilled((prev) => !prev)}
              className={cn(
                "w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors cursor-pointer",
                filled ? "bg-[var(--sys-primary)]" : "bg-[var(--sys-surface-highest)]"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-white shadow transition-transform",
                  filled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Optical Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--sys-on-surface-secondary)]">Icon Size</span>
              <span className="font-mono font-bold text-[var(--sys-primary)] tabular-nums">
                {size}px
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={112}
              step={4}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="precision-slider"
            />
          </div>

          {/* Export Buttons (Open Access — v3.0) */}
          <div className="space-y-2 pt-2 border-t border-[var(--sys-outline-variant)]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopy("jsx", exports.code, "React JSX")}
                className="min-h-[40px] py-2 px-3 rounded-xl bg-[var(--sys-primary)] hover:opacity-95 text-[var(--sys-on-primary)] flex items-center justify-center gap-1.5 text-xs font-mono font-semibold transition-opacity cursor-pointer"
              >
                {copiedType === "jsx" ? (
                  <>
                    <Icons.Check size={14} weight="bold" />
                    <span>Copied JSX</span>
                  </>
                ) : (
                  <>
                    <Icons.Copy size={14} />
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
                    <Icons.Check size={14} className="text-emerald-400" weight="bold" />
                    <span>Copied {selectedIcon.source === "material" ? "HTML" : "SVG"}</span>
                  </>
                ) : (
                  <>
                    <Icons.Code size={14} className="text-[var(--sys-on-surface-tertiary)]" />
                    <span>{selectedIcon.source === "material" ? "Copy HTML" : "Copy SVG"}</span>
                  </>
                )}
              </button>
            </div>
            <div className="px-3 py-2 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] truncate">
              {exports.code.replace(/\n\s*/g, " ")}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Searchable Database Glyph Browser */}
        <div className="lg:col-span-8 tonal-card p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--sys-outline-variant)] pb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--sys-on-surface)] flex items-center gap-2">
                <span>Browse Icons</span>
                <span className="text-[11px] font-mono font-normal text-[var(--sys-primary)]">
                  ({ALL_ICONS.length.toLocaleString()} symbols connected)
                </span>
              </h3>
              <p className="text-xs text-[var(--sys-on-surface-tertiary)]">
                Click any symbol to preview on the keyline grid and copy clean code.
              </p>
            </div>

            {/* Filter by Database Set */}
            <SlidingTabList
              activeKey={activeSet}
              ariaLabel="Icon Library Filter"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-xs font-medium"
              indicatorClassName="rounded-lg bg-[var(--sys-primary)] shadow-xs"
            >
              {(
                [
                  { id: "all", label: "All Icons" },
                  { id: "material", label: "Material Design" },
                  { id: "phosphor", label: "Phosphor" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSet === tab.id}
                  onClick={() => setActiveSet(tab.id)}
                  className={cn(
                    "relative z-10 px-2.5 py-1 rounded-lg transition-colors duration-200 cursor-pointer text-xs whitespace-nowrap",
                    activeSet === tab.id
                      ? "text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-tertiary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </SlidingTabList>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Icons.MagnifyingGlass
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-tertiary)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Material Design or Phosphor icons (e.g. volume, settings, battery, mic)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] focus:border-[var(--sys-primary)] text-xs text-[var(--sys-on-surface)] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-tertiary)] hover:text-[var(--sys-on-surface)] cursor-pointer"
                aria-label="Clear search"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] mr-1">
              Category:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                    active
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] border-[var(--sys-primary)] font-semibold shadow-xs"
                      : "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] border-[var(--sys-outline-variant)] hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 min-h-[320px] content-start">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((item) => {
                const active = selectedIcon.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIcon(item)}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[76px]",
                      active
                        ? "bg-[var(--sys-primary-container)] text-[var(--sys-on-primary-container)] border-[var(--sys-primary)] shadow-xs"
                        : "bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface-secondary)] border-[var(--sys-outline-variant)] hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
                    )}
                    title={`${item.name} (${item.source === "material" ? "Material Design" : "Phosphor"})`}
                  >
                    {item.source === "material" ? (
                      <span
                        className="material-symbols-outlined text-[22px] select-none"
                        style={{
                          fontVariationSettings: `'FILL' ${
                            active && filled ? 1 : 0
                          }, 'wght' ${materialWeightNumeric}, 'opsz' 24`,
                        }}
                      >
                        {item.materialName}
                      </span>
                    ) : item.customIcon ? (
                      <item.customIcon size={22} />
                    ) : item.phosphorIcon ? (
                      <item.phosphorIcon size={22} weight={active ? effectivePhosphorWeight : "regular"} />
                    ) : null}
                    <span className="font-mono text-[9px] truncate w-full text-center opacity-75">
                      {item.name}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-xs text-[var(--sys-on-surface-tertiary)] space-y-1">
                <div>No icons matching &ldquo;{searchQuery}&rdquo;</div>
                <div className="text-[11px]">
                  Try searching for keywords like <code className="font-mono text-[var(--sys-primary)]">volume</code>,{" "}
                  <code className="font-mono text-[var(--sys-primary)]">sound</code>,{" "}
                  <code className="font-mono text-[var(--sys-primary)]">phone</code>, or{" "}
                  <code className="font-mono text-[var(--sys-primary)]">settings</code>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
