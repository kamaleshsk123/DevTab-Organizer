# 🚀 DevTab Organizer

**DevTab Organizer** is a premium, power-user Chrome extension designed to automatically organize your browser workspace. It groups tabs intelligently by category, allows you to save and restore entire sessions, and provides a blazing-fast search across all your open tabs—all wrapped in a beautiful, glassmorphic UI.

## ✨ Key Features

- 🗂️ **Smart Auto-Grouping**: Instantly groups tabs by category (GitHub, Documentation, Stack Overflow, Project Tools, AI Tools, Other) with a single click.
- 💾 **Session Management**: Save your current tab layout as a named session and restore it later. Perfect for switching contexts (e.g., "Frontend Dev" vs. "Bug Hunting").
- 🔍 **Real-Time Tab Search**: A built-in spotlight search that instantly finds and jumps to any open tab across all your windows.
- ⚙️ **Custom Domain Rules**: Override the built-in categorizations. Define your own rules mapping specific domains to specific categories right from the inline settings panel.
- ⌨️ **Global Shortcut**: Press `Alt+Shift+G` from anywhere in Chrome to instantly auto-group your tabs without even opening the popup.
- 🎨 **Premium UI/UX**: Features a modern dark-mode aesthetic, smooth slide-in animations, ripple effects, and non-intrusive toast notifications.

## 🛠️ How It Works

1. **Group All Tabs**: Click the main button (or use `Alt+Shift+G`) and the extension will analyze all your open tabs, categorizing them into Chrome Tab Groups with distinct colors. (Note: Pinned and System tabs are safely ignored).
2. **Custom Rules Priority**: The extension checks your custom rules first. If `notion.so` is mapped to "Projects" by you, it groups there. Otherwise, it falls back to its smart built-in patterns.
3. **Session Restoration**: When you restore a session, the extension checks if the URLs are already open to prevent duplicating tabs.

## 🚀 Getting Started (Installation)

Since this is currently in developer preview, you can install it manually:

1. **Clone or download** this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the `DevTab Organizer` folder containing the `manifest.json`.
6. Pin the extension to your toolbar for easy access!

## 🧪 Development & Local Preview

This project is built with **Vanilla HTML, CSS, and JavaScript** for maximum performance and zero build-step overhead.

To preview the UI locally without reloading the extension constantly:
1. Start a local server:
   ```bash
   python3 -m http.server 18080
   ```
2. Open `http://localhost:18080/popup/popup.html` in your browser.
3. The UI uses a built-in `mock.js` layer that simulates Chrome APIs (like tab querying, storage, and grouping) so you can test the interface layout, search, and settings perfectly in a regular browser tab.

## 🛡️ Privacy

DevTab Organizer runs entirely locally on your machine. Your tabs, browsing history, and custom rules are stored using `chrome.storage.local` and never leave your browser.
