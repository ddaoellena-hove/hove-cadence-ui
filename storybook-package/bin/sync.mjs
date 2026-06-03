#!/usr/bin/env node
/**
 * Sync source files from the main package into this storybook package.
 * Run before publishing: node bin/sync.mjs
 */

import { cpSync, rmSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(__dirname, "..");
const root = resolve(pkg, "..");

const copies = [
  { from: "src",             to: "src"             },
  { from: ".storybook",      to: ".storybook"      },
  { from: "tsconfig.json",   to: "tsconfig.json"   },
  { from: "tsconfig.app.json", to: "tsconfig.app.json" },
  { from: "vite.config.ts",  to: "vite.config.ts"  },
  { from: "story-ui.config.js", to: "story-ui.config.js" },
];

for (const { from, to } of copies) {
  const src = resolve(root, from);
  const dest = resolve(pkg, to);
  if (!existsSync(src)) {
    console.warn(`⚠  Skipping ${from} (not found)`);
    continue;
  }
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  console.log(`✓  ${from} → ${to}`);
}

console.log("\n✅  Sync complete.");
