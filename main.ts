// SPDX-License-Identifier: MIT
// Entry for the make.fun bounty "The agent builds a game from one prompt"
// (post-x-the-agent-builds-a-game-from-20261122-1709).
//
// The entry is the X post itself: a short video of an AI coding agent building
// a tiny browser game from one prompt, ending with make.fun's referral end card
// carrying the referral code ymjg9sbn. This program's only job is to hand the
// post's address to the house: it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. Nothing this program writes about
// the post is scored — the house reads the post and its counts from X itself.
//
// NOTE: POST.json still holds a placeholder address until the video is posted
// from the owner's public X account; the placeholder is replaced with the real
// post's address before the entry is submitted, and this program is unchanged.
//
// Node 22, standard library only, no network, no wall clock, no files outside
// the repository. Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

const source = join(BOT_DIR, 'POST.json');
const target = join(OUTPUT_DIR, 'POST.json');

try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
