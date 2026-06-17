export const TAB_TYPES = {
  GITHUB: {
    id: "GITHUB",
    name: "GitHub",
    shortName: "GitHub",
    color: "grey", // Chrome tabGroups supported: grey, blue, red, yellow, green, pink, purple, cyan, orange
    patterns: ["github.com", "gitlab.com", "bitbucket.org"]
  },
  STACKOVERFLOW: {
    id: "STACKOVERFLOW",
    name: "Stack Overflow",
    shortName: "StackFlow",
    color: "orange",
    patterns: ["stackoverflow.com", "stackexchange.com", "superuser.com"]
  },
  DOCS: {
    id: "DOCS",
    name: "Documentation",
    shortName: "Docs",
    color: "blue",
    patterns: ["docs.", "developer.", "mdn.io", "devdocs.io", "w3schools.com", "npmjs.com", "dev.to", "medium.com"]
  },
  PROJECT: {
    id: "PROJECT",
    name: "Project Tools",
    shortName: "Projects",
    color: "purple",
    patterns: ["jira.", "linear.app", "notion.so", "trello.com", "asana.com", "clickup.com"]
  },
  AI: {
    id: "AI",
    name: "AI Tools",
    shortName: "AI Tools",
    color: "green",
    patterns: ["chatgpt.com", "claude.ai", "gemini.google.com", "copilot.microsoft.com", "v0.dev"]
  },
  OTHER: {
    id: "OTHER",
    name: "Other",
    shortName: "Other",
    color: "cyan",
    patterns: []
  }
};
