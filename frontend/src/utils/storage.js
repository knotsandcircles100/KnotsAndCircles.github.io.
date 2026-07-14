// LocalStorage helpers — offline-first data
const KEY = "tilematch:v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

function ensureDeviceId() {
  let id = localStorage.getItem("tilematch:deviceId");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("tilematch:deviceId", id);
  }
  return id;
}

const DEFAULT = {
  sound: true,
  progress: {},   // { "easy-1": { stars: 3, bestTime, bestMoves } }
  bestFree: {},   // { "geometric:easy": { bestTime, bestMoves, games } }
  totalGames: 0,
  totalMatches: 0,
  upgraded: null, // { name, email }
};

export const store = {
  deviceId: ensureDeviceId(),
  get() {
    const cur = read();
    return { ...DEFAULT, ...(cur || {}) };
  },
  set(patch) {
    const cur = this.get();
    write({ ...cur, ...patch });
  },
  recordLevel(levelId, stars, time, moves) {
    const cur = this.get();
    const prev = cur.progress[levelId];
    const best = prev
      ? {
          stars: Math.max(prev.stars, stars),
          bestTime: Math.min(prev.bestTime, time),
          bestMoves: Math.min(prev.bestMoves, moves),
        }
      : { stars, bestTime: time, bestMoves: moves };
    cur.progress[levelId] = best;
    cur.totalGames = (cur.totalGames || 0) + 1;
    write(cur);
    return best;
  },
  recordFree(theme, difficulty, time, moves) {
    const cur = this.get();
    const key = `${theme}:${difficulty}`;
    const prev = cur.bestFree[key];
    const best = prev
      ? {
          bestTime: Math.min(prev.bestTime, time),
          bestMoves: Math.min(prev.bestMoves, moves),
          games: (prev.games || 0) + 1,
        }
      : { bestTime: time, bestMoves: moves, games: 1 };
    cur.bestFree[key] = best;
    cur.totalGames = (cur.totalGames || 0) + 1;
    write(cur);
    return best;
  },
  isLevelUnlocked(levelId) {
    const [diff, numStr] = levelId.split("-");
    const num = parseInt(numStr, 10);
    if (num === 1) return true;
    const prev = this.get().progress[`${diff}-${num - 1}`];
    return !!prev;
  },
  setUpgraded(user) {
    const cur = this.get();
    cur.upgraded = user;
    write(cur);
  },
  reset() {
    write(DEFAULT);
  },
};
