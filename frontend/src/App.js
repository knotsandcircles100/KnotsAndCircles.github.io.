import React, { useState } from "react";
import "@/App.css";
import StarField from "./components/StarField";
import Home from "./components/Home";
import ModeSelect from "./components/ModeSelect";
import GameScreen from "./components/GameScreen";
import WinModal from "./components/WinModal";
import UpgradeModal from "./components/UpgradeModal";
import Leaderboard from "./components/Leaderboard";
import Profile from "./components/Profile";
import { LEVELS } from "./data/levels";

export default function App() {
  const [screen, setScreen] = useState("home"); // home | mode | game
  const [currentTheme, setCurrentTheme] = useState(null);
  const [session, setSession] = useState(null); // { themeId, difficulty, mode, level? }
  const [winResult, setWinResult] = useState(null);

  // modals
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [upgradeOnSuccess, setUpgradeOnSuccess] = useState(null);

  const handleThemeSelect = (theme) => {
    setCurrentTheme(theme);
    setScreen("mode");
  };

  const startFree = (difficulty) => {
    setSession({ themeId: currentTheme.id, difficulty, mode: "free" });
    setScreen("game");
  };

  const startLevel = (level) => {
    setSession({ themeId: currentTheme.id, difficulty: level.difficulty, mode: "levels", level });
    setScreen("game");
  };

  const handleWin = (result) => setWinResult(result);

  const replay = () => {
    setWinResult(null);
    // force new session to reshuffle
    setSession(s => ({ ...s, _r: (s._r || 0) + 1 }));
  };

  const nextLevel = () => {
    if (session?.mode !== "levels" || !session.level) return;
    const diff = session.level.difficulty;
    const next = LEVELS[diff].find(l => l.number === session.level.number + 1);
    setWinResult(null);
    if (next) {
      setSession({ themeId: currentTheme.id, difficulty: diff, mode: "levels", level: next });
    } else {
      setScreen("mode");
    }
  };

  const backToHome = () => {
    setWinResult(null);
    setSession(null);
    setScreen("home");
  };

  const backToMode = () => {
    setWinResult(null);
    setSession(null);
    setScreen("mode");
  };

  return (
    <div className="App">
      <StarField />
      {screen === "home" && (
        <Home
          onSelectTheme={handleThemeSelect}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenProfile={() => setShowProfile(true)}
          onOpenUpgrade={(cb) => { setUpgradeOnSuccess(() => cb); setShowUpgrade(true); }}
        />
      )}
      {screen === "mode" && currentTheme && (
        <ModeSelect
          theme={currentTheme}
          onBack={backToHome}
          onPlayFree={startFree}
          onPlayLevel={startLevel}
        />
      )}
      {screen === "game" && session && (
        <GameScreen
          key={`${session.themeId}-${session.difficulty}-${session.level?.id || ""}-${session._r || 0}`}
          session={session}
          onBack={backToMode}
          onWin={handleWin}
        />
      )}

      {winResult && session && (
        <WinModal
          result={winResult}
          session={session}
          onReplay={replay}
          onNext={session.mode === "levels" ? nextLevel : null}
          onHome={backToHome}
        />
      )}

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => upgradeOnSuccess && upgradeOnSuccess()}
        />
      )}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  );
}
