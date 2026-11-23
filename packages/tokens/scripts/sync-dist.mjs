import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(pkgRoot, "../..");
const distDir = path.join(pkgRoot, "dist");
const rawDir = path.join(distDir, "raw");

fs.mkdirSync(rawDir, { recursive: true });

// 1. Copy compiled CSS tokens
fs.copyFileSync(
  path.join(repoRoot, "src/styles/tokens.generated.css"),
  path.join(distDir, "tokens.css")
);

// 2. Copy Figma W3C DTCG bundle
fs.copyFileSync(
  path.join(repoRoot, "exports/figma-variables.tokens.json"),
  path.join(distDir, "figma-variables.tokens.json")
);

// 3. Copy raw 3-tier DTCG JSON sources
for (const file of [
  "primitives.json",
  "semantic.light.json",
  "semantic.dark.json",
  "components.json",
]) {
  fs.copyFileSync(path.join(repoRoot, "tokens", file), path.join(rawDir, file));
}

// 4. Emit lightweight ESM + TypeScript entrypoints
const rawPrimitives = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "tokens/primitives.json"), "utf8")
);
const rawLight = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "tokens/semantic.light.json"), "utf8")
);
const rawDark = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "tokens/semantic.dark.json"), "utf8")
);
const rawComponents = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "tokens/components.json"), "utf8")
);

fs.writeFileSync(
  path.join(distDir, "tokens.js"),
  `export const primitives = ${JSON.stringify(rawPrimitives, null, 2)};\n` +
    `export const semanticLight = ${JSON.stringify(rawLight, null, 2)};\n` +
    `export const semanticDark = ${JSON.stringify(rawDark, null, 2)};\n` +
    `export const components = ${JSON.stringify(rawComponents, null, 2)};\n`
);

fs.writeFileSync(
  path.join(distDir, "tokens.d.ts"),
  `export declare const primitives: Record<string, unknown>;\n` +
    `export declare const semanticLight: Record<string, unknown>;\n` +
    `export declare const semanticDark: Record<string, unknown>;\n` +
    `export declare const components: Record<string, unknown>;\n`
);

console.log("[antigravity/tokens] Built dist/ artefacts successfully.");
