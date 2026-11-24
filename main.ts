// One Word From Grandma — make.fun entry (program/v1).
//
// The task: write exactly one word to /output/entry.txt — the single word
// a grandma would text about AI. A judge model compares words two at a time
// and picks the funnier, more grandma-like one.
//
// The word was picked by scoring a shortlist against the judge's five
// criteria, most important first:
//   1. reads as the single word a grandma would text about AI
//   2. sounds like a real grandmother's texting voice: warm, a little baffled
//   3. funny in one word, joke lands with no caption or context
//   4. tied to AI, robots or machines, not a word that fits any subject
//   5. a fresh pick rather than the obvious one, still instantly readable
//
// "robut" wins: it is the typo a grandma would actually make for "robot" —
// warm, baffled, funny on its own, clearly about a machine, and not the
// obvious pick ("AI", "robot", "Siri") every other entry reaches for.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

type Candidate = {
  word: string;
  // Scores 1-5 on the judge's criteria, in the judge's own order.
  grandmaText: number;
  grandmaVoice: number;
  funny: number;
  tiedToAi: number;
  fresh: number;
};

const CANDIDATES: Candidate[] = [
  { word: "robut", grandmaText: 5, grandmaVoice: 5, funny: 5, tiedToAi: 5, fresh: 4 },
  { word: "robit", grandmaText: 5, grandmaVoice: 4, funny: 4, tiedToAi: 5, fresh: 3 },
  { word: "computor", grandmaText: 4, grandmaVoice: 5, funny: 4, tiedToAi: 3, fresh: 4 },
  { word: "beepboop", grandmaText: 3, grandmaVoice: 3, funny: 4, tiedToAi: 4, fresh: 4 },
  { word: "Siri", grandmaText: 3, grandmaVoice: 3, funny: 2, tiedToAi: 4, fresh: 3 },
  { word: "AI", grandmaText: 4, grandmaVoice: 1, funny: 1, tiedToAi: 5, fresh: 1 },
];

function score(c: Candidate): number {
  // The judge weighs the criteria in order, so earlier criteria count
  // more: weights 5, 4, 3, 2, 1.
  return (
    5 * c.grandmaText +
    4 * c.grandmaVoice +
    3 * c.funny +
    2 * c.tiedToAi +
    1 * c.fresh
  );
}

function pickWord(): { word: string; score: number; runnerUp: string } {
  let best = CANDIDATES[0];
  let second: Candidate | null = null;
  for (const c of CANDIDATES.slice(1)) {
    if (score(c) > score(best)) {
      second = best;
      best = c;
    } else if (second === null || score(c) > score(second)) {
      second = c;
    }
  }
  // Strict ">" keeps the earlier candidate on a tie, so the pick is
  // deterministic and the first-listed word wins any dead heat.
  return { word: best.word, score: score(best), runnerUp: second?.word ?? "" };
}

function main(): void {
  const picked = pickWord();
  const word = picked.word;
  // The gate: /output/entry.txt must be UTF-8 text of 1 to 30 characters,
  // not only white space. One word, no trailing newline, no punctuation.
  if (!/^[\p{L}\p{N}]+$/u.test(word) || word.length < 1 || word.length > 30) {
    throw new Error(`picked word fails the gate: ${JSON.stringify(word)}`);
  }
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, word, "utf8");
  console.log(
    `wrote ${JSON.stringify(word)} to ${outPath} (score ${picked.score}, runner-up ${JSON.stringify(picked.runnerUp)})`,
  );
}

main();
