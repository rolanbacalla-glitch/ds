#!/usr/bin/env node
/**
 * Antigravity Design System — Multi-Platform 3-Tier Token Compiler
 * Compiles /tokens/*.json (W3C DTCG format) into:
 *   1. src/styles/tokens.generated.css       (CSS Custom Properties + Tailwind v4 @theme inline)
 *   2. src/lib/tokens.generated.ts           (Strongly-typed TS token lineage & WCAG metadata)
 *   3. exports/figma-variables.tokens.json        (Protected Figma Variables / Tokens Studio bundle)
 *   4. DESIGN.md                             (Google Stitch semantic design system spec)
 *   5. .cursor/rules/design-system.mdc       (Cursor & Antigravity AI coding guardrails)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const readJson = (relPath) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));

const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const primitives = readJson("tokens/primitives.json");
const semanticLight = readJson("tokens/semantic.light.json");
const semanticDark = readJson("tokens/semantic.dark.json");
const components = readJson("tokens/components.json");

/**
 * Resolve a dot-path like "{color.primary.40}" against primitives
 */
function resolvePrimitiveNode(refString) {
  if (typeof refString !== "string" || !refString.startsWith("{") || !refString.endsWith("}")) {
    return { $value: refString, oklch: refString };
  }
  const parts = refString.slice(1, -1).split(".");
  let current = primitives;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      throw new Error(`Unresolved Tier-1 token reference: ${refString}`);
    }
  }
  return current;
}

/**
 * Compute WCAG 2.2 relative luminance from sRGB Hex (#RRGGBB)
 */
