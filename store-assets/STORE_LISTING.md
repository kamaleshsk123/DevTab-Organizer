# Chrome Web Store Listing — DevTab Organizer

---

## Extension Name
DevTab Organizer

## Short Description (132 chars max)
Auto-group tabs by category, save sessions, search across all tabs, and define custom rules — in a beautiful dark-mode popup.

## Category
Productivity

## Language
English

---

## Detailed Description

**Stop drowning in browser tabs. DevTab Organizer automatically sorts your Chrome tabs into smart, color-coded groups — so you can focus on what matters.**

---

### ✨ What it does

**🗂️ One-click Auto-Grouping**
Click "Group All Tabs" (or press Alt+Shift+G from anywhere) and every open tab is instantly sorted into a named, color-coded Chrome Tab Group based on its category: GitHub, Documentation, Stack Overflow, Project Tools, AI Tools, or Other.

**⚡ Live Auto-Group Mode**
Toggle "Auto" ON and DevTab groups every new tab you open — automatically, as it loads. Enabling Auto also instantly groups all already-open tabs, so nothing is missed.

**🔍 Real-Time Tab Search**
Use the built-in search bar to instantly find any open tab across all your Chrome windows. Type a title or URL fragment and click any result to jump directly to that tab.

**💾 Session Manager**
Save your entire tab layout as a named session ("Frontend Sprint", "Bug Hunt", "Research Mode") and restore it later with one click. DevTab is smart enough to focus existing open tabs instead of creating duplicates.

**🏷️ Custom Domain Rules**
Override built-in patterns with your own domain → category mappings. Map `my-company.atlassian.net` to "Project Tools" or `internal-docs.company.com` to "Docs". Rules are set right inside the popup — no options page needed.

**⌨️ Keyboard Shortcut**
Press **Alt+Shift+G** from any tab to group everything without touching the mouse.

---

### 🗂️ Built-in Categories

| Category | Color | Examples |
|---|---|---|
| GitHub | Grey | github.com, gitlab.com |
| Stack Overflow | Orange | stackoverflow.com |
| Docs | Blue | docs.*, developer.*, npmjs.com |
| Projects | Purple | linear.app, notion.so, trello.com |
| AI Tools | Green | chatgpt.com, claude.ai, gemini.google.com |
| Other | Cyan | Everything else |

---

### 🛡️ Privacy First

DevTab Organizer runs **100% locally**. It collects no data, makes no external requests, and stores everything (sessions, rules, settings) only in your local browser storage. No account required. No analytics. No tracking.

---

### 🖥️ Requirements

- Google Chrome (version 88+)
- No additional permissions beyond what's listed

---

### 🔗 Links

- GitHub: https://github.com/kamaleshsk123/DevTab-Organizer
- Privacy Policy: [link to hosted privacy-policy.html]
- Report Issues: https://github.com/kamaleshsk123/DevTab-Organizer/issues

---

## Screenshots (required: min 1, max 5, size: 1280×800 or 640×400)

1. `screenshot_1_grouping.png` — Main popup with "Group All Tabs" feature
*(Add 2-3 more screenshots of search, settings panel, and sessions)*

## Promotional Tile (440×280, optional but recommended)
`promo_tile_440x280.png`

## Icon
`icon128.png` (128×128 PNG)

---

## Submission Checklist

- [x] manifest.json v3 with correct permissions
- [x] PNG icons: 16, 32, 48, 128px
- [x] Short description (≤132 chars)
- [x] Detailed description written
- [x] Category: Productivity
- [x] Promotional tile (440×280)
- [x] At least 1 screenshot (1280×800)
- [x] Privacy policy URL
- [ ] Host privacy-policy.html on GitHub Pages or similar
- [ ] Create .zip of extension files (excluding store-assets/, icons/icon.svg)
- [ ] Pay one-time $5 Chrome Web Store developer fee (if not already paid)
- [ ] Submit at: https://chrome.google.com/webstore/devconsole/

---

## How to create the submission .zip

```bash
cd /home/laptop-hdemo1/Desktop/myCode
zip -r DevTab-Organizer-v2.0.0.zip "DevTab Organizer" \
  --exclude "DevTab Organizer/store-assets/*" \
  --exclude "DevTab Organizer/icons/icon.svg" \
  --exclude "DevTab Organizer/.git/*" \
  --exclude "DevTab Organizer/popup/mock.js"
```

> **Note:** Remove or exclude `mock.js` before submitting — the Chrome Web Store reviewer
> will flag it as the mock Chrome APIs could interfere in ways they don't expect.
> The extension works fine without it in a real Chrome context.
