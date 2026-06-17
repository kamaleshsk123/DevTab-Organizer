<div align="center">

# 🗂️ DevTab Organizer

**A premium Chrome Extension that turns tab chaos into a clean, organized workspace.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blueviolet?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![Version](https://img.shields.io/badge/Version-2.0.0-success?style=flat-square)](./manifest.json)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![JavaScript](https://img.shields.io/badge/Built%20with-Vanilla%20JS-yellow?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## 📖 Overview

**DevTab Organizer** automatically groups your Chrome tabs by category (GitHub, Documentation, AI Tools, etc.), lets you save and restore entire browser sessions, and gives you a lightning-fast search across all open tabs — all in a sleek, glassmorphic dark-mode popup.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Smart Auto-Grouping** | Groups tabs by category with one click or a keyboard shortcut. |
| ⚡ **Auto-Group Toggle** | Enable to automatically group tabs as you open them — and instantly groups all already-open tabs too. |
| 🔍 **Real-Time Search** | Spotlight-style search across every open tab in all windows. Click a result to jump directly to it. |
| 💾 **Session Management** | Save your current tab layout as a named session and restore it later — perfect for switching between projects. |
| 🏷️ **Custom Domain Rules** | Override built-in patterns with your own domain → category mappings, right inside the popup. |
| ⌨️ **Keyboard Shortcut** | Press `Alt+Shift+G` from anywhere in Chrome to group all tabs instantly. |
| 🛡️ **Smart Edge Handling** | Pinned tabs, system pages (`chrome://`), and already-grouped tabs are handled gracefully. |
| 🎨 **Premium UI** | Dark glassmorphic design with smooth slide animations, ripple effects, and toast notifications. |

---

## 🗂️ Tab Categories

The extension automatically detects and assigns tabs to these categories:

| Category | Color | Detected Domains |
|---|---|---|
| **GitHub** | ⚫ Grey | `github.com`, `gitlab.com`, `bitbucket.org` |
| **Stack Overflow** | 🟠 Orange | `stackoverflow.com`, `stackexchange.com` |
| **Docs** | 🔵 Blue | `docs.*`, `developer.*`, `mdn.io`, `npmjs.com`, `medium.com` |
| **Projects** | 🟣 Purple | `linear.app`, `notion.so`, `jira.*`, `trello.com`, `asana.com` |
| **AI Tools** | 🟢 Green | `chatgpt.com`, `claude.ai`, `gemini.google.com`, `v0.dev` |
| **Other** | 🩵 Cyan | Everything else |

> **Custom Rules** always take priority over built-in patterns. Add your own in the ⚙️ Settings panel.

---

## 🚀 Installation

Since this is in developer preview, install it manually:

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/kamaleshsk123/DevTab-Organizer.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `DevTab Organizer` folder (the one containing `manifest.json`).
6. Pin the extension to your toolbar for easy access! 📌

---

## 🎮 How to Use

### Group All Tabs
Click the purple **"Group All Tabs"** button in the popup. All open tabs (except pinned and system tabs) will be instantly sorted into named, color-coded Chrome Tab Groups.

### Auto-Group Mode
Toggle the **Auto** switch in the header. When enabled:
- All currently open tabs are grouped immediately.
- Any new tab you navigate to is auto-grouped as it loads.

### Search
Click the search bar and type — results appear instantly. Click any result to jump to that tab (even if it's in a different window).

### Save a Session
Type a name in the "Name current session..." box and click **Save**. Your entire tab layout is stored. Click the **↺ restore** icon next to any saved session to bring it back.

### Custom Rules
Click the **⚙️** gear icon → type a domain (e.g. `notion.so`) → choose a category → click **+ Add**. Done. No full URL needed.

### Keyboard Shortcut
Press **`Alt+Shift+G`** from any Chrome tab to group all tabs without opening the popup.

---

## 🛠️ Local Development & Preview

No build step required! This project uses pure Vanilla JS with ES Modules.

**To preview the UI locally:**
```bash
# From the project root
python3 -m http.server 18080
```
Then open `http://localhost:18080/popup/popup.html`.

> The `popup/mock.js` file simulates Chrome APIs (tab queries, storage, grouping) so the full UI is testable in a regular browser tab without loading the extension.

---

## 📁 Project Structure

```
DevTab Organizer/
├── manifest.json          # Extension config (MV3), permissions, shortcut
├── background.js          # Service worker: grouping logic, auto-group, shortcuts
├── popup/
│   ├── popup.html         # Main popup UI (two-view slide panel)
│   ├── popup.css          # Glassmorphic dark-mode styles + animations
│   ├── popup.js           # Popup logic: search, sessions, settings, toasts
│   ├── mock.js            # Chrome API mocks for local browser preview
│   ├── settings.html      # (Legacy) External settings page
│   ├── settings.css
│   └── settings.js
└── utils/
    ├── constants.js       # TAB_TYPES definitions (name, color, patterns)
    ├── tabDetector.js     # Category detection (custom rules → built-in)
    └── sessionManager.js  # Save / restore / delete sessions
```

---

## 🛡️ Privacy

DevTab Organizer runs **entirely locally** on your machine. Your tab data, session history, and custom rules are stored only in `chrome.storage.local` and **never leave your browser**. No analytics, no tracking, no external requests.

---

## 🗺️ Roadmap

- [x] Phase 1 — Core grouping, sessions, popup UI
- [x] Phase 2 — Search, custom rules, keyboard shortcut, auto-group, toasts
- [ ] Phase 3 — Chrome Web Store launch, extension icons
- [ ] Phase 4 — Cloud session sync via `chrome.storage.sync`

---

<div align="center">

Built with ❤️ using Vanilla JS · Chrome Manifest V3

</div>