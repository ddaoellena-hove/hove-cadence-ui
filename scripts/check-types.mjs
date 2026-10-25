// Contrôle des déclarations publiées (dist/index.d.ts et dist/index.d.cts),
// vues par une application : le paquet est résolu par son nom (auto-référence
// via "exports"), en TypeScript strict avec skipLibCheck: false, pour les
// résolutions node16, nodenext (ESM et CJS) et bundler. À lancer après build:lib.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = join(root, "scripts", "check-types");
const tsc = join(root, "node_modules", "typescript", "bin", "tsc");

const base = { strict: true, skipLibCheck: false, noEmit: true, jsx: "react-jsx", target: "ES2022", types: [] };
const cases = [
  { name: "node16 (ESM + CJS)", options: { module: "node16", moduleResolution: "node16" }, files: ["esm.mts", "cjs.cts"] },
  { name: "nodenext (ESM + CJS)", options: { module: "nodenext", moduleResolution: "nodenext" }, files: ["esm.mts", "cjs.cts"] },
  { name: "bundler", options: { module: "esnext", moduleResolution: "bundler" }, files: ["app.tsx", "esm.mts"] },
];

const tmp = mkdtempSync(join(tmpdir(), "cadence-types-"));
let failed = false;
try {
  for (const { name, options, files } of cases) {
    const config = join(tmp, `${name.split(" ")[0]}.json`);
    writeFileSync(config, JSON.stringify({ compilerOptions: { ...base, ...options }, files: files.map((f) => join(fixtures, f)) }));
    try {
      execFileSync(process.execPath, [tsc, "-p", config], { cwd: root, stdio: "pipe" });
      console.log(`✓ types ${name}`);
    } catch (error) {
      failed = true;
      console.error(`✗ types ${name}\n${error.stdout}`);
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