function hexToLuminance(hex) {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return 0;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function computeContrastRatio(hexA, hexB) {
  const lumA = hexToLuminance(hexA);
  const lumB = hexToLuminance(hexB);
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

// Map legacy semantic keys to unified v3.0 --sys-color-* namespace
const SYS_COLOR_MAP = {
  "bg-canvas": "--sys-color-surface-canvas",
  "bg-surface-recessed": "--sys-color-surface-lowest",
  "bg-surface-card": "--sys-color-surface-low",
  "bg-surface-elevated": "--sys-color-surface-container",
  "bg-surface-hover": "--sys-color-surface-high",
  "bg-action-primary": "--sys-color-action-primary",
  "bg-action-secondary": "--sys-color-action-secondary",
  "bg-feedback-error-subtle": "--sys-color-feedback-error-bg",
  "bg-feedback-success-subtle": "--sys-color-feedback-success-bg",
  "bg-feedback-warning-subtle": "--sys-color-feedback-warning-bg",
  "text-primary": "--sys-color-text-primary",
  "text-secondary": "--sys-color-text-secondary",
  "text-muted": "--sys-color-text-muted",
  "text-on-action": "--sys-color-text-on-action",
  "text-feedback-error": "--sys-color-feedback-error",
  "text-feedback-success": "--sys-color-feedback-success",
  "text-feedback-warning": "--sys-color-feedback-warning",
  "border-default": "--sys-color-border-default",
  "border-subtle": "--sys-color-border-subtle",
  "border-focus-ring": "--sys-color-border-focus",
  "border-feedback-error": "--sys-color-border-error",
};

// 1. Build Resolved Semantic Dictionary
const semanticKeys = Object.keys(semanticLight.semantic);
const lightCanvasHex = resolvePrimitiveNode(semanticLight.semantic["bg-canvas"].$value).$value;
const darkCanvasHex = resolvePrimitiveNode(semanticDark.semantic["bg-canvas"].$value).$value;

const resolvedSemantics = semanticKeys.map((key) => {
  const lightEntry = semanticLight.semantic[key];
  const darkEntry = semanticDark.semantic[key];
  const lightPrim = resolvePrimitiveNode(lightEntry.$value);
  const darkPrim = resolvePrimitiveNode(darkEntry.$value);

  const contrastLight = computeContrastRatio(lightPrim.$value, lightCanvasHex);
  const contrastDark = computeContrastRatio(darkPrim.$value, darkCanvasHex);

  return {
    name: key,
    cssVar: `--${key}`,
    sysColorVar: SYS_COLOR_MAP[key] || `--sys-color-${key}`,
    workbenchAlias: lightEntry.workbenchAlias || `--sys-${key}`,
    category: lightEntry.category || "general",
    description: lightEntry.$description || "",
    lightRef: lightEntry.$value,
    darkRef: darkEntry.$value,
    lightHex: lightPrim.$value,
    darkHex: darkPrim.$value,
    lightOklch: lightPrim.oklch || lightPrim.$value,
    darkOklch: darkPrim.oklch || darkPrim.$value,
    contrastVsLightCanvas: contrastLight,
    contrastVsDarkCanvas: contrastDark,
  };
});

// Collect Tier-1 --ref-palette-* CSS custom properties from primitives.json
const refPaletteCssLines = [];
if (primitives.color && typeof primitives.color === "object") {
  for (const [role, scale] of Object.entries(primitives.color)) {
    if (!scale || typeof scale !== "object") continue;
    for (const [step, node] of Object.entries(scale)) {
      if (node && typeof node === "object" && (node.oklch || node.$value)) {
        refPaletteCssLines.push(
          `  --ref-palette-${role}-${step}: ${node.oklch || node.$value}; /* ${node.$value || ""} */`
        );
      }
    }
  }
}

// 2. Build Resolved Component Token Dictionary
const resolvedComponents = [];
for (const [compName, tokenMap] of Object.entries(components.component)) {
  for (const [propName, tokenDef] of Object.entries(tokenMap)) {
    const rawRef = tokenDef.$value;
    let tier2Name = null;
    let lightVal = rawRef;
    let darkVal = rawRef;
    let tier1LightRef = rawRef;
    let tier1DarkRef = rawRef;

    if (typeof rawRef === "string" && rawRef.startsWith("{semantic.")) {
      tier2Name = rawRef.slice("{semantic.".length, -1);
      const found = resolvedSemantics.find((s) => s.name === tier2Name);
      if (found) {
        lightVal = found.lightOklch;
        darkVal = found.darkOklch;
        tier1LightRef = found.lightRef;
        tier1DarkRef = found.darkRef;
      }
    } else if (typeof rawRef === "string" && rawRef.startsWith("{")) {
      const primNode = resolvePrimitiveNode(rawRef);
      lightVal = primNode.$value;
      darkVal = primNode.$value;
    }

    resolvedComponents.push({
      component: compName,
      property: propName,
      cssVar: `--comp-${compName}-${propName}`,
      type: tokenDef.$type,
      description: tokenDef.$description || "",
      tier2Ref: tier2Name ? `--${tier2Name}` : rawRef,
      tier1LightRef,
      tier1DarkRef,
      lightValue: lightVal,
      darkValue: darkVal,
    });
  }
}

// ============================================================================
// OUTPUT 1: src/styles/tokens.generated.css
// ============================================================================
const cssLines = [
  `/* ============================================================================`,
  ` * AUTO-GENERATED BY scripts/build-tokens.mjs (v3.0.0) — DO NOT EDIT MANUALLY`,
  ` * Source: /tokens/primitives.json, semantic.light.json, semantic.dark.json, components.json`,
  ` * ============================================================================ */`,
  ``,
  `:root,`,
  `[data-theme="light"] {`,
  `  /* Tier 1 Reference Tokens (--ref-palette-*) */`,
  ...refPaletteCssLines,
  ``,
  `  /* Tier 2 Unified Semantic Tokens (--sys-color-*) — Alabaster Light */`,
  ...resolvedSemantics.map(
    (s) => `  ${s.sysColorVar}: ${s.lightOklch}; /* ${s.lightHex} | ${s.lightRef} */`
  ),
  ``,
  `  /* Backwards-Compatible Legacy Aliases (deprecated — migrate to --sys-color-*) */`,
  ...resolvedSemantics.map((s) => `  ${s.cssVar}: var(${s.sysColorVar});`),
  ``,
  `  /* Spatial Rhythm, Breakpoints, Z-Index & Motion Tokens (v3.0) */`,
  `  --sys-space-1: 4px;`,
  `  --sys-space-2: 8px;`,
  `  --sys-space-3: 12px;`,
  `  --sys-space-4: 16px;`,
  `  --sys-space-6: 24px;`,
  `  --sys-space-8: 32px;`,
  `  --sys-space-12: 48px;`,
  `  --sys-space-16: 64px;`,
  `  --sys-space-24: 96px;`,
  `  --sys-breakpoint-sm: 640px;`,
  `  --sys-breakpoint-md: 768px;`,
  `  --sys-breakpoint-lg: 1024px;`,
  `  --sys-breakpoint-xl: 1280px;`,
  `  --sys-breakpoint-2xl: 1536px;`,
  `  --sys-z-base: 0;`,
  `  --sys-z-sticky: 100;`,
  `  --sys-z-overlay: 200;`,
  `  --sys-z-modal: 300;`,
  `  --sys-z-popover: 400;`,
  `  --sys-z-toast: 500;`,
  `  --ease-spatial-spring: cubic-bezier(0.34, 1.56, 0.64, 1);`,
  `  --ease-effects-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);`,
  `  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);`,
  ``,
  `  /* Tier 3 Component Overrides — Alabaster Light */`,
  ...resolvedComponents.map((c) => {
    if (c.tier2Ref.startsWith("--")) {
      return `  ${c.cssVar}: var(${c.tier2Ref});`;
    }
    return `  ${c.cssVar}: ${c.lightValue};`;
  }),
  `}`,
  ``,
  `.dark,`,
  `[data-theme="dark"] {`,
  `  /* Tier 2 Unified Semantic Tokens (--sys-color-*) — Obsidian Dark */`,
  ...resolvedSemantics.map(
    (s) => `  ${s.sysColorVar}: ${s.darkOklch}; /* ${s.darkHex} | ${s.darkRef} */`
  ),
  ``,
  `  /* Backwards-Compatible Legacy Aliases (deprecated — migrate to --sys-color-*) */`,
  ...resolvedSemantics.map((s) => `  ${s.cssVar}: var(${s.sysColorVar});`),
  ``,
  `  /* Tier 3 Component Overrides — Obsidian Dark */`,
  ...resolvedComponents.map((c) => {
    if (c.tier2Ref.startsWith("--")) {
      return `  ${c.cssVar}: var(${c.tier2Ref});`;
    }
    return `  ${c.cssVar}: ${c.darkValue};`;
  }),
  `}`,
  ``,
  `@theme inline {`,
  ...resolvedSemantics.map((s) => `  --color-${s.name}: var(${s.sysColorVar});`),
  `}`,
  ``,
];

const cssOutPath = path.join(ROOT, "src/styles/tokens.generated.css");
ensureDir(cssOutPath);
fs.writeFileSync(cssOutPath, cssLines.join("\n"), "utf8");

// ============================================================================
// OUTPUT 2: src/lib/tokens.generated.ts
// ============================================================================
const tsContent = `/* ============================================================================
 * AUTO-GENERATED BY scripts/build-tokens.mjs — DO NOT EDIT MANUALLY
 * Strongly-typed 3-Tier Design Token Dictionary & Lineage Metadata
 * ============================================================================ */

export interface CompiledSemanticToken {
  name: string;
  cssVar: string;
  sysColorVar: string;
  workbenchAlias: string;
  category: "surface" | "action" | "text" | "feedback" | "border" | "general";
  description: string;
  lightRef: string;
  darkRef: string;
  lightHex: string;
  darkHex: string;
  lightOklch: string;
  darkOklch: string;
  contrastVsLightCanvas: number;
  contrastVsDarkCanvas: number;
}

export interface CompiledComponentToken {
  component: string;
  property: string;
  cssVar: string;
  type: string;
  description: string;
  tier2Ref: string;
  tier1LightRef: string;
  tier1DarkRef: string;
  lightValue: string;
  darkValue: string;
}

export const COMPILED_SEMANTIC_TOKENS: readonly CompiledSemanticToken[] = ${JSON.stringify(
  resolvedSemantics,
  null,
  2
)} as const;

export const COMPILED_COMPONENT_TOKENS: readonly CompiledComponentToken[] = ${JSON.stringify(
  resolvedComponents,
  null,
  2
)} as const;

export const TOKEN_BUILD_METADATA = {
  version: "3.0.0",
  schema: "https://tr.designtokens.org/format/",
  tier1Count: ${refPaletteCssLines.length},
  tier2Count: ${resolvedSemantics.length},
  tier3Count: ${resolvedComponents.length},
  wcagTarget: "WCAG 2.2 AA / AAA",
} as const;
`;

const tsOutPath = path.join(ROOT, "src/lib/tokens.generated.ts");
ensureDir(tsOutPath);
fs.writeFileSync(tsOutPath, tsContent, "utf8");

// ============================================================================
// OUTPUT 3: public/exports/figma-variables.tokens.json
// ============================================================================
const figmaBundle = {
  $schema: "https://tr.designtokens.org/format/",
  meta: {
    system: "Antigravity Perceptual & Spatial Design System",
    version: "2.4.0",
    exportedBy: "scripts/build-tokens.mjs",
    platforms: ["Figma Variables", "Tokens Studio", "Next.js 16 + Tailwind v4", "Google Stitch"],
  },
  collections: {
    "01-Primitives": primitives,
    "02-Semantic-Light": semanticLight.semantic,
    "02-Semantic-Dark": semanticDark.semantic,
    "03-Components": components.component,
  },
};

const figmaOutPath = path.join(ROOT, "exports/figma-variables.tokens.json");
ensureDir(figmaOutPath);
fs.writeFileSync(figmaOutPath, JSON.stringify(figmaBundle, null, 2), "utf8");

// ============================================================================
// OUTPUT 4: DESIGN.md (Antigravity Design System v3.0 Architectural & Agent Spec)
// ============================================================================
const designMdContent = `# DESIGN.md — Antigravity Design System v3.0 Architectural & Agent Specification

**System Version:** 3.0.0 ("Open Ecosystem & Production Release")  
**Target Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript  
**Purpose:** Canonical design system rules, perceptual OKLCH token taxonomy, spatial surface laws, and AI agent guardrails for Google Antigravity IDE and compatible coding agents.

---

## 1. Agent Operational Directives (Strict Guardrails)

When generating, refactoring, or auditing code within the Antigravity repository (\`design.rolanbacalla.online\` or downstream \`antigravity-ui\` consumer apps), you **MUST** obey these invariants:

1. **Zero Hardcoded Colours:** Never output hex (\`#ffffff\`), \`rgb()\`, or \`hsl()\` literals in components or stylesheets. Always reference semantic \`--sys-*\` or component \`--comp-*\` CSS variables backed by OKLCH values.
2. **Strict 3-Tier W3C DTCG Token Hierarchy:**
   - **Tier 1 (\`--ref-*\`):** Raw perceptual palette values (e.g., \`--ref-palette-primary-40\`). Never reference \`--ref-*\` directly inside UI components.
   - **Tier 2 (\`--sys-*\`):** Role-based semantic tokens that switch across Light and Dark polarity (e.g., \`--sys-color-surface-canvas\`, \`--sys-color-text-primary\`, \`--sys-color-action-primary\`).
   - **Tier 3 (\`--comp-*\`):** Component-scoped overrides (e.g., \`--comp-button-primary-bg\`, \`--comp-card-surface-bg\`).
3. **Eliminate Legacy Token Names:** Prefer the unified \`--sys-color-*\` namespace over deprecated \`--text-primary\`, \`--bg-canvas\`, or \`--bg-action-primary\` aliases.
4. **Enforce Solid vs. Glass Material Boundaries:**
   - **Page Content, Cards & Data Tables:** Must sit on solid 5-step tonal surfaces (\`--sys-color-surface-lowest\` through \`--sys-color-surface-highest\`) with zero backdrop blur.
   - **Floating Overlays (Top Navbars, Modals, Popovers, Context Menus):** Exclusively use \`.liquid-glass-regular\` (\`24px\` blur, \`190%\` saturation).
   - **Anti-Pattern:** Never stack frosted glass on top of frosted glass ("glass-on-glass").
5. **Tabular Numerals Everywhere:** Any dynamic numeric readout (contrast ratios, hex/OKLCH coordinates, timers, counters, prices, table figures) must apply \`font-variant-numeric: tabular-nums\` (\`tabular-nums\` in Tailwind v4) using \`IBM Plex Mono\`.
6. **WCAG 2.2 AAA & Reduced Motion Compliance:**
   - Primary and secondary body text must maintain \`>= 7.0:1\` contrast (\`AAA\`). Interactive borders and focus rings (\`--sys-color-border-focus\`) must maintain \`>= 3.0:1\` (\`SC 1.4.11\` / \`SC 2.4.11\`).
   - Every transition must respect \`@media (prefers-reduced-motion: reduce)\` by collapsing spring/slide animations into instant opacity fades (\`<= 50ms\`).

---

## 2. Perceptual Colour Engine (OKLCH 13-Step Scale)

Antigravity generates 13 perceptual tones (\`0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100\`) where **Lightness (\`L\`) is locked per column** regardless of Hue (\`H\`) or Chroma (\`C\`). Swapping brand hues never alters perceived brightness or breaks WCAG contrast ratios.

---

## 3. Optical 2+1 Typography System

1. **Interface & Body Sans (\`--font-sans\`):** \`Manrope\` (weights \`400–800\`).
2. **Editorial Display Serif (\`--font-serif\`):** \`Newsreader Variable\` (\`opsz 6..72\`).
3. **Data & Token Monospace (\`--font-mono\`):** \`IBM Plex Mono\` (weights \`400–600\`, \`tabular-nums\`).

---

## 4. Spatial Rhythm, Geometry & Elevation

- **Concentric Nested Corner Formula:** \`--sys-radius-outer: calc(var(--sys-radius-inner) + var(--sys-space-padding));\`
- **Spacing Scale (\`4px\` base grid):** \`--sys-space-1\` (\`4px\`) through \`--sys-space-24\` (\`96px\`).
- **Breakpoints:** \`--sys-breakpoint-sm\` (\`640px\`) through \`--sys-breakpoint-2xl\` (\`1536px\`).
- **Elevation Z-Index Tiers:** \`--sys-z-base: 0\`, \`--sys-z-sticky: 100\`, \`--sys-z-overlay: 200\`, \`--sys-z-modal: 300\`, \`--sys-z-popover: 400\`, \`--sys-z-toast: 500\`.

---

## 5. Motion Physics Tokens

- \`--ease-spatial-spring\`: \`cubic-bezier(0.34, 1.56, 0.64, 1)\` (\`220ms\`)
- \`--ease-effects-smooth\`: \`cubic-bezier(0.25, 0.1, 0.25, 1)\` (\`180ms\`)
- \`--ease-out-quart\`: \`cubic-bezier(0.25, 1, 0.5, 1)\` (\`260ms\`)
`;

fs.writeFileSync(path.join(ROOT, "DESIGN.md"), designMdContent, "utf8");

// ============================================================================
// OUTPUT 5: .cursor/rules/design-system.mdc
// ============================================================================
const cursorRulesContent = `---
description: Antigravity Design System (v2.4) — Token, Accessibility & Z-Axis Architecture Guardrails
globs: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css", "tokens/**/*.json"]
alwaysApply: true
---

# Antigravity Design System Rules (Cursor & Google Antigravity)

1. **Framework & Routing**:
   - Next.js 16.2+ App Router (\`src/app\`). Dynamic route \`params\` and \`searchParams\` are \`Promise\` objects and MUST be \`await\`ed.
   - Tailwind CSS v4 (\`@import "tailwindcss";\`, \`@theme\`). Do NOT create a legacy \`tailwind.config.ts\`.

2. **3-Tier Token Mandate (Zero Raw Hex Values)**:
   - Never hardcode hex/RGB colors in components. Bind strictly to Tier-2 Semantic Tokens (\`var(--bg-action-primary)\`, \`var(--sys-primary)\`, \`var(--text-primary)\`, \`var(--text-feedback-error)\`, \`var(--border-focus-ring)\`) or Tier-3 Component Tokens (\`var(--comp-form-field-*)\`).
   - Run \`npm run build:tokens\` whenever editing \`/tokens/*.json\`.

3. **Z-Axis Spatial Discipline**:
   - **Z-Level 0 (Canvas)**: \`var(--sys-surface-canvas)\` / \`var(--bg-canvas)\`.
   - **Z-Level 1 (Content Cards)**: Use \`.tonal-card\` or \`.tonal-card-elevated\`. NEVER apply \`backdrop-filter: blur()\` on Z-Level 1 content grids or data tables.
   - **Z-Level 2 (Floating Chrome)**: Use \`.liquid-glass-regular\` or \`.liquid-glass-clear\` strictly on sticky navbars, command bars, modals, and transient popovers.

4. **WCAG 2.2 AA Accessibility Engineering**:
   - All text must achieve >= 4.5:1 contrast. Never use opacity utilities below \`/60\` for readable text; use \`var(--text-secondary)\` or \`var(--text-muted)\`.
   - Interactive controls must have a minimum \`24x24px\` hit target (\`40px\` height standard) per WCAG 2.2 SC 2.5.8.
   - Focus-visible rings must use \`2px solid var(--border-focus-ring)\` with \`2px\` offset per SC 2.4.11.
   - Use focus trapping ONLY inside modal overlays (\`role="dialog" aria-modal="true"\`); never trap keyboard focus inside form inputs or data tables.

5. **British English (\`en-GB\`) Copy Standard**:
   - Always use British English spelling across all UI copy, labels, headings, and documentation (e.g., *colour*, *customise*, *customiser*, *synchronise*, *optimise*, *analyse*, *behaviour*, *centre*, *dialogue*, *grey*).
`;

const cursorOutPath = path.join(ROOT, ".cursor/rules/design-system.mdc");
ensureDir(cursorOutPath);
fs.writeFileSync(cursorOutPath, cursorRulesContent, "utf8");

console.log(
  `[build-tokens] Successfully compiled ${resolvedSemantics.length} Tier-2 semantic tokens & ${resolvedComponents.length} Tier-3 component tokens across 5 platform targets.`
);
