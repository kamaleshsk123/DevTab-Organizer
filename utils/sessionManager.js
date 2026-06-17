/**
 * Retrieves all saved sessions from chrome.storage.local.
 * @returns {Promise<Array>} List of saved session objects.
 */
export async function getSessions() {
  const result = await chrome.storage.local.get('sessions');
  return result.sessions || [];
}

/**
 * Saves the current window's tab state, preserving tab grouping names and colors.
 * @param {string} name - The custom name for the saved session.
 * @returns {Promise<Object>} The saved session object.
 */
export async function saveSession(name) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const currentWindow = await chrome.windows.getCurrent();
  const groups = await chrome.tabGroups.query({ windowId: currentWindow.id });
  const groupMap = new Map(groups.map(g => [g.id, g]));

  const sessionGroups = {};
  const ungroupedTabs = [];

  for (const tab of tabs) {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      continue;
    }
    const tabData = { url: tab.url, title: tab.title };

    if (tab.groupId !== -1 && groupMap.has(tab.groupId)) {
      const g = groupMap.get(tab.groupId);
      if (!sessionGroups[tab.groupId]) {
        sessionGroups[tab.groupId] = {
          title: g.title,
          color: g.color,
          collapsed: g.collapsed,
          tabs: []
        };
      }
      sessionGroups[tab.groupId].tabs.push(tabData);
    } else {
      ungroupedTabs.push(tabData);
    }
  }

  const session = {
    name,
    savedAt: new Date().toISOString(),
    groups: Object.values(sessionGroups),
    ungrouped: ungroupedTabs
  };

  const sessions = await getSessions();
  sessions.push(session);
  await chrome.storage.local.set({ sessions });
  return session;
}

/**
 * Deletes a saved session by its index.
 * @param {number} sessionIndex - Index of the session to delete.
 */
export async function deleteSession(sessionIndex) {
  const sessions = await getSessions();
  if (sessionIndex >= 0 && sessionIndex < sessions.length) {
    sessions.splice(sessionIndex, 1);
    await chrome.storage.local.set({ sessions });
  }
}

/**
 * Restores a saved session, focusing an existing tab if the URL is already open
 * rather than creating a duplicate.
 * @param {number} sessionIndex - Index of the session to restore.
 */
export async function restoreSession(sessionIndex) {
  const sessions = await getSessions();
  const session = sessions[sessionIndex];
  if (!session) return;

  // Build a map of currently open URLs → tab objects for dedup checking
  const openTabs = await chrome.tabs.query({});
  const openUrlMap = new Map(openTabs.map(t => [t.url, t]));

  /**
   * Open or focus a tab by URL.
   * Returns the tab's ID.
   */
  async function openOrFocusTab(url) {
    if (openUrlMap.has(url)) {
      const existingTab = openUrlMap.get(url);
      await chrome.windows.update(existingTab.windowId, { focused: true });
      await chrome.tabs.update(existingTab.id, { active: true });
      return existingTab.id;
    }
    const created = await chrome.tabs.create({ url, active: false });
    return created.id;
  }

  // Restore grouped tabs — recreate each group with its title and color
  for (const group of session.groups) {
    if (!group.tabs || group.tabs.length === 0) continue;
    const tabIds = [];
    for (const tab of group.tabs) {
      try {
        const id = await openOrFocusTab(tab.url);
        tabIds.push(id);
      } catch (err) {
        console.warn('[DevTab] Could not restore tab:', tab.url, err);
      }
    }
    if (tabIds.length === 0) continue;
    try {
      const newGroupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(newGroupId, {
        title: group.title,
        color: group.color,
        collapsed: group.collapsed
      });
    } catch (err) {
      console.warn('[DevTab] Could not restore group:', group.title, err);
    }
  }

  // Restore ungrouped tabs
  for (const tab of session.ungrouped) {
    try {
      await openOrFocusTab(tab.url);
    } catch (err) {
      console.warn('[DevTab] Could not restore ungrouped tab:', tab.url, err);
    }
  }
}
