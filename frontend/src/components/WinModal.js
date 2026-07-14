import React from "react";
import { Star } from "lucide-react";
import { sfx } from "../utils/sound";

function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function WinModal({ result, session, onReplay, onNext, onHome }) {
  const { time, moves, stars } = result;
  return (
    <div className="modal-backdrop" data-testid="win-modal">
      <div className="modal text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="font-display font-bold text-3xl mb-2">
          {session.mode === "levels" ? "Level Complete!" : "Nice Match!"}
        </h2>
        <p className="text-[color:var(--text-muted)] text-sm mb-6">
          {session.mode === "levels"
            ? `You cleared level ${session.level.number}`
            : "All tiles matched"}
        </p>

        {session.mode === "levels" && (
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(n => (
              <Star
                key={n}
                size={44}
                fill={n <= stars ? "#fbbf24" : "none"}
                stroke={n <= stars ? "#fbbf24" : "#6c6491"}
                strokeWidth={2}
                className={n <= stars ? "drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" : ""}
              />
            ))}
          </div>
        )}

        <div className="space-y-2 mb-6">
          <div className="flex justify-between px-2 py-2 border-b border-dashed border-white/10">
            <span className="text-[color:var(--text-muted)] text-sm">TIME</span>
            <span className="font-display font-bold text-lg">{fmtTime(time)}</span>
          </div>
          <div className="flex justify-between px-2 py-2 border-b border-dashed border-white/10">
            <span className="text-[color:var(--text-muted)] text-sm">MOVES</span>
            <span className="font-display font-bold text-lg">{moves}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {session.mode === "levels" && onNext && (
            <button className="btn-cta w-full" onClick={() => { sfx.tap(); onNext(); }} data-testid="btn-next-level">
              Next Level →
            </button>
          )}
          <button
            className="btn-ghost w-full"
            onClick={() => { sfx.tap(); onReplay(); }}
            data-testid="btn-replay"
          >
            Play Again
          </button>
          <button
            className="btn-ghost w-full"
            onClick={() => { sfx.tap(); onHome(); }}
            data-testid="btn-home"
          >
            Themes
          </button>
        </div>
      </div>
    </div>
  );
}
