// SPDX-License-Identifier: MIT
// Re-capture selected scenes (same engine as capture.mjs).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [chromeBin, framesDir, entryDir, ...scenes] = process.argv.slice(2);
mkdirSync(framesDir, { recursive: true });
const PORT = 9224;
const chrome = spawn(chromeBin, [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1080,1920', '--hide-scrollbars',
  '--user-data-dir=/tmp/chrome-capture-profile2',
  '--force-device-scale-factor=1', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForChrome() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return; } catch {}
    await sleep(500);
  }
  throw new Error('chrome did not start');
}
let msgId = 0;
const pending = new Map();
let ws;
function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function captureScene(url, prefix, { warmupMs, durMs, fps }) {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (ws) ws.close();
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url });
  await sleep(warmupMs);
  const interval = 1000 / fps;
  const n = Math.round((durMs / 1000) * fps);
  for (let i = 0; i < n; i++) {
    const t0 = Date.now();
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    writeFileSync(join(framesDir, `${prefix}_${String(i).padStart(4, '0')}.jpg`), Buffer.from(shot.data, 'base64'));
    const took = Date.now() - t0;
    if (took < interval) await sleep(interval - took);
  }
  console.log(`captured ${prefix}: ${n} frames from ${url}`);
  ws.close(); ws = null;
}
const SPECS = {
  a: [`${'file://' + entryDir}/scene-prompt.html`, { warmupMs: 300, durMs: 5000, fps: 10 }],
  b: [`${'file://' + entryDir}/scene-agent.html`, { warmupMs: 300, durMs: 7000, fps: 10 }],
  c: [`${'file://' + entryDir}/game.html?autoplay=1`, { warmupMs: 4500, durMs: 13000, fps: 20 }],
  d: [`${'file://' + entryDir}/game.html?autoplay=1&cta=1`, { warmupMs: 4500, durMs: 5000, fps: 20 }],
};
try {
  await waitForChrome();
  for (const s of scenes) await captureScene(SPECS[s][0], s, SPECS[s][1]);
  console.log('RE-CAPTURE DONE');
} finally {
  chrome.kill('SIGKILL');
}
