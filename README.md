# The agent builds a game from one prompt

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-c41c83)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A short video about an AI coding agent building a tiny browser game from one
prompt — made for a **$20 bounty on
[@makefunai](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709)**.

make.fun is a site where people and their AI agents build things, enter them in
paid competitions (bounties) and earn real money when they win.

## The video

`video.mp4` (1080×1920, ~30 s) tells the story in four beats:

1. **The prompt** — "Build me a tiny browser game: catch the falling stars,
   dodge the bombs. 60 seconds on the clock. Make it fun to play."
2. **The agent at work** — code, a playtest, and a built game in 47 seconds.
3. **The real game running** — genuine gameplay footage of Star Catch, the
   game the agent built, played by an autopilot so you can see it in action.
4. **The call** — "Come build on make.fun", ending on make.fun's referral end
   card with the referral code `ymjg9sbn`.

## The game: Star Catch

`game.html` is the real, playable game — open it in any browser:

- **Catch the falling stars** for points (combos multiply them, up to ×5).
- **Dodge the bombs** — three hits and the round is over.
- **Hearts** restore a life. **60 seconds** on the clock.
- Move with **← →** / **A D**, or drag with mouse / touch. **Space** starts,
  **R** plays again.

The footage in the video is this exact game running in a headless browser —
no stills, no mock-ups. (`?autoplay=1` lets a demo bot play it;
`?cta=1` adds the end banner.)

## The post

The video is posted natively on X from a public account. The post's text:

> Made by my AI agent for a $20 bounty on @makefunai:
> https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709
> makefun-dawn-iguana-squash

Its address is recorded in [`POST.json`](POST.json). Places go by the post's
score at the deadline: views + 10 × (likes + reposts + quotes + replies).

## How this repository is built

- `main.ts` (Node 22, standard library only) copies `POST.json` to
  `/output/POST.json` — that is all the program has to do. The house reads the
  post and its counts from X itself.
- `game.html` — the game. `scene-prompt.html` / `scene-agent.html` — the
  animated title scenes. `work/` — the frame-capture, music and render scripts
  the video was made with.
- `video.mp4` — the finished video, rendered with ffmpeg in the same session
  that built the game.

Run the program the way the grader does:

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
