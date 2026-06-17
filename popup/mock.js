// Mock Chrome APIs when running outside of extension context (e.g. previewing popup.html directly)
if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
  console.log('[DevTab Mock] Injecting mock Chrome APIs for local preview.');

  const MOCK_TABS = [
    { id: 1, windowId: 1, url: 'https://github.com/facebook/react/issues', title: 'Issues · facebook/react', groupId: -1, favIconUrl: 'https://github.com/favicon.ico', pinned: false },
    { id: 2, windowId: 1, url: 'https://github.com/google/gemini', title: 'Google Gemini Repo', groupId: -1, favIconUrl: 'https://github.com/favicon.ico', pinned: false },
    { id: 3, windowId: 1, url: 'https://stackoverflow.com/questions/1234', title: 'JavaScript closure help - Stack Overflow', groupId: -1, favIconUrl: '', pinned: false },
    { id: 4, windowId: 1, url: 'https://docs.npmjs.com/cli/v8', title: 'npm CLI Docs', groupId: -1, favIconUrl: '', pinned: false },
    { id: 5, windowId: 1, url: 'https://developer.mozilla.org/en-US/docs/Web/API', title: 'MDN Web Docs', groupId: -1, favIconUrl: '', pinned: false },
    { id: 6, windowId: 1, url: 'https://linear.app/my-workspace/team/DEV', title: 'Active Sprint - Linear', groupId: -1, favIconUrl: '', pinned: false },
    { id: 7, windowId: 1, url: 'https://chatgpt.com/', title: 'ChatGPT', groupId: -1, favIconUrl: '', pinned: false },
    { id: 8, windowId: 1, url: 'https://claude.ai/chat/new', title: 'Claude AI', groupId: -1, favIconUrl: '', pinned: false },
    { id: 9, windowId: 1, url: 'https://google.com/search?q=vite+config', title: 'vite config - Google Search', groupId: -1, favIconUrl: '', pinned: false }
  ];

  window.chrome = {
    runtime: {
      sendMessage: (msg, callback) => {
        console.log('[Mock] sendMessage:', msg);
        if (msg.action === 'GROUP_ALL') {
          setTimeout(() => { if (callback) callback({ success: true }); }, 400);
        }
      },
      getURL: (path) => path, // in mock, just return the relative path
      openOptionsPage: () => {
        window.open('settings.html', '_blank');
      }
    },
    commands: {
      onCommand: { addListener: (fn) => console.log('[Mock] commands.onCommand listener registered') }
    },
    tabs: {
      query: async (queryInfo) => {
        if (queryInfo.currentWindow) return MOCK_TABS.filter(t => t.windowId === 1);
        return MOCK_TABS; // all windows
      },
      create: async (props) => {
        const newTab = { id: Math.floor(Math.random() * 9000) + 1000, windowId: 1, ...props };
        console.log('[Mock] tabs.create:', newTab);
        return newTab;
      },
      update: async (tabId, props) => {
        console.log('[Mock] tabs.update:', tabId, props);
        return { id: tabId, ...props };
      },
      group: async (options) => {
        console.log('[Mock] tabs.group:', options);
        return Math.floor(Math.random() * 1000);
      }
    },
    tabGroups: {
      TAB_GROUP_ID_NONE: -1,
      query: async (queryInfo) => {
        console.log('[Mock] tabGroups.query:', queryInfo);
        return [];
      },
      update: async (groupId, props) => {
        console.log('[Mock] tabGroups.update:', groupId, props);
        return { id: groupId, ...props };
      },
      get: async (groupId) => {
        console.log('[Mock] tabGroups.get:', groupId);
        return { id: groupId, title: 'Mock Group', color: 'blue' };
      }
    },
    windows: {
      getCurrent: async () => ({ id: 1 }),
      getAll: async () => [{ id: 1 }],
      update: async (windowId, props) => {
        console.log('[Mock] windows.update:', windowId, props);
        return { id: windowId, ...props };
      },
      WINDOW_ID_CURRENT: -2
    },
    storage: {
      local: {
        get: async (keys) => {
          const keyList = typeof keys === 'string' ? [keys] : (Array.isArray(keys) ? keys : Object.keys(keys));
          const result = {};
          for (const key of keyList) {
            const raw = localStorage.getItem(`mock_${key}`);
            if (raw) {
              try { result[key] = JSON.parse(raw); } catch (_) {}
            }
          }
          // Inject default mock session if none saved yet
          if (keyList.includes('sessions') && !result.sessions) {
            result.sessions = [
              {
                name: 'React Development',
                savedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                groups: [
                  { title: 'GitHub', color: 'grey', collapsed: false, tabs: [
                    { url: 'https://github.com/facebook/react', title: 'react repo' }
                  ]},
                  { title: 'Documentation', color: 'blue', collapsed: false, tabs: [
                    { url: 'https://developer.mozilla.org', title: 'MDN' }
                  ]}
                ],
                ungrouped: [{ url: 'https://google.com', title: 'Google Search' }]
              }
            ];
          }
          if (keyList.includes('settings') && !result.settings) {
            result.settings = { autoGrouping: false };
          }
          if (keyList.includes('customRules') && !result.customRules) {
            result.customRules = [];
          }
          return result;
        },
        set: async (data) => {
          for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(`mock_${key}`, JSON.stringify(value));
          }
          console.log('[Mock] storage.local.set:', Object.keys(data));
        }
      }
    }
  };
}
