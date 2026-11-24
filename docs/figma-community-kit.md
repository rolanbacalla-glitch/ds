# Antigravity v3.0 — Figma Community Variable Kit Guide

This guide explains how to import the Antigravity v3.0 perceptual OKLCH token bundle into **Figma Variables** (or **Tokens Studio**) with 1:1 parity against production code.

## 1. Export the Canonical W3C DTCG Bundle
Run the token compiler locally or download `figma-variables.tokens.json` directly from the open-access **Export & Handoff** workbench:

```bash
npm run build:tokens
```

This generates `exports/figma-variables.tokens.json` containing four structured collections:
- `01-Primitives` (`--ref-palette-*` raw 13-step OKLCH + sRGB hex anchors)
- `02-Semantic-Light` (`--sys-color-*` Alabaster Light mode)
- `02-Semantic-Dark` (`--sys-color-*` Obsidian Dark mode)
- `03-Components` (`--comp-*` component-scoped overrides)

## 2. Import into Figma Variables
1. Open your Figma library file and launch **Tokens Studio for Figma** (or Figma's native **Variables Import** plugin).
2. Select **Import → W3C DTCG JSON** and choose `exports/figma-variables.tokens.json`.
3. Map `02-Semantic-Light` and `02-Semantic-Dark` as dual modes (`Light` / `Dark`) on the `Semantic` variable collection.
4. Bind all page frames and cards to solid tonal surfaces (`surface-lowest` through `surface-highest`), reserving `24px` background blur strictly for floating chrome (`Z-Level 2`).

## 3. Contrast & Governance Parity
Every token pair in the kit is verified by `npm run verify:wcag` against WCAG 2.2 AA/AAA (`>= 7.0:1` primary/secondary ink, `>= 3.0:1` interactive borders and focus rings).
