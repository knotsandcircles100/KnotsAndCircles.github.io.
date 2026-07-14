import React, { useEffect, useState } from "react";
import { THEMES } from "../data/themes";
import { store } from "../utils/storage";
import { sfx } from "../utils/sound";
import { Volume2, VolumeX, Trophy, User } from "lucide-react";

export default function Home({ onSelectTheme, onOpenLeaderboard, onOpenProfile, onOpenUpgrade }) {
  const [selected, setSelected] = useState(null);
  const [soundOn, setSoundOn] = useState(store.get().sound);
  const [upgraded, setUpgraded] = useState(!!store.get().upgraded);

  useEffect(() => {
    sfx.setEnabled(soundOn);
    store.set({ sound: soundOn });
  }, [soundOn]);

  const handleSelect = (theme) => {
    sfx.tap();
    setSelected(theme.id);
    setTimeout(() => onSelectTheme(theme), 220);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-10 relative">
      {/* Top bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✳️</span>
          <span className="font-display font-bold text-lg tracking-tight">Tile Match</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost"
            onClick={() => { sfx.tap(); onOpenLeaderboard(); }}
            data-testid="btn-leaderboard"
          >
            <Trophy size={16} className="inline mr-1.5 -mt-0.5" /> Leaderboard
          </button>
          <button
            className="btn-ghost"
            onClick={() => { sfx.tap(); onOpenProfile(); }}
            data-testid="btn-profile"
          >
            <User size={16} className="inline mr-1.5 -mt-0.5" /> Stats
          </button>
          <button
            className="btn-ghost"
            onClick={() => setSoundOn(v => !v)}
            aria-label="Toggle sound"
            data-testid="btn-sound"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-4xl mb-4">🧩</div>
        <h1 className="font-display font-bold text-5xl md:text-6xl mb-3" data-testid="hero-title">
          Tile Match
        </h1>
        <p className="text-[color:var(--text-muted)] text-base md:text-lg">
          Choose a tile theme to begin your game
        </p>
      </div>

      {/* Themes grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-5xl mb-10">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            className={`card-glass p-6 text-left ${selected === theme.id ? "selected" : ""}`}
            onClick={() => handleSelect(theme)}
            data-testid={`theme-${theme.id}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="grid grid-cols-2 gap-1.5">
                {theme.preview.map((icon, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: "rgba(20,16,42,0.7)" }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
              <span className={`badge ${theme.badgeClass}`}>{theme.badge}</span>
            </div>
            <div
              className="font-display font-bold text-xl mb-1"
              style={{ color: theme.accent }}
            >
              {theme.name}
            </div>
            <div className="text-xs text-[color:var(--text-muted)]">{theme.desc}</div>
          </button>
        ))}
      </div>

      {/* Upgrade CTA */}
      {!upgraded && (
        <button
          className="btn-ghost mb-4"
          onClick={() => { sfx.tap(); onOpenUpgrade(() => setUpgraded(true)); }}
          data-testid="btn-upgrade"
        >
          ✨ Upgrade — Cloud leaderboard & stats
        </button>
      )}
      {upgraded && (
        <div className="text-xs text-[color:var(--mint)] mb-4 font-bold tracking-wider">
          ✓ CLOUD SYNC ENABLED
        </div>
      )}

      <div className="w-full max-w-2xl">
        <div className="ad-banner" data-testid="ad-banner">
          ADVERTISEMENT — Upgrade to remove ads & unlock cloud stats
        </div>
      </div>
    </div>
  );
}
