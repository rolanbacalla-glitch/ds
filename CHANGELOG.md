# Changelog

All notable changes to the **Antigravity Design System** are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [3.0.0] — "Open Ecosystem & Production Release"

### Added
- **Open-Access Exports (Phase 1):** Unlocked Tailwind v4 CSS (`tokens.generated.css`), W3C DTCG JSON (`figma-variables.tokens.json`), `DESIGN.md`, `.cursor/rules/design-system.mdc`, icon SVG/JSX copy actions, and component portal source code without requiring sign-in.
- **Unified 3-Tier W3C DTCG Token Taxonomy (Phase 1):** Emitted `--ref-palette-*`, `--sys-color-*`, and `--comp-*` custom properties with backwards-compatible legacy aliases, plus Spatial Rhythm (`--sys-space-1..24`), Breakpoints (`--sys-breakpoint-sm..2xl`), Z-Index (`--sys-z-base..toast`), and Motion (`--ease-spatial-spring`, `--ease-effects-smooth`, `--ease-out-quart`) tokens.
- **`antigravity-ui` CLI Package (Phase 2):** Added `packages/cli` (`npx antigravity-ui init`, `add <component>`, `list`) with a 13-component registry.
- **Complete v3.0 Component Primitives Suite (Phases 2–3):** Added `CommandPalette`, `DropdownMenu`, `ToastStack`, `Drawer`, `Accordion`, `Skeleton`, `ProgressBar`, `Avatar`, `AvatarGroup`, `Pagination`, and `Breadcrumbs` to `@antigravity/ui` with full WAI-ARIA roles, `40px` touch targets, tabular numerals, and `prefers-reduced-motion` safety.
- **Community Ecosystem (Phase 4):** Added curated OKLCH community theme presets (`src/data/community-presets.ts`) and the Figma Community Variable Kit guide (`docs/figma-community-kit.md`).

### Fixed
- **Live DOM & Browser Audit Auto-Run:** Automatically executes accessibility and browser capability checks on mount and debounced (`150ms`) on theme/slider mutations so the panel never stalls at `0/6 Passed`.
- **Icon Library Deduplication:** Deduplicated combined Material Design + Phosphor icons by canonical `${source}:${name}` ID prior to rendering.

## [2.4.0]
- Established perceptual 13-step OKLCH colour engine, 2+1 typography stack (`Manrope`, `Newsreader Variable`, `IBM Plex Mono`), Z-axis tonal vs. Liquid Glass rules, and automated WCAG 2.2 AA verification.
