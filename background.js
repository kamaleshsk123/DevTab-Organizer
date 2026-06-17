import { TAB_TYPES } from './utils/constants.js';
import { detectTabType } from './utils/tabDetector.js';

// ----- Helpers -----

/** Load user-defined custom rules from storage */
async function getCustomRules() {
  const data = await chrome.storage.local.get('customRules');
  return data.customRules || [];
}

/** Returns true if this URL should be skipped from auto-grouping */
function shouldSkipUrl(url) {
  if (!url) return true;
  const SKIP_PREFIXES = ['chrome://', 'chrome-extension://', 'about:', 'edge://', 'data:'];
  return SKIP_PREFIXES.some(prefix => url.startsWith(prefix));
}

// ----- Core Grouping Logic -----

/** Group all non-pinned, non-system tabs in a window by category */
async function groupAllTabs(windowId) {
  const tabs = await chrome.tabs.query({ windowId, pinned: false });
  const customRules = await getCustomRules();

  // Accumulate tabs per category key
  const categoryToTabs = {};
  for (const tab of tabs) {
    if (shouldSkipUrl(tab.url)) continue;
    const category = detectTabType(tab.url, customRules);
    if (!categoryToTabs[category]) categoryToTabs[category] = [];
    categoryToTabs[category].push(tab);
  }

  // For each category, put tabs into an existing or new group.
  // IMPORTANT: query groups fresh INSIDE each iteration so that groups created
  // in previous iterations are visible — prevents duplicate groups for same category.
  for (const [categoryKey, categoryTabs] of Object.entries(categoryToTabs)) {
    if (categoryTabs.length === 0) continue;
    const typeDef = TAB_TYPES[categoryKey];
    if (!typeDef) continue;
    const tabIds = categoryTabs.map(t => t.id);

    try {
      // Fresh query every iteration — picks up groups created by previous iterations
      const currentGroups = await chrome.tabGroups.query({ windowId });
      // Find ALL existing groups with this category's name and pick the first
      const matchingGroup = currentGroups.find(g => g.title === typeDef.name);

      if (matchingGroup) {
        // Consolidate — move ALL category tabs into the existing group
        await chrome.tabs.group({ groupId: matchingGroup.id, tabIds });
        // Re-apply color in case the user changed it manually
        await chrome.tabGroups.update(matchingGroup.id, {
          title: typeDef.name,
          color: typeDef.color
        });
      } else {
        // Create a brand new group containing all tabs for this category
        const newGroupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(newGroupId, {
          title: typeDef.name,
          color: typeDef.color
        });
      }
    } catch (err) {
      console.warn(`[DevTab] Failed to group category "${categoryKey}":`, err);
    }
  }
}

// ----- Keyboard Shortcut Listener -----

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'group-all-tabs') {
    const [win] = await chrome.windows.getAll({ windowTypes: ['normal'] });
    if (win) await groupAllTabs(win.id);
  }
});

// ----- Auto-Grouping on Tab URL Change -----

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  try {
    const data = await chrome.storage.local.get('settings');
    const autoGroupEnabled = data.settings?.autoGrouping || false;
    if (!autoGroupEnabled) return;

    if (tab.pinned || shouldSkipUrl(tab.url)) return;

    const customRules = await getCustomRules();
    const categoryKey = detectTabType(tab.url, customRules);
    const typeDef = TAB_TYPES[categoryKey];
    if (!typeDef) return;

    // Skip if already in the correct group
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      try {
        const currentGroup = await chrome.tabGroups.get(tab.groupId);
        if (currentGroup.title === typeDef.name) return;
      } catch (_) {
        // Group was removed; proceed to re-group
      }
    }

    const existingGroups = await chrome.tabGroups.query({ windowId: tab.windowId });
    const existingGroup = existingGroups.find(g => g.title === typeDef.name);

    if (existingGroup) {
      await chrome.tabs.group({ groupId: existingGroup.id, tabIds: [tabId] });
    } else {
      const newGroupId = await chrome.tabs.group({ tabIds: [tabId] });
      await chrome.tabGroups.update(newGroupId, {
        title: typeDef.name,
        color: typeDef.color
      });
    }
  } catch (err) {
    console.warn('[DevTab] Auto-group error:', err);
  }
});

// ----- Message Listener (from popup) -----

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GROUP_ALL') {
    chrome.windows.getCurrent(async (win) => {
      try {
        await groupAllTabs(win.id);
        sendResponse({ success: true });
      } catch (err) {
        console.error('[DevTab] Group all failed:', err);
        sendResponse({ success: false, error: err.message });
      }
    });
    return true; // Keep async channel open
  }
});
