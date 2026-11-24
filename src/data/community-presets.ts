export interface CommunityPreset {
  id: string;
  name: string;
  author: string;
  description: string;
  hue: number;
  chroma: number;
  neutralTint: number;
  radiusScale: number;
  tags: string[];
}

/**
 * Antigravity v3.0 Community Preset Gallery
 * Curated OKLCH perceptual theme seeds with locked lightness curves (WCAG 2.2 AAA safe).
 */
export const COMMUNITY_PRESETS: readonly CommunityPreset[] = [
  {
    id: "antigravity-cobalt",
    name: "Antigravity Cobalt",
    author: "Antigravity Core",
    description: "Signature precision cobalt with ultra-clean neutral slate tinting.",
    hue: 258,
    chroma: 0.16,
    neutralTint: 0.012,
    radiusScale: 1.0,
    tags: ["default", "enterprise", "swiss"],
  },
  {
    id: "kyoto-matcha",
    name: "Kyoto Matcha",
    author: "Community",
    description: "Calm botanical sage-green primary paired with warm paper-tinted neutrals.",
    hue: 152,
    chroma: 0.13,
    neutralTint: 0.01,
    radiusScale: 1.15,
    tags: ["editorial", "calm", "organic"],
  },
  {
    id: "terracotta-press",
    name: "Terracotta Press",
    author: "Community",
    description: "High-craft editorial terracotta designed for Newsreader display headlines.",
    hue: 34,
    chroma: 0.15,
    neutralTint: 0.014,
    radiusScale: 0.85,
    tags: ["editorial", "warm", "publishing"],
  },
  {
    id: "nordic-fjord",
    name: "Nordic Fjord",
    author: "Community",
    description: "Crisp arctic cyan-teal accent with cool technical grey surfaces.",
    hue: 215,
    chroma: 0.14,
    neutralTint: 0.011,
    radiusScale: 1.0,
    tags: ["minimal", "technical", "fintech"],
  },
  {
    id: "amethyst-studio",
    name: "Amethyst Studio",
    author: "Community",
    description: "Expressive violet-indigo accent engineered for creative tooling and dark mode.",
    hue: 292,
    chroma: 0.17,
    neutralTint: 0.013,
    radiusScale: 1.25,
    tags: ["creative", "expressive", "dark-first"],
  },
] as const;
