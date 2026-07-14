# Tile Match — PRD

## Original problem statement
User asked "can you create games". Chose: **Matching Tiles** puzzle game with **difficulty levels, sound effects & animations**, **no forced login**, an **optional Upgrade** (name+email) to unlock cloud leaderboard/stats, and **Capacitor** for Web + Android + iOS (Play Store).

## Architecture
- **Frontend**: React 19 SPA (state-machine navigation, no router). Offline-first via localStorage. Web Audio API for sounds.
- **Backend**: FastAPI + MongoDB. Only used for optional cloud endpoints (`/api/upgrade/register`, `/api/scores/submit`, `/api/scores/leaderboard`).
- **Mobile**: Capacitor 6 config at `/app/frontend/capacitor.config.json` (appId `com.emergent.tilematch`). Build docs at `/app/README-MOBILE.md`.
- **Design**: Dark space theme, purple/violet accents with mint-teal CTA, Fredoka + Nunito typography, animated star-field bg, flip-card 3D animations, shake on mismatch, glow on match.

## Core requirements
- 5 themes: Geometric, Emojis, Animals, Fruits, Symbols (each with badge + 32 icons)
- 3 difficulties: Easy 4×3 / Medium 4×4 / Hard 6×4
- **Levels mode**: 30 levels per difficulty (90 total). Sequential unlock. 1–3 star rating based on time & moves. Theme rotates per level.
- **Free Play**: any theme × any difficulty, no locks.
- Local high-score/stats tracked automatically (per theme+difficulty).
- Sound toggle. All SFX generated via Web Audio API (no external files).
- Freemium upgrade: name+email → unlocks cloud leaderboard + removes ad banner.
- Offline: all gameplay works with no network.

## What's been implemented (Jan 14 2026)
- ✅ Backend endpoints (health, upgrade register/get, score submit, leaderboard, user scores) — 6/6 passing
- ✅ Home / theme picker with 5 themes + badges + preview icons
- ✅ Mode select screen (Levels tab with 30-level grid + Free Play tab) + difficulty selector
- ✅ Game screen with flip animations, moves/matches/time HUD, progress bar, restart
- ✅ Win modal with star rating, next-level / replay / home actions
- ✅ Upgrade modal (name + email → registers with backend)
- ✅ Leaderboard modal (Local vs Cloud tabs, theme+diff filters)
- ✅ Profile / stats modal (levels done, stars, total games)
- ✅ Sound effects (flip / match / mismatch / win / tap / unlock)
- ✅ Local storage: progress, best scores, upgrade state, device id
- ✅ Capacitor config + mobile build README
- ✅ Modal dismiss via Escape key + backdrop click
- ✅ Star field animated background

## Test status
- Backend: **6/6 endpoints passing** (iteration 1)
- Frontend: Home / theme pick / mode select / free-play board / mismatch flow / upgrade / leaderboard / profile all verified. WinModal end-to-end not visually captured but logic + testids are in place.

## Backlog / Future
- P1: Multiplayer / async challenges
- P1: Daily challenge with global reset
- P1: Achievements / badges
- P2: Custom themes / theme unlock progression
- P2: Payment integration (real freemium → paid) via Play Billing / Stripe
- P2: Hint / peek power-ups
- P2: Ambient background music
- P2: Localization
- P2: Real ad SDK (AdMob) — currently placeholder banner
