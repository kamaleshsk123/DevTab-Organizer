# 🗂️ DevTab Organizer — Chrome Extension

> **Stop drowning in tabs. DevTab automatically organizes your browser workspace by project so you can focus on coding, not searching.**

---

## 📌 Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Features](#features)
5. [File Structure](#file-structure)
6. [Tech Stack](#tech-stack)
7. [Chrome APIs Used](#chrome-apis-used)
8. [Permissions](#permissions)
9. [UI Design](#ui-design)
10. [Tab Detection Logic](#tab-detection-logic)
11. [Session Management](#session-management)
12. [Development Setup](#development-setup)
13. [How to Load in Chrome](#how-to-load-in-chrome)
14. [Roadmap](#roadmap)
15. [Monetization Plan](#monetization-plan)

---

## 📖 Overview

**DevTab Organizer** is a Chrome extension built for developers and tech users who suffer from tab overload. It automatically detects, groups, and color-codes browser tabs by type — GitHub, Stack Overflow, documentation, project management tools, and more — so developers can maintain a clean, organized workspace without manual effort.

| Property | Details |
|---|---|
| **Extension Name** | DevTab Organizer |
| **Version** | 1.0.0 (MVP) |
| **Manifest Version** | Manifest V3 |
| **Target Browser** | Google Chrome |
| **Tech Stack** | HTML + CSS + Vanilla JavaScript |
| **Target Users** | Developers, Tech Users |

---

## 😤 Problem Statement

Developers typically have **20–50 browser tabs open** at any given time during a workday. These tabs are a chaotic mix of:

- GitHub PRs and issues
- Stack Overflow answers
- API documentation
- Jira / Linear tickets
- MDN / DevDocs references
- YouTube tutorials
- Random Google searches

**The result:**
- Mental overload from visual clutter
- Wasted time searching for the "right tab"
- Lost context when switching between tasks
- Browser slowdown from too many open tabs
- Stress and reduced productivity

**DevTab Organizer solves this** by automatically detecting what type each tab is and grouping them visually — giving developers a calm, structured workspace.

---

## 👤 Target Users

**Primary:** Developers and Tech Users who:
- Work on multiple projects simultaneously
- Reference documentation while coding
- Use GitHub/GitLab for version control
- Track tasks in Jira, Linear, or Notion
- Have 15+ tabs open on a regular basis

**Secondary:**
- UI/UX designers who browse references and tools
- Tech leads managing multiple project workflows
- Freelancers juggling multiple client projects

---

## ✨ Features

### MVP Features (Version 1.0)

#### 1. 🤖 Auto Tab Detection
Automatically detects the type of each open tab based on its URL domain.

| Tab Type | Detected Domains | Color |
|---|---|---|
| **GitHub** | github.com, gitlab.com, bitbucket.org | 🟤 Brown |
| **Stack Overflow** | stackoverflow.com, stackexchange.com | 🟠 Orange |
| **Documentation** | docs.*, developer.*, mdn.io, devdocs.io | 🔵 Blue |
| **Project Management** | jira.*, linear.app, notion.so, trello.com | 🟣 Purple |
| **AI Tools** | chatgpt.com, claude.ai, gemini.google.com | 🟢 Green |
| **Other / General** | Everything else | ⚪ Grey |

---

#### 2. 🎨 Color-Coded Tab Groups
Uses Chrome's native **Tab Groups API** to visually group and color-code tabs by their detected type. Each group is automatically named and colored.

---

#### 3. 💾 Save & Restore Sessions
- Save your current tab session with a custom name (e.g., "Project Alpha — Monday")
- Restore any saved session with one click
- All sessions stored in Chrome's local storage

---

#### 4. 📋 Tab Overview Popup
A clean popup UI showing:
- Total tabs open
- Tabs grouped by category with count
- Quick action buttons (Group All, Save Session, Clear Ungrouped)

---

### V2 Features (After User Feedback)

- 🔍 **Search across all open tabs** by title or URL
- ⌨️ **Keyboard shortcuts** for power users
- 🏷️ **Custom tab type rules** — add your own domains to groups
- 📌 **Pin important tabs** within a group
- 🕐 **Stale tab detection** — highlight tabs older than X hours

---

### V3 Features (Monetization Phase)

- 🔄 **Sync sessions across devices** via Chrome Sync API
- 👥 **Team workspace sharing** — share tab sessions with teammates
- 📊 **Tab usage analytics** — see which sites you visit most
- 🌙 **Focus Mode** — hide all non-essential groups during deep work

---

## 📁 File Structure

```
devtab-organizer/
│
├── manifest.json              # Extension configuration (Manifest V3)
├── background.js              # Service worker — tab detection & grouping logic
│
├── popup/
│   ├── popup.html             # Popup UI shown when clicking the extension icon
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup interaction logic
│
├── content/
│   └── content.js             # Injected into pages (optional — for future use)
│
├── utils/
│   ├── tabDetector.js         # URL pattern matching & tab type detection
│   ├── sessionManager.js      # Save/restore session logic
│   └── constants.js           # Tab type definitions, colors, domain patterns
│
├── icons/
│   ├── icon16.png             # 16x16 icon (favicon bar)
│   ├── icon32.png             # 32x32 icon
│   ├── icon48.png             # 48x48 icon (extension management page)
│   └── icon128.png            # 128x128 icon (Chrome Web Store)
│
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Structure** | HTML5 | Simple, lightweight popup UI |
| **Styling** | CSS3 | Custom styles, no framework overhead |
| **Logic** | Vanilla JavaScript (ES6+) | No build step, fast, compatible |
| **Storage** | Chrome Storage API | Persistent session saving |
| **Tab Control** | Chrome Tabs API | Read, group, and manage tabs |
| **Grouping** | Chrome TabGroups API | Native visual tab grouping |
| **Background** | Chrome Service Worker | Manifest V3 compliant background logic |

---

## 🔌 Chrome APIs Used

```javascript
// Tab management
chrome.tabs.query()          // Get all open tabs
chrome.tabs.group()          // Add tabs to a group
chrome.tabs.update()         // Update tab properties

// Tab groups
chrome.tabGroups.update()    // Set group color and title
chrome.tabGroups.query()     // Get existing groups

// Storage
chrome.storage.local.get()   // Retrieve saved sessions
chrome.storage.local.set()   // Save sessions

// Runtime
chrome.runtime.onInstalled   // Extension install event
chrome.action.onClicked      // Extension icon click
```

---

## 🔐 Permissions

Declared in `manifest.json`:

```json
{
  "permissions": [
    "tabs",           // Read tab URLs and titles
    "tabGroups",      // Create and manage tab groups
    "storage"         // Save/restore sessions locally
  ],
  "host_permissions": [
    "<all_urls>"      // Required to read tab URLs for detection
  ]
}
```

> **Privacy Note:** DevTab Organizer does NOT collect, transmit, or store any user data externally. All data stays on the user's local machine via Chrome Storage.

---

## 🎨 UI Design

### Popup Layout (400px × 500px)

```
┌─────────────────────────────────┐
│  🗂️ DevTab Organizer        ⚙️  │
│  ─────────────────────────────  │
│  📊 28 tabs open                │
│                                 │
│  Tab Groups:                    │
│  🟤 GitHub            (8 tabs)  │
│  🟠 Stack Overflow    (5 tabs)  │
│  🔵 Documentation     (7 tabs)  │
│  🟣 Project Tools     (3 tabs)  │
│  🟢 AI Tools          (2 tabs)  │
│  ⚪ Other             (3 tabs)  │
│                                 │
│  ─────────────────────────────  │
│  [🔀 Group All Tabs]            │
│  [💾 Save Session]              │
│  [📂 Restore Session ▼]        │
│                                 │
│  Saved Sessions:                │
│  • Project Alpha — Monday       │
│  • Research Session — Fri       │
└─────────────────────────────────┘
```

### Color Scheme

| Element | Color |
|---|---|
| Background | `#1e1e2e` (dark) |
| Card Background | `#2a2a3e` |
| Primary Accent | `#6c63ff` (purple) |
| Text Primary | `#ffffff` |
| Text Secondary | `#a0a0b0` |
| Success | `#4caf50` |
| Border | `#3a3a5c` |

---

## 🧠 Tab Detection Logic

Located in `utils/tabDetector.js`:

```javascript
const TAB_TYPES = {
  GITHUB: {
    name: "GitHub",
    color: "brown",
    patterns: ["github.com", "gitlab.com", "bitbucket.org"]
  },
  STACKOVERFLOW: {
    name: "Stack Overflow",
    color: "orange",
    patterns: ["stackoverflow.com", "stackexchange.com", "superuser.com"]
  },
  DOCS: {
    name: "Documentation",
    color: "blue",
    patterns: ["docs.", "developer.", "mdn.io", "devdocs.io", "w3schools.com", "npmjs.com"]
  },
  PROJECT: {
    name: "Project Tools",
    color: "purple",
    patterns: ["jira.", "linear.app", "notion.so", "trello.com", "asana.com", "clickup.com"]
  },
  AI: {
    name: "AI Tools",
    color: "green",
    patterns: ["chatgpt.com", "claude.ai", "gemini.google.com", "copilot.microsoft.com"]
  },
  OTHER: {
    name: "Other",
    color: "grey",
    patterns: []   // Default fallback
  }
};

function detectTabType(url) {
  for (const [key, type] of Object.entries(TAB_TYPES)) {
    if (key === "OTHER") continue;
    if (type.patterns.some(pattern => url.includes(pattern))) {
      return key;
    }
  }
  return "OTHER";
}
```

---

## 💾 Session Management

Located in `utils/sessionManager.js`:

**Save Session:**
```javascript
async function saveSession(name) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const session = {
    name,
    savedAt: new Date().toISOString(),
    tabs: tabs.map(tab => ({ url: tab.url, title: tab.title }))
  };
  const existing = await chrome.storage.local.get("sessions");
  const sessions = existing.sessions || [];
  sessions.push(session);
  await chrome.storage.local.set({ sessions });
}
```

**Restore Session:**
```javascript
async function restoreSession(sessionIndex) {
  const { sessions } = await chrome.storage.local.get("sessions");
  const session = sessions[sessionIndex];
  for (const tab of session.tabs) {
    await chrome.tabs.create({ url: tab.url });
  }
}
```

---

## 🚀 Development Setup

### Prerequisites
- Google Chrome (latest version)
- A code editor (VS Code recommended)
- Basic knowledge of HTML, CSS, JavaScript

### Steps

```bash
# 1. Create project folder
mkdir devtab-organizer
cd devtab-organizer

# 2. Create all files as per File Structure above
# (Use Claude to generate each file!)

# 3. No build step needed — pure HTML/CSS/JS!
```

---

## 🧪 How to Load in Chrome

```
1. Open Chrome browser
2. Go to: chrome://extensions
3. Enable "Developer Mode" (toggle — top right corner)
4. Click "Load Unpacked"
5. Select your devtab-organizer/ folder
6. Extension appears in toolbar!
7. Click the icon to open the popup
8. Test tab grouping, saving, restoring sessions
```

**Debugging Tips:**
- Right-click extension icon → "Inspect Popup" for popup DevTools
- Go to chrome://extensions → "Service Worker" link for background.js logs
- Paste any errors into Claude for instant fixes!

---

## 🗺️ Roadmap

### Phase 1 — MVP (Week 1–2)
- [ ] `manifest.json` setup
- [ ] Tab detection logic (`tabDetector.js`)
- [ ] Auto-grouping via Chrome TabGroups API
- [ ] Basic popup UI (HTML + CSS)
- [ ] Save & restore sessions
- [ ] Test on Chrome

### Phase 2 — Polish (Week 3–4)
- [ ] Improve UI design and animations
- [ ] Add search across tabs
- [ ] Custom domain rules
- [ ] Keyboard shortcuts
- [ ] Handle edge cases (pinned tabs, incognito, etc.)

### Phase 3 — Launch (Week 5–6)
- [ ] Create extension icons (all sizes)
- [ ] Write Chrome Web Store description
- [ ] Take screenshots for store listing
- [ ] Submit to Chrome Web Store ($5 one-time developer fee)
- [ ] Share on Reddit (r/webdev, r/chrome), Product Hunt, Twitter/X

### Phase 4 — Growth & Monetization
- [ ] Collect user feedback
- [ ] Add cross-device sync (Chrome Sync API)
- [ ] Add team sharing feature
- [ ] Launch Pro plan ($3–5/month)

---

## 💰 Monetization Plan

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 | Auto tab grouping, color coding, 3 saved sessions |
| **Pro** | $4.99/month | Unlimited sessions, cross-device sync, custom rules, analytics |
| **Team** | $9.99/month per user | All Pro features + team session sharing |

**Revenue Goal:**
- 1,000 free users → 100 Pro conversions (10%) → **$499/month**
- 5,000 free users → 500 Pro conversions → **$2,495/month**

---

## 📝 Notes

- **Manifest V3** is required for all new Chrome extensions (V2 is deprecated)
- Use `service_worker` in manifest instead of `background scripts`
- Tab Groups API requires Chrome 89+
- Always test in a fresh Chrome profile to simulate new users
- Keep popup load time under 200ms — users expect instant response

---

*Built with ❤️ for developers who just want to focus on coding.*
