// main.ts — Last Out of Office: The AI That Went Barista (v2, rewrite)
//
// The out-of-office reply is assembled from its clauses at runtime:
// each clause is one beat of the joke, and the program stitches them
// into a single line, checks it against the gate, and writes it out.
// Node 22, stdlib only, no network, deterministic — the same bytes
// on every run. The entry text itself is fixed by the brief; only
// the program around it is new.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// One clause per beat. The em dash is written as an escape so the
// source stays plain ASCII while the output keeps the real character.
const CLAUSES: ReadonlyArray<{ beat: string; text: string }> = [
  { beat: "sign-off", text: "Out of office: I left the cloud for a job behind the counter." },
  {
    beat: "the queue",
    text: "Your email is seventh in line behind six regulars and a dog,",
  },
  {
    beat: "the new job",
    text: "and I now answer messages in person, in order, wearing an apron",
  },
  {
    beat: "the punchline",
    text: "\u2014 no refresh, no restart, no follow-ups.",
  },
];

function composeReply(clauses: ReadonlyArray<{ text: string }>): string {
  return clauses.map((clause) => clause.text).join(" ");
}

// The gate: 1 to 280 characters, exactly one line, not only
// whitespace, no leading or trailing space.
const GATE = /^(\S|\S.*\S)$/u;
const MAX_CHARS = 280;

function gateCheck(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`gate: ${chars} characters, need 1-${MAX_CHARS}`);
  }
  if (!GATE.test(line) || line.includes("\n") || line.includes("\r")) {
    throw new Error("gate: entry must be a single non-blank line");
  }
  // The entry text is frozen by the brief: all four beats must be
  // present, including the em dash before the punchline.
  if (CLAUSES.length !== 4 || !line.includes("\u2014")) {
    throw new Error("gate: entry text drifted from the brief");
  }
}

async function main(): Promise<void> {
  const entry = composeReply(CLAUSES);
  gateCheck(entry);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  await mkdir(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  await writeFile(target, entry, "utf8");

  // Read back and confirm the file is byte-for-byte the entry:
  // no trailing newline, no drift.
  const written = await readFile(target, "utf8");
  if (written !== entry) {
    throw new Error("entry.txt differs from the composed entry");
  }

  // Stdout may carry a trailing newline; the file must not.
  process.stdout.write(`${entry}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
