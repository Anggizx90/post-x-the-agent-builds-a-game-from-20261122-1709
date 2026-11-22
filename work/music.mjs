// SPDX-License-Identifier: MIT
// Synthesize a cheerful chiptune-ish music bed as a 16-bit PCM WAV (stdlib only).
// A bright arpeggio over a soft bass, with a tiny noise "hat" on the beat.
import { writeFileSync } from 'node:fs';

const SR = 44100;
const DUR = 31;                       // seconds, a touch longer than the clip
const N = SR * DUR;
const out = new Float32Array(N);

// note frequencies (Hz)
const N4 = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5, E6: 1318.5, G6: 1568.0 };
// chords: C - F - G - C, one bar each (0.5s per beat, 4 beats per bar)
const BARS = [
  { bass: 'C4', arp: ['C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'E5'] },
  { bass: 'F4', arp: ['F5', 'A5', 'C6', 'F5', 'A5', 'C6', 'A5', 'F5'] },
  { bass: 'G4', arp: ['G5', 'B4', 'D5', 'G5', 'D5', 'B4', 'G5', 'D5'] },
  { bass: 'C4', arp: ['C5', 'E5', 'G5', 'E6', 'G6', 'E6', 'G5', 'C6'] },
];
const BEAT = 0.5, BAR = BEAT * 4;

function addTone(t0, dur, freq, amp, type) {
  const start = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx >= N) break;
    const t = i / SR;
    const env = Math.min(1, i / (SR * 0.01)) * Math.exp(-3.2 * (i / len));
    let v;
    if (type === 'square') v = Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.6
      + Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
    else v = Math.sin(2 * Math.PI * freq * t);
    out[idx] += v * amp * env;
  }
}
function addHat(t0) {
  const start = Math.floor(t0 * SR), len = Math.floor(0.05 * SR);
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx >= N) break;
    out[idx] += (Math.random() * 2 - 1) * 0.05 * Math.exp(-i / (len / 4));
  }
}

for (let bar = 0; bar < Math.ceil(DUR / BAR); bar++) {
  const b = BARS[bar % BARS.length];
  const tBar = bar * BAR;
  // bass: one soft note per beat
  for (let beat = 0; beat < 4; beat++) {
    addTone(tBar + beat * BEAT, BEAT * 0.9, N4[b.bass] / 2, 0.16, 'sine');
    addHat(tBar + beat * BEAT + BEAT / 2);
  }
  // arpeggio: 8th notes
  b.arp.forEach((n, i) => addTone(tBar + i * (BEAT / 2), BEAT * 0.45, N4[n], 0.11, 'square'));
}

// gentle fade in/out
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fadeIn = Math.min(1, t / 0.4);
  const fadeOut = Math.min(1, (DUR - t) / 1.0);
  out[i] *= fadeIn * fadeOut;
}

// write WAV
const data = Buffer.alloc(44 + N * 2);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 2, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
data.writeUInt16LE(1, 22); data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28);
data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) {
  const s = Math.max(-1, Math.min(1, out[i]));
  data.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
}
writeFileSync(process.argv[2], data);
console.log('wrote', process.argv[2], DUR + 's');
