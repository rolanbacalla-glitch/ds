# DESIGN.md — Antigravity Design System v3.0 Architectural & Agent Specification

**System Version:** 3.0.0 ("Open Ecosystem & Production Release")  
**Target Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript  
**Purpose:** Canonical design system rules, perceptual OKLCH token taxonomy, spatial surface laws, and AI agent guardrails for Google Antigravity IDE and compatible coding agents.

---

## 1. Agent Operational Directives (Strict Guardrails)

When generating, refactoring, or auditing code within the Antigravity repository (`design.rolanbacalla.online` or downstream `antigravity-ui` consumer apps), you **MUST** obey these invariants:

1. **Zero Hardcoded Colours:** Never output hex (`#ffffff`), `rgb()`, or `hsl()` literals in components or stylesheets. Always reference semantic `--sys-*` or component `--comp-*` CSS variables backed by OKLCH values.
2. **Strict 3-Tier W3C DTCG Token Hierarchy:**
   - **Tier 1 (`--ref-*`):** Raw perceptual palette values (e.g., `--ref-palette-primary-40`). Never reference `--ref-*` directly inside UI components.
   - **Tier 2 (`--sys-*`):** Role-based semantic tokens that switch across Light and Dark polarity (e.g., `--sys-color-surface-canvas`, `--sys-color-text-primary`, `--sys-color-action-primary`).
   - **Tier 3 (`--comp-*`):** Component-scoped overrides (e.g., `--comp-button-primary-bg`, `--comp-card-surface-bg`).
3. **Eliminate Legacy Token Names:** Prefer the unified `--sys-color-*` namespace over deprecated `--text-primary`, `--bg-canvas`, or `--bg-action-primary` aliases.
4. **Enforce Solid vs. Glass Material Boundaries:**
   - **Page Content, Cards & Data Tables:** Must sit on solid 5-step tonal surfaces (`--sys-color-surface-lowest` through `--sys-color-surface-highest`) with zero backdrop blur.
   - **Floating Overlays (Top Navbars, Modals, Popovers, Context Menus):** Exclusively use `.liquid-glass-regular` (`24px` blur, `190%` saturation).
   - **Anti-Pattern:** Never stack frosted glass on top of frosted glass ("glass-on-glass").
5. **Tabular Numerals Everywhere:** Any dynamic numeric readout (contrast ratios, hex/OKLCH coordinates, timers, counters, prices, table figures) must apply `font-variant-numeric: tabular-nums` (`tabular-nums` in Tailwind v4) using `IBM Plex Mono`.
6. **WCAG 2.2 AAA & Reduced Motion Compliance:**
   - Primary and secondary body text must maintain `>= 7.0:1` contrast (`AAA`). Interactive borders and focus rings (`--sys-color-border-focus`) must maintain `>= 3.0:1` (`SC 1.4.11` / `SC 2.4.11`).
   - Every transition must respect `@media (prefers-reduced-motion: reduce)` by collapsing spring/slide animations into instant opacity fades (`<= 50ms`).

---

## 2. Perceptual Colour Engine (OKLCH 13-Step Scale)

Antigravity generates 13 perceptual tones (`0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100`) where **Lightness (`L`) is locked per column** regardless of Hue (`H`) or Chroma (`C`). Swapping brand hues never alters perceived brightness or breaks WCAG contrast ratios.

---

## 3. Optical 2+1 Typography System

1. **Interface & Body Sans (`--font-sans`):** `Manrope` (weights `400–800`).
2. **Editorial Display Serif (`--font-serif`):** `Newsreader Variable` (`opsz 6..72`).
3. **Data & Token Monospace (`--font-mono`):** `IBM Plex Mono` (weights `400–600`, `tabular-nums`).

---

## 4. Spatial Rhythm, Geometry & Elevation

- **Concentric Nested Corner Formula:** `--sys-radius-outer: calc(var(--sys-radius-inner) + var(--sys-space-padding));`
- **Spacing Scale (`4px` base grid):** `--sys-space-1` (`4px`) through `--sys-space-24` (`96px`).
- **Breakpoints:** `--sys-breakpoint-sm` (`640px`) through `--sys-breakpoint-2xl` (`1536px`).
- **Elevation Z-Index Tiers:** `--sys-z-base: 0`, `--sys-z-sticky: 100`, `--sys-z-overlay: 200`, `--sys-z-modal: 300`, `--sys-z-popover: 400`, `--sys-z-toast: 500`.

---

## 5. Motion Physics Tokens

- `--ease-spatial-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (`220ms`)
- `--ease-effects-smooth`: `cubic-bezier(0.25, 0.1, 0.25, 1)` (`180ms`)
- `--ease-out-quart`: `cubic-bezier(0.25, 1, 0.5, 1)` (`260ms`)
