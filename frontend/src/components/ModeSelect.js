import React, { useState } from "react";
import { DIFFICULTIES, LEVELS } from "../data/levels";
import { store } from "../utils/storage";
import { sfx } from "../utils/sound";
import { ArrowLeft, Lock, Star } from "lucide-react";

export default function ModeSelect({ theme, onBack, onPlayFree, onPlayLevel }) {
  const [tab, setTab] = useState("levels"); // levels | free
  const [difficulty, setDifficulty] = useState("easy");
  const state = store.get();

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-8 relative">
      {/* Top bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button className="btn-ghost" onClick={() => { sfx.tap(); onBack(); }} data-testid="btn-back-home">
          <ArrowLeft size={16} className="inline mr-1 -mt-0.5" /> Themes
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">✳️</span>
          <span className="font-display font-bold" style={{ color: theme.accent }}>
            {theme.name} Match
          </span>
        </div>
        <div style={{ width: 90 }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ background: "rgba(20,16,42,0.6)", border: "1px solid var(--border)" }}>
        <button
          onClick={() => setTab("levels")}
          className="px-5 py-2 rounded-xl font-display font-semibold text-sm transition-all"
          style={{
            background: tab === "levels" ? "linear-gradient(135deg,#8b5cf6,#a78bfa)" : "transparent",
            color: tab === "levels" ? "white" : "var(--text-muted)",
          }}
          data-testid="tab-levels"
        >
          Levels
        </button>
        <button
          onClick={() => setTab("free")}
          className="px-5 py-2 rounded-xl font-display font-semibold text-sm transition-all"
          style={{
            background: tab === "free" ? "linear-gradient(135deg,#8b5cf6,#a78bfa)" : "transparent",
            color: tab === "free" ? "white" : "var(--text-muted)",
          }}
          data-testid="tab-free"
        >
          Free Play
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="w-full max-w-3xl mb-6">
        <div className="card-glass p-5">
          <div className="text-xs font-bold tracking-widest text-[color:var(--text-muted)] mb-3">
            DIFFICULTY
          </div>
          <div className="flex gap-3">
            {Object.entries(DIFFICULTIES).map(([key, d]) => (
              <div
                key={key}
                className={`diff-pill ${difficulty === key ? "active" : ""}`}
                onClick={() => { sfx.tap(); setDifficulty(key); }}
                data-testid={`diff-${key}`}
              >
                <div
                  className="font-display font-bold text-xl mb-1"
                  style={{ color: difficulty === key ? "var(--violet)" : "var(--text)" }}
                >
                  {d.name}
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  {d.cols}×{d.rows} · {d.pairs} pairs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tab === "levels" ? (
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
            {LEVELS[difficulty].map(level => {
              const progress = state.progress[level.id];
              const unlocked = store.isLevelUnlocked(level.id);
              const stars = progress?.stars || 0;
              return (
                <button
                  key={level.id}
                  disabled={!unlocked}
                  className={`level-card ${!unlocked ? "locked" : ""} ${progress ? "completed" : ""}`}
                  onClick={() => { sfx.tap(); onPlayLevel(level); }}
                  data-testid={`level-${level.id}`}
                >
                  {!unlocked ? (
                    <Lock size={18} className="text-[color:var(--text-dim)]" />
                  ) : (
                    <>
                      <div className="num">{level.number}</div>
                      {progress && (
                        <div className="stars">
                          {[1,2,3].map(n => (
                            <Star key={n} size={10} fill={n <= stars ? "#fbbf24" : "none"} stroke={n <= stars ? "#fbbf24" : "#6c6491"} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl text-center py-8">
          <p className="text-[color:var(--text-muted)] mb-6">
            Free play — no goals, no locks. Just relax and match.
          </p>
          <button
            className="btn-cta"
            onClick={() => { sfx.tap(); onPlayFree(difficulty); }}
            data-testid="btn-play-free"
          >
            Play {theme.name}
          </button>
        </div>
      )}
    </div>
  );
}
