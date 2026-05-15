# 🥚 Runehatch

> *Breed the Legend. Battle the World.*

A fantasy creature-hatching and battling mobile game built with Expo + React Native.

---

## 📱 Play instantly on your phone (no build needed)

1. Install **Expo Go** from the Play Store
2. Run `npm install && npx expo start` on your computer
3. Scan the QR code — game loads immediately

---

## 📦 Build a real APK via GitHub Actions (free, no EAS)

This project builds the APK using **Gradle directly** inside GitHub Actions.  
No EAS account, no paid plan — just GitHub's free CI minutes.

### Steps

**1. Push your code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/runehatch.git
git push -u origin main
```

**2. Watch the build run**
- Go to your repo on GitHub
- Click the **Actions** tab
- You'll see "Build Android APK" running automatically
- It takes about 15–20 minutes (Gradle is slow on first run, faster after caching)

**3. Download the APK**
- When the Action is green ✅, click into the run
- Scroll to the bottom → **Artifacts** section
- Download **runehatch-debug-apk**
- Unzip it — inside is `app-debug.apk`

**4. Install on your phone**
- Enable **Install from unknown sources** in your Android settings
  - Settings → Apps → Special app access → Install unknown apps
- Transfer the APK to your phone (Google Drive, USB, email — anything works)
- Tap the file on your phone to install

**5. Trigger a new build anytime**
- Push a new commit to `main` — build fires automatically
- Or: Actions tab → "Build Android APK" → **Run workflow** button

---

## 📁 Project Structure

```
runehatch/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout + font loading
│   ├── index.tsx           # Main menu
│   └── map.tsx             # World map
├── src/
│   ├── screens/
│   │   ├── MenuScreen.tsx  # Animated main menu
│   │   └── MapScreen.tsx   # Interactive world map
│   └── data/
│       └── gameData.ts     # Regions, runes, player stats
├── .github/workflows/
│   └── build-apk.yml       # Gradle build — no EAS needed
├── app.json                # Expo config
└── package.json
```

---

## 🗺️ Screens Built So Far

- ✅ **Main Menu** — animated floating egg, shimmer title, runic background
- ✅ **World Map** — 6 regions, pulsing nodes, region detail panel

## 🔜 Coming Next

- 🥚 Egg hatching screen
- ⚔️ Battle system
- 📖 Creature codex
- 🧬 Breeding lab

---

## 🎨 Tech Stack

| Tool | Purpose |
|------|---------|
| Expo 52 | Build toolchain |
| Expo Router | File-based navigation |
| React Native | Cross-platform UI |
| Gradle | APK compilation (no EAS) |
| GitHub Actions | Free CI/CD |
