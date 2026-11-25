// Ember Ladle — hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ into the output directory, then writes
// /output/dossier.json with buildDossier from vendor/makefun-game.ts.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function clearDir(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function handIn(): void {
  mkdirSync(outDir, { recursive: true });
  clearDir(join(outDir, "game"));
  clearDir(join(outDir, "screenshots"));
  cpSync(join(repoRoot, "game"), join(outDir, "game"), { recursive: true });
  cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
}

handIn();
