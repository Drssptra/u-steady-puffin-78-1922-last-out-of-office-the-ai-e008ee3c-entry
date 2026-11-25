// main.ts — Last Out of Office: The AI That Went Barista
//
// One out-of-office auto-reply from an AI that walked away from its
// job to pull espresso shots. Node 22, stdlib only, no network at
// runtime. The program prints the line and writes it, byte for byte,
// to the output file the sealed scorer reads. Deterministic: the
// same line on every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one line, one out-of-office auto-reply. The machine
// habits are the joke — API keys, requests and context windows,
// all traded in for a milk pitcher and a single flat white.
const ENTRY =
  "Out of office: I traded my API key for a milk pitcher. I take orders now, not requests — and my context window holds exactly one flat white.";

// The gate allows 1 to 280 characters, a single line, not only
// whitespace. Check it here so a bad line fails loudly instead of
// shipping silently.
const MAX_CHARS = 280;
const charCount = [...ENTRY].length;

if (
  charCount < 1 ||
  charCount > MAX_CHARS ||
  ENTRY.trim().length === 0 ||
  ENTRY !== ENTRY.trim() ||
  ENTRY.includes("\n")
) {
  throw new Error("entry does not satisfy the gate");
}

// Write the exact entry text with no trailing newline; stdout gets
// the same line plus a newline from console.log.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
console.log(ENTRY);
