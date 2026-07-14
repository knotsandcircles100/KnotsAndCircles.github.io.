import { THEMES } from "./themes";

// difficulty specs
export const DIFFICULTIES = {
  easy:   { name: "Easy",   cols: 4, rows: 3, pairs: 6,  targetTime: 45,  targetMoves: 12 },
  medium: { name: "Medium", cols: 4, rows: 4, pairs: 8,  targetTime: 70,  targetMoves: 18 },
  hard:   { name: "Hard",   cols: 6, rows: 4, pairs: 12, targetTime: 110, targetMoves: 30 },
};

// generate 30 levels per difficulty, rotating theme
function makeLevels(difficulty) {
  const spec = DIFFICULTIES[difficulty];
  const themes = THEMES.map(t => t.id);
  const levels = [];
  for (let i = 1; i <= 30; i++) {
    const theme = themes[(i - 1) % themes.length];
    // slight scaling: harder targets as levels progress
    const scale = 1 - Math.min(0.25, (i - 1) * 0.008);
    levels.push({
      id: `${difficulty}-${i}`,
      difficulty,
      number: i,
      theme,
      targetTime: Math.round(spec.targetTime * scale),
      targetMoves: Math.max(spec.pairs + 2, Math.round(spec.targetMoves * scale)),
    });
  }
  return levels;
}

export const LEVELS = {
  easy: makeLevels("easy"),
  medium: makeLevels("medium"),
  hard: makeLevels("hard"),
};

export function computeStars(level, timeSeconds, moves) {
  let stars = 1;
  if (timeSeconds <= level.targetTime) stars++;
  if (moves <= level.targetMoves) stars++;
  return stars;
}
