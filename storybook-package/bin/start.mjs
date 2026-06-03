#!/usr/bin/env node
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const port = process.env.PORT || 6006;

// ── Vérification que les sources sont présentes ────────────────────────────────
if (!existsSync(resolve(root, "src"))) {
  console.error(
    "\n❌  Sources manquantes. Lance d'abord :\n\n  node bin/sync.mjs\n"
  );
  process.exit(1);
}

// ── Affichage de la config MCP ─────────────────────────────────────────────────
console.log(`
┌─────────────────────────────────────────────────────────┐
│           Hove Cadence UI — Design System MCP           │
└─────────────────────────────────────────────────────────┘

 Storybook démarre sur http://localhost:${port}
 Serveur MCP disponible sur http://localhost:${port}/mcp

 ─────────────────────────────────────────────────────────
 Pour utiliser avec Claude Code, ajoute ce fichier
 .mcp.json à la racine de ton projet :

 {
   "mcpServers": {
     "hove-cadence-ui": {
       "url": "http://localhost:${port}/mcp",
       "type": "http"
     }
   }
 }
 ─────────────────────────────────────────────────────────
`);

// ── Lancement de Storybook ─────────────────────────────────────────────────────
const storybook = spawn(
  "npx",
  ["storybook", "dev", "--port", String(port), "--no-open"],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
  }
);

storybook.on("error", (err) => {
  console.error("\n❌  Impossible de démarrer Storybook :", err.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  storybook.kill("SIGINT");
  process.exit(0);
});
