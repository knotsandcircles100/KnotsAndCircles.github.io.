import React, { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "../data/themes";
import { DIFFICULTIES, computeStars } from "../data/levels";
import { sfx } from "../utils/sound";
import { store } from "../utils/storage";
import { api } from "../utils/api";
import { ArrowLeft, RotateCw, Clock, Check, MousePointerClick } from "lucide-react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function GameScreen({ session, onBack, onWin }) {
  // session = { themeId, difficulty, mode: 'free'|'levels', level? }
  const theme = getTheme(session.themeId);
  const spec = DIFFICULTIES[session.difficulty];

  const tiles = useMemo(() => {
    const chosen = shuffle(theme.icons).slice(0, spec.pairs);
    const doubled = shuffle([...chosen, ...chosen]);
    return doubled.map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
  }, [theme.id, spec.pairs, session.level?.id]);

  const [board, setBoard] = useState(tiles);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { setBoard(tiles); }, [tiles]);

  useEffect(() => {
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (matches === spec.pairs && matches > 0) {
      clearInterval(timerRef.current);
      sfx.win();
      const done = async () => {
        let stars = 3;
        if (session.mode === "levels" && session.level) {
          stars = computeStars(session.level, time, moves);
          store.recordLevel(session.level.id, stars, time, moves);
        } else {
          store.recordFree(theme.id, session.difficulty, time, moves);
        }
        // Cloud submit if upgraded
        const upgraded = store.get().upgraded;
        if (upgraded) {
          try {
            await api.submitScore({
              theme: theme.id,
              difficulty: session.difficulty,
              mode: session.mode,
              level: session.level?.number || null,
              time_seconds: time,
              moves,
              stars,
            });
          } catch (e) { /* offline ok */ }
        }
        onWin({ time, moves, stars });
      };
      setTimeout(done, 600);
    }
  }, [matches]); // eslint-disable-line

  const handleTileClick = (idx) => {
    if (locked) return;
    const t = board[idx];
    if (t.flipped || t.matched) return;
    sfx.flip();
    const newBoard = board.map((x, i) => i === idx ? { ...x, flipped: true } : x);
    const newSelected = [...selected, idx];
    setBoard(newBoard);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newSelected;
      if (newBoard[a].icon === newBoard[b].icon) {
        setTimeout(() => {
          sfx.match();
          setBoard(bb => bb.map((x, i) => (i === a || i === b) ? { ...x, matched: true } : x));
          setSelected([]);
          setMatches(m => m + 1);
          setLocked(false);
        }, 400);
      } else {
        setWrong([a, b]);
        setTimeout(() => {
          sfx.mismatch();
        }, 200);
        setTimeout(() => {
          setBoard(bb => bb.map((x, i) => (i === a || i === b) ? { ...x, flipped: false } : x));
          setSelected([]);
          setWrong([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const restart = () => {
    sfx.tap();
    const chosen = shuffle(theme.icons).slice(0, spec.pairs);
    const doubled = shuffle([...chosen, ...chosen]);
    setBoard(doubled.map((icon, i) => ({ id: i, icon, flipped: false, matched: false })));
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setWrong([]);
    setLocked(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
  };

  const progressPct = (matches / spec.pairs) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-6 relative">
      {/* Top bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <button className="btn-ghost" onClick={() => { sfx.tap(); onBack(); }} data-testid="btn-back-game">
          <ArrowLeft size={16} className="inline mr-1 -mt-0.5" /> Themes
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">✳️</span>
          <span className="font-display font-bold text-lg" style={{ color: theme.accent }}>
            {theme.name} Match
          </span>
          {session.mode === "levels" && session.level && (
            <span className="text-sm text-[color:var(--text-muted)]">
              · Level {session.level.number}
            </span>
          )}
        </div>
        <button className="btn-ghost" onClick={restart} data-testid="btn-restart">
          <RotateCw size={16} className="inline mr-1 -mt-0.5" /> Restart
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-4">
        <div className="stat-card" data-testid="stat-moves">
          <div className="icon"><MousePointerClick size={22} className="inline text-amber-400" /></div>
          <div className="value">{moves}</div>
          <div className="label">MOVES</div>
        </div>
        <div className="stat-card" data-testid="stat-matches">
          <div className="icon"><Check size={22} className="inline text-emerald-400" /></div>
          <div className="value">{matches}/{spec.pairs}</div>
          <div className="label">MATCHES</div>
        </div>
        <div className="stat-card" data-testid="stat-time">
          <div className="icon"><Clock size={22} className="inline text-cyan-400" /></div>
          <div className="value">{fmtTime(time)}</div>
          <div className="label">TIME</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="progress"><div style={{ width: `${progressPct}%` }} /></div>
      </div>

      {/* Board */}
      <div
        className="grid gap-2 md:gap-3 w-full"
        style={{
          gridTemplateColumns: `repeat(${spec.cols}, minmax(0, 1fr))`,
          maxWidth: `${spec.cols * 90}px`,
        }}
        data-testid="board"
      >
        {board.map((t, idx) => (
          <div
            key={t.id}
            className={`tile ${t.flipped ? "flipped" : ""} ${t.matched ? "matched" : ""} ${wrong.includes(idx) ? "wrong" : ""} ${selected.includes(idx) && !t.matched && !wrong.includes(idx) ? "selected" : ""}`}
            onClick={() => handleTileClick(idx)}
            data-testid={`tile-${idx}`}
          >
            <div className="tile-inner">
              <div className="tile-back">✦</div>
              <div className="tile-face">{t.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
