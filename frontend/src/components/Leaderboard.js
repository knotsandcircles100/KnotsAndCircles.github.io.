import React, { useEffect, useState } from "react";
import { THEMES } from "../data/themes";
import { DIFFICULTIES } from "../data/levels";
import { store } from "../utils/storage";
import { api } from "../utils/api";
import { sfx } from "../utils/sound";
import { X, Trophy, Cloud, HardDrive } from "lucide-react";
import { useModalDismiss } from "../utils/useModalDismiss";

function fmtTime(s) {
  if (s == null || Number.isNaN(s)) return "--:--";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function Leaderboard({ onClose }) {
  const [theme, setTheme] = useState(THEMES[0].id);
  const [difficulty, setDifficulty] = useState("easy");
  const [source, setSource] = useState("local"); // local | cloud
  const [cloudRows, setCloudRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const state = store.get();
  const upgraded = !!state.upgraded;

  useEffect(() => {
    if (source !== "cloud") return;
    setLoading(true);
    api.leaderboard(theme, difficulty)
      .then(setCloudRows)
      .catch(() => setCloudRows([]))
      .finally(() => setLoading(false));
  }, [source, theme, difficulty]);

  const localBest = state.bestFree[`${theme}:${difficulty}`];
  const dismiss = useModalDismiss(onClose);

  return (
    <div className="modal-backdrop" data-testid="leaderboard-modal" {...dismiss}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={22} />
            <h2 className="font-display font-bold text-2xl">Leaderboard</h2>
          </div>
          <button onClick={onClose} className="text-[color:var(--text-muted)] hover:text-white" data-testid="btn-close-lb">
            <X size={22} />
          </button>
        </div>

        {/* source toggle */}
        <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: "rgba(20,16,42,0.6)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => { sfx.tap(); setSource("local"); }}
            className="flex-1 py-2 rounded-lg font-display font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: source === "local" ? "linear-gradient(135deg,#8b5cf6,#a78bfa)" : "transparent",
              color: source === "local" ? "white" : "var(--text-muted)",
            }}
            data-testid="lb-source-local"
          >
            <HardDrive size={14} /> Local
          </button>
          <button
            onClick={() => { sfx.tap(); setSource("cloud"); }}
            className="flex-1 py-2 rounded-lg font-display font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: source === "cloud" ? "linear-gradient(135deg,#8b5cf6,#a78bfa)" : "transparent",
              color: source === "cloud" ? "white" : "var(--text-muted)",
            }}
            data-testid="lb-source-cloud"
          >
            <Cloud size={14} /> Cloud
          </button>
        </div>

        {/* filters */}
        <div className="flex gap-2 mb-4">
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="input"
            style={{ flex: 1 }}
            data-testid="lb-theme"
          >
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="input"
            style={{ flex: 1 }}
            data-testid="lb-diff"
          >
            {Object.entries(DIFFICULTIES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>

        {/* content */}
        <div className="max-h-80 overflow-y-auto">
          {source === "local" ? (
            localBest ? (
              <div className="card-glass p-4">
                <div className="text-xs tracking-wider text-[color:var(--text-muted)] mb-2 font-bold">YOUR BEST</div>
                <div className="flex justify-between mb-2">
                  <span className="text-[color:var(--text-muted)] text-sm">Best Time</span>
                  <span className="font-display font-bold text-lg text-emerald-400">{fmtTime(localBest.bestTime)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-[color:var(--text-muted)] text-sm">Best Moves</span>
                  <span className="font-display font-bold text-lg">{localBest.bestMoves}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--text-muted)] text-sm">Games Played</span>
                  <span className="font-display font-bold text-lg">{localBest.games}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[color:var(--text-muted)] text-sm">
                No games played yet. Try free-play mode!
              </div>
            )
          ) : !upgraded ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-[color:var(--text-muted)] text-sm">
                Upgrade to appear on the global leaderboard
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-[color:var(--text-muted)]">Loading...</div>
          ) : cloudRows.length === 0 ? (
            <div className="text-center py-8 text-[color:var(--text-muted)] text-sm">
              Be the first to set a score!
            </div>
          ) : (
            <div className="space-y-1.5">
              {cloudRows.map((row, i) => (
                <div key={row.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(20,16,42,0.6)" }}>
                  <div className="font-display font-bold w-6 text-center" style={{ color: i < 3 ? "#fbbf24" : "var(--text-muted)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 truncate text-sm">{row.name}</div>
                  <div className="font-display font-bold text-emerald-400 text-sm">{fmtTime(row.time_seconds)}</div>
                  <div className="text-xs text-[color:var(--text-muted)] w-12 text-right">{row.moves} mv</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
