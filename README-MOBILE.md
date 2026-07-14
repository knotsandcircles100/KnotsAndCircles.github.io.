# 📱 Mobile Build Guide — Tile Match (Android/iOS via Capacitor)

This app is a **React web app wrapped with Capacitor** — same codebase runs as web + native mobile app.

## Prerequisites (local machine, not this container)

- **Node.js 18+** and **Yarn**
- **Android Studio** (for Android APK / Play Store)
- **Xcode** (macOS only, for iOS App Store)

## One-time Capacitor setup

```bash
cd /app/frontend
yarn add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Tile Match" com.emergent.tilematch --web-dir=build
```

The `capacitor.config.json` in this folder is pre-configured.

## Build for Android

```bash
cd /app/frontend
yarn build                       # 1. Build the React web bundle
npx cap add android              # 2. Add Android platform (first time only)
npx cap sync android             # 3. Copy web assets into native project
npx cap open android             # 4. Opens Android Studio
```

In Android Studio:
1. Wait for Gradle sync
2. **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**
3. Create a keystore (save the password!)
4. Upload the `.aab` to [Google Play Console](https://play.google.com/console)

## Build for iOS (macOS only)

```bash
cd /app/frontend
yarn build
npx cap add ios
npx cap sync ios
npx cap open ios
```

In Xcode: **Product → Archive → Distribute App → App Store Connect**

## Update package ID

Edit `capacitor.config.json` → change `appId` (e.g., `com.yourcompany.tilematch`) before first build.

## Play Store submission checklist

- [ ] App icon (512×512 PNG)
- [ ] Feature graphic (1024×500 PNG)
- [ ] At least 2 screenshots (phone)
- [ ] Short description (80 chars)
- [ ] Full description (up to 4000 chars)
- [ ] Privacy policy URL (required — you collect email on upgrade)
- [ ] Content rating questionnaire
- [ ] Signed `.aab` file

## Offline behavior

The game is **fully offline** — no network required for gameplay, levels, sound, or local stats/leaderboard. The backend is only called when a user opts to **Upgrade** (submits email) or views the **Cloud leaderboard**.

## Notes

- The backend URL (`REACT_APP_BACKEND_URL` in `.env`) points to the deployed API. Update this to your production URL before building the mobile app.
- To disable the backend calls entirely for a "pure offline" build, just skip setting `REACT_APP_BACKEND_URL` — the app will still work; cloud features will silently no-op.
