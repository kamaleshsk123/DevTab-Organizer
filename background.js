import { TAB_TYPES } from "./utils/constants.js";
import { detectTabType } from "./utils/tabDetector.js";

// ----- Helpers -----

/** Load user-defined custom rules from storage */
async function getCustomRules() {
  const data = await chrome.storage.local.get("customRules");
  return data.customRules || [];
}

/** Returns true if this URL should be skipped from auto-grouping */
function shouldSkipUrl(url) {
  if (!url) return true;
  const SKIP_PREFIXES = [
    "chrome://",
    "chrome-extension://",
    "about:",
    "edge://",
    "data:",
  ];
  return SKIP_PREFIXES.some((prefix) => url.startsWith(prefix));
}

// ----- Core Grouping Logic -----

/** Group all non-pinned, non-system tabs in a window by category */
async function groupAllTabs(windowId) {
  const tabs = await chrome.tabs.query({ windowId, pinned: false });

  // --- OPTION A: Ungroup all tabs first ---
  // By ungrouping, we force Chrome to destroy the existing groups (and remove them
  // from the Saved Tab Groups bookmarks bar), preventing duplicates from accumulating.
  const groupedTabIds = tabs
    .filter((t) => t.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE)
    .map((t) => t.id);
  if (groupedTabIds.length > 0) {
    try {
      await chrome.tabs.ungroup(groupedTabIds);
    } catch (err) {
      console.warn("[DevTab] Pre-ungrouping failed:", err);
    }
  }

  const customRules = await getCustomRules();
  const settingsData = await chrome.storage.local.get("settings");
  const groupOther = settingsData.settings?.groupOther !== false;

  // Accumulate tabs per category key
  const categoryToTabs = {};
  for (const tab of tabs) {
    if (shouldSkipUrl(tab.url)) continue;
    const category = detectTabType(tab.url, customRules);
    if (category === "OTHER" && !groupOther) continue;
    if (!categoryToTabs[category]) categoryToTabs[category] = [];
    categoryToTabs[category].push(tab);
  }

  // For each category, put tabs into a new group.
  for (const [categoryKey, categoryTabs] of Object.entries(categoryToTabs)) {
    if (categoryTabs.length === 0) continue;
    const typeDef = TAB_TYPES[categoryKey];
    if (!typeDef) continue;
    const tabIds = categoryTabs.map((t) => t.id);

    try {
      // Since we just ungrouped everything, we can safely create brand new groups
      const newGroupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(newGroupId, {
        title: typeDef.name,
        color: typeDef.color,
      });
    } catch (err) {
      console.warn(`[DevTab] Failed to group category "${categoryKey}":`, err);
    }
  }
}

// ----- Keyboard Shortcut Listener -----

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "group-all-tabs") {
    const [win] = await chrome.windows.getAll({ windowTypes: ["normal"] });
    if (win) await groupAllTabs(win.id);
  }
});

// ----- Startup Auto-Consolidation -----
// On every browser launch, we force a re-grouping if auto-grouping is enabled.
// Because groupAllTabs now ungroups everything first, this automatically cleans
// up any duplicate saved groups in the bookmarks bar that Chrome restored.

chrome.runtime.onStartup.addListener(async () => {
  try {
    const data = await chrome.storage.local.get("settings");
    const autoGroupEnabled = data.settings?.autoGrouping || false;
    if (!autoGroupEnabled) return;

    // Short delay to allow Chrome to finish restoring all session tabs
    await new Promise((resolve) => setTimeout(resolve, 800));

    const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
    for (const win of windows) {
      await groupAllTabs(win.id);
    }
  } catch (err) {
    console.warn("[DevTab] Startup consolidation failed:", err);
  }
});

// ----- Auto-Grouping on Tab URL Change -----

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  try {
    const data = await chrome.storage.local.get("settings");
    const autoGroupEnabled = data.settings?.autoGrouping || false;
    if (!autoGroupEnabled) return;

    if (tab.pinned || shouldSkipUrl(tab.url)) return;

    const customRules = await getCustomRules();
    const categoryKey = detectTabType(tab.url, customRules);
    const typeDef = TAB_TYPES[categoryKey];
    if (!typeDef) return;

    const groupOther = data.settings?.groupOther !== false;
    if (categoryKey === "OTHER" && !groupOther) return;

    // Skip if already in the correct group
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      try {
        const currentGroup = await chrome.tabGroups.get(tab.groupId);
        if (currentGroup.title === typeDef.name) return;
      } catch (_) {
        // Group was removed; proceed to re-group
      }
    }

    const existingGroups = await chrome.tabGroups.query({
      windowId: tab.windowId,
    });
    const existingGroup = existingGroups.find((g) => g.title === typeDef.name);

    if (existingGroup) {
      await chrome.tabs.group({ groupId: existingGroup.id, tabIds: [tabId] });
    } else {
      const newGroupId = await chrome.tabs.group({ tabIds: [tabId] });
      await chrome.tabGroups.update(newGroupId, {
        title: typeDef.name,
        color: typeDef.color,
      });
    }
  } catch (err) {
    console.warn("[DevTab] Auto-group error:", err);
  }
});

// ----- Message Listener (from popup) -----

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GROUP_ALL") {
    chrome.windows.getCurrent(async (win) => {
      try {
        await groupAllTabs(win.id);
        sendResponse({ success: true });
      } catch (err) {
        console.error("[DevTab] Group all failed:", err);
        sendResponse({ success: false, error: err.message });
      }
    });
    return true; // Keep async channel open
  }
});
// ----- Omnibox Integration -----

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const query = text.toLowerCase();
  const tabs = await chrome.tabs.query({});

  const suggestions = [];
  for (const tab of tabs) {
    if (
      tab.title?.toLowerCase().includes(query) ||
      tab.url?.toLowerCase().includes(query)
    ) {
      suggestions.push({
        content: `tab:${tab.id}:${tab.windowId}`,
        description: `<url>${escapeXml(tab.title || "Untitled")}</url> - <dim>${escapeXml(tab.url)}</dim>`,
      });
    }
  }
  suggest(suggestions.slice(0, 5));
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  if (text.startsWith("tab:")) {
    const parts = text.split(":");
    const tabId = parseInt(parts[1], 10);
    const windowId = parseInt(parts[2], 10);
    if (tabId && windowId) {
      await chrome.windows.update(windowId, { focused: true });
      await chrome.tabs.update(tabId, { active: true });
    }
  } else {
    // If they just hit enter on the query itself, maybe focus the first match?
    const query = text.toLowerCase();
    const tabs = await chrome.tabs.query({});
    const match = tabs.find(
      (t) =>
        t.title?.toLowerCase().includes(query) ||
        t.url?.toLowerCase().includes(query),
    );
    if (match) {
      await chrome.windows.update(match.windowId, { focused: true });
      await chrome.tabs.update(match.id, { active: true });
    }
  }
});
