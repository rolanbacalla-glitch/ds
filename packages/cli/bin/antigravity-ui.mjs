#!/usr/bin/env node
/**
 * Antigravity Design System v3.0 CLI (`npx antigravity-ui`)
 * Commands:
 *   antigravity-ui init               Installs tokens.generated.css and lib/utils.ts
 *   antigravity-ui add <component>    Copies an accessible component into components/ui/
 *   antigravity-ui list               Lists all available v3.0 registry components
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, "..");
const WORKSPACE_ROOT = path.resolve(CLI_ROOT, "../..");
const registry = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, "registry.json"), "utf8"));

const [, , command, arg] = process.argv;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

if (command === "list") {
  console.log(`\nAntigravity Design System v${registry.version} — Available Components:\n`);
  for (const [name, meta] of Object.entries(registry.components)) {
    console.log(`  ${name.padEnd(18)} ${meta.description}`);
  }
  console.log("");
  process.exit(0);
}

if (command === "init") {
  const cwd = process.cwd();
  const stylesDir = path.join(cwd, "src/styles");
  const libDir = path.join(cwd, "src/lib");
  ensureDir(stylesDir);
  ensureDir(libDir);

  const tokensSrc = path.join(WORKSPACE_ROOT, "src/styles/tokens.generated.css");
  const utilsSrc = path.join(WORKSPACE_ROOT, "packages/ui/src/utils.ts");

  if (fs.existsSync(tokensSrc)) {
    fs.copyFileSync(tokensSrc, path.join(stylesDir, "tokens.generated.css"));
    console.log("✔ Installed src/styles/tokens.generated.css");
  }
  if (fs.existsSync(utilsSrc)) {
    fs.copyFileSync(utilsSrc, path.join(libDir, "utils.ts"));
    console.log("✔ Installed src/lib/utils.ts");
  }
  console.log("\nAntigravity v3.0 initialised. Import './styles/tokens.generated.css' in your root layout.");
  process.exit(0);
}

if (command === "add") {
  if (!arg || !registry.components[arg]) {
    console.error(`Unknown component: "${arg ?? ""}". Run "antigravity-ui list" to see available components.`);
    process.exit(1);
  }
  const meta = registry.components[arg];
  const srcFile = path.join(WORKSPACE_ROOT, "packages/ui/src", meta.file);
  const targetDir = path.join(process.cwd(), "src/components/ui");
  ensureDir(targetDir);
  const destFile = path.join(targetDir, meta.file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`✔ Added ${arg} -> src/components/ui/${meta.file}`);
  process.exit(0);
}

console.log(`
Antigravity Design System CLI (v${registry.version})

Usage:
  npx antigravity-ui init               Install OKLCH token stylesheet & utilities
  npx antigravity-ui add <component>    Add an accessible component to src/components/ui
  npx antigravity-ui list               List all available components
`);
