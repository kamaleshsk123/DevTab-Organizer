# DevTab Organizer

![Demo](demo.gif)

**DevTab Organizer** is a smart browser extension that automatically organizes your Chrome tabs into named groups based on their domain, helping you maintain a clean and structured workspace.

## ✨ Features

- **Auto-Grouping**: Automatically groups tabs by domain name (e.g., "GitHub", "Stack Overflow", "Google") when you click the extension icon.
- **Smart Workspaces**: Keeps track of your tab groups and restores them exactly as you left them, even across browser restarts.
- **Clean Interface**: A simple, intuitive popup to view and manage your organized tabs.

## 🚀 Getting Started

### 1. Installation

1.  **Clone or download** this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (toggle in the top-right corner).
4.  Click **Load unpacked**.
5.  Select the directory where you saved the project files.

### 2. How to Use

1.  Open your desired tabs.
2.  Click the **DevTab Organizer** icon in your browser toolbar.
3.  The extension will automatically:
    -   Group all open tabs by domain.
    -   Name the group (e.g., "GitHub", "Localhost", "Documentation").
    -   Color-code the tab group for easy identification.
4.  To restore your workspace later, simply click the icon again. The extension remembers your groups!

## ⚙️ Configuration

You can customize the grouping behavior by modifying the `domains.json` file.

**Example `domains.json`:**
```json
{
  "Mapping": {
    "github.com": "GitHub",
    "localhost": "Localhost",
    "developer.mozilla.org": "MDN"
  },
  "Exclude": [
    "google.com",
    "youtube.com"
  ]
}
```

- **Mapping**: Manually assign custom names to specific domains.
- **Exclude**: Prevent certain domains from being grouped.

## 🛠️ Development

### Prerequisites

-   Node.js (v14 or higher)
-   npm

### Running Locally

1.  **Install dependencies:**
    ```bash
    cd popup
    npm install
    ```

2.  **Start development server:**
    ```bash
    npm run dev
    ```

3.  Open `popup.html` in your browser to view the extension UI.
    *(Note: For the extension to work in Chrome, you still need to load it as an unpacked extension via `chrome://extensions`)*

## 📦 Build for Production

To create a production build:

```bash
cd popup
npm run build
```

This will generate optimized files in the `popup/dist` directory.
