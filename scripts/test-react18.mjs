// Compatibilité React 18 : installe React 18 et ses types sans modifier
// package.json, lance tsc, la suite Vitest, le build de la lib, le test de
// fumée hors Vite et le contrôle des types publiés, puis restaure les versions
// du lockfile (React 19) hors CI.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

let failed = false;
try {
  run("npm install --no-save --legacy-peer-deps react@18 react-dom@18 @types/react@18 @types/react-dom@18");
  run("npx tsc -b --noEmit");
  run("npx vitest run");
  run("npm run build:lib");
  run("npm run smoke:dist");
  run("npm run check:types");
} catch {
  failed = true;
} finally {
  if (!process.env.CI) run("npm install --legacy-peer-deps");
}
process.exit(failed ? 1 : 0);
