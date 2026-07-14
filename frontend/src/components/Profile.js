import React from "react";
import { store } from "../utils/storage";
import { X, User, Trophy, Sparkles } from "lucide-react";
import { useModalDismiss } from "../utils/useModalDismiss";

export default function Profile({ onClose }) {
  const s = store.get();
  const totalLevels = Object.keys(s.progress).length;
  const totalStars = Object.values(s.progress).reduce((sum, p) => sum + (p.stars || 0), 0);
  const freeGames = Object.values(s.bestFree).reduce((sum, p) => sum + (p.games || 0), 0);
  const upgraded = !!s.upgraded;
  const dismiss = useModalDismiss(onClose);

  return (
    <div className="modal-backdrop" data-testid="profile-modal" {...dismiss}>
      <div className="modal">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <User className="text-violet-400" size={22} />
            <h2 className="font-display font-bold text-2xl">Your Stats</h2>
          </div>
          <button onClick={onClose} className="text-[color:var(--text-muted)] hover:text-white" data-testid="btn-close-profile">
            <X size={22} />
          </button>
        </div>

        {upgraded && (
          <div className="mb-5 p-3 rounded-xl" style={{ background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.4)" }}>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Sparkles size={16} />
              <div>
                <div className="font-bold">{s.upgraded.name}</div>
                <div className="text-xs opacity-70">{s.upgraded.email}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="stat-card">
            <div className="value">{totalLevels}</div>
            <div className="label">LEVELS DONE</div>
          </div>
          <div className="stat-card">
            <div className="value">{totalStars}</div>
            <div className="label">STARS EARNED</div>
          </div>
          <div className="stat-card">
            <div className="value">{s.totalGames || 0}</div>
            <div className="label">TOTAL GAMES</div>
          </div>
          <div className="stat-card">
            <div className="value">{freeGames}</div>
            <div className="label">FREE PLAYS</div>
          </div>
        </div>

        <button
          className="btn-ghost w-full mt-2"
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) {
              store.reset();
              onClose();
            }
          }}
          data-testid="btn-reset-progress"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
