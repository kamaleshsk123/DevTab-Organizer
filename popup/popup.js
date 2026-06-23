// -- Immediately load theme to prevent Flash of Unstyled Content (FOUC) --
chrome.storage.local.get('settings', (data) => {
  const currentTheme = data.settings?.theme || 'system';
  if (currentTheme !== 'system') {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
});

import { TAB_TYPES } from '../utils/constants.js';
import { detectTabType } from '../utils/tabDetector.js';
import { getSessions, saveSession, deleteSession, restoreSession } from '../utils/sessionManager.js';

// ─── Toast System ────────────────────────────────────────────────────────────

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 2500);
}

// ─── Tab Stats & Category Grid ────────────────────────────────────────────────

async function updateTabStats() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  document.getElementById('total-tabs-count').textContent = tabs.length;

  const tabCounts = {};
  for (const key of Object.keys(TAB_TYPES)) tabCounts[key] = 0;

  const data = await chrome.storage.local.get('customRules');
  const customRules = data.customRules || [];

  for (const tab of tabs) {
    if (tab.url) {
      const type = detectTabType(tab.url, customRules);
      tabCounts[type] = (tabCounts[type] || 0) + 1;
    } else {
      tabCounts['OTHER'] = (tabCounts['OTHER'] || 0) + 1;
    }
  }

  renderCategoryStats(tabCounts);
}

function renderCategoryStats(tabCounts) {
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';
  for (const [key, type] of Object.entries(TAB_TYPES)) {
    const count = tabCounts[key] || 0;
    const chip = document.createElement('div');
    chip.className = 'category-chip';
    chip.innerHTML = `
      <div class="chip-header">
        <span class="dot ${type.color}"></span>
        <span class="chip-name">${type.shortName || type.name}</span>
      </div>
      <span class="chip-count">${count}</span>
    `;
    grid.appendChild(chip);
  }
}

// ─── Sessions List ────────────────────────────────────────────────────────────

async function updateSessionsList() {
  const list = document.getElementById('sessions-list');
  list.innerHTML = '';

  const sessions = await getSessions();
  if (sessions.length === 0) {
    list.innerHTML = '<div class="no-sessions">No saved sessions yet.</div>';
    return;
  }

  sessions.forEach((session, index) => {
    const groupTabCount = (session.groups || []).reduce((acc, g) => acc + (g.tabs?.length || 0), 0);
    const totalTabs = groupTabCount + (session.ungrouped?.length || 0);
    const dateStr = new Date(session.savedAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const item = document.createElement('div');
    item.className = 'session-item';
    item.innerHTML = `
      <div class="session-info">
        <div class="session-name" title="${session.name}">${session.name}</div>
        <div class="session-meta">
          <span>${totalTabs} tabs</span><span>•</span><span>${dateStr}</span>
        </div>
      </div>
      <div class="session-actions">
        <button class="btn-icon-only btn-restore" data-index="${index}" title="Restore Session">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
        <button class="btn-icon-only btn-delete" data-index="${index}" title="Delete Session">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.btn-restore').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      showToast('🔄 Restoring session...');
      await restoreSession(idx);
      window.close();
    });
  });

  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      await deleteSession(idx);
      showToast('🗑️ Session deleted.');
      await updateSessionsList();
    });
  });
}



const CATEGORY_LABELS = {
  GITHUB: 'GitHub', STACKOVERFLOW: 'Stack Overflow', DOCS: 'Docs',
  PROJECT: 'Projects', AI: 'AI Tools', OTHER: 'Other'
};

async function getCustomRules() {
  const data = await chrome.storage.local.get('customRules');
  return data.customRules || [];
}

async function saveCustomRules(rules) {
  await chrome.storage.local.set({ customRules: rules });
}

async function renderRules() {
  const rules = await getCustomRules();
  const list = document.getElementById('rules-list');
  const badge = document.getElementById('rules-badge');
  if (badge) badge.textContent = rules.length;

  if (rules.length === 0) {
    list.innerHTML = '<div class="no-rules">No custom rules yet.</div>';
    return;
  }

  list.innerHTML = '';
  rules.forEach((rule, index) => {
    const item = document.createElement('div');
    item.className = 'rule-item';
    item.innerHTML = `
      <span class="rule-domain" title="${rule.domain}">${rule.domain}</span>
      <span class="rule-arrow">→</span>
      <span class="rule-category-badge badge-${rule.category}">${CATEGORY_LABELS[rule.category] || rule.category}</span>
      <button class="btn-delete-rule" data-index="${index}" title="Delete rule">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.btn-delete-rule').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      const rules = await getCustomRules();
      const removed = rules.splice(idx, 1);
      await saveCustomRules(rules);
      showToast(`🗑️ Rule removed: "${removed[0]?.domain}"`);
      await renderRules();
    });
  });
}

async function addCustomRule() {
  const domainInput = document.getElementById('rule-domain');
  const categorySelect = document.getElementById('rule-category-select');
  const domain = domainInput.value.trim().toLowerCase();
  const category = categorySelect.getAttribute('data-value');

  if (!domain) {
    domainInput.focus();
    domainInput.style.borderColor = 'var(--color-red)';
    setTimeout(() => { domainInput.style.borderColor = ''; }, 1200);
    return;
  }
  if (domain.includes('://')) {
    showToast('⚠️ Enter just the domain, not a full URL.');
    return;
  }
  const rules = await getCustomRules();
  if (rules.some(r => r.domain === domain)) {
    showToast('⚠️ A rule for this domain already exists.');
    return;
  }
  rules.push({ domain, category });
  await saveCustomRules(rules);
  domainInput.value = '';
  setCustomSelectValue(categorySelect, 'PROJECT');
  showToast(`✅ Rule added: "${domain}" → ${CATEGORY_LABELS[category]}`);
  await renderRules();
}

async function initSettings() {
  const data = await chrome.storage.local.get('settings');
  
  // -- Theme Init --
  const themeSelector = document.getElementById('theme-select');
  const currentTheme = data.settings?.theme || 'system';
  setCustomSelectValue(themeSelector, currentTheme);
  if (currentTheme !== 'system') {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  themeSelector.addEventListener('change', async (e) => {
    const newTheme = e.detail.value;
    if (newTheme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    const currentData = await chrome.storage.local.get('settings');
    const newSettings = { ...currentData.settings, theme: newTheme };
    await chrome.storage.local.set({ settings: newSettings });
  });

  // -- Auto-Group Toggle Init --
  const toggle = document.getElementById('auto-group-toggle');
  toggle.checked = data.settings?.autoGrouping || false;
  toggle.addEventListener('change', async () => {
    const currentData = await chrome.storage.local.get('settings');
    const newSettings = { ...currentData.settings, autoGrouping: toggle.checked };
    await chrome.storage.local.set({ settings: newSettings });

    if (toggle.checked) {
      showToast('⚡ Auto-Group enabled — grouping open tabs...');
      chrome.runtime.sendMessage({ action: 'GROUP_ALL' }, async () => {
        await updateTabStats();
        showToast('✅ All tabs grouped!');
      });
    } else {
      showToast('⏸️ Auto-Group disabled.');
    }
  });

  // -- Group Other Toggle Init --
  const groupOtherToggle = document.getElementById('group-other-toggle');
  groupOtherToggle.checked = data.settings?.groupOther !== false;
  groupOtherToggle.addEventListener('change', async () => {
    const currentData = await chrome.storage.local.get('settings');
    const newSettings = { ...currentData.settings, groupOther: groupOtherToggle.checked };
    await chrome.storage.local.set({ settings: newSettings });
    showToast(groupOtherToggle.checked ? '📁 Grouping "Other" tabs enabled.' : '📂 Grouping "Other" tabs disabled.');
  });

  // -- Export / Import Bindings --
  document.getElementById('btn-export-sessions').addEventListener('click', exportSessions);
  
  const importBtn = document.getElementById('btn-import-sessions');
  const importInput = document.getElementById('import-file-input');
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSessionsImport(file);
      importInput.value = ''; // clear input
    }
  });

  const viewport = document.querySelector('.popup-viewport');

  // Gear icon → open settings panel
  document.getElementById('btn-settings').addEventListener('click', async () => {
    await renderRules();
    viewport.classList.add('settings-open');
  });

  // Back button → return to main panel
  document.getElementById('btn-back').addEventListener('click', () => {
    viewport.classList.remove('settings-open');
  });

  // Add rule button & Enter key
  document.getElementById('btn-add-rule').addEventListener('click', addCustomRule);
  document.getElementById('rule-domain').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCustomRule();
  });
}

// ---- Backup & Restore Helpers ----

async function exportSessions() {
  try {
    const data = await chrome.storage.local.get('sessions');
    const sessions = data.sessions || [];
    if (sessions.length === 0) {
      showToast('⚠️ No saved sessions to export.');
      return;
    }
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtab-sessions-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📤 Sessions exported successfully!');
  } catch (err) {
    console.error(err);
    showToast('❌ Export failed.');
  }
}

async function handleSessionsImport(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        showToast('❌ Invalid file format.');
        return;
      }

      const isValid = imported.every(s => 
        s && typeof s === 'object' && 
        typeof s.name === 'string' &&
        Array.isArray(s.groups) &&
        Array.isArray(s.ungrouped)
      );

      if (!isValid) {
        showToast('❌ Invalid session schema.');
        return;
      }

      const data = await chrome.storage.local.get('sessions');
      const current = data.sessions || [];
      
      let newCount = 0;
      for (const session of imported) {
        if (!current.some(c => c.savedAt === session.savedAt && c.name === session.name)) {
          current.push(session);
          newCount++;
        }
      }

      if (newCount === 0) {
        showToast('ℹ️ Sessions are already imported.');
        return;
      }

      await chrome.storage.local.set({ sessions: current });
      await updateSessionsList();
      showToast(`📥 Imported ${newCount} session${newCount !== 1 ? 's' : ''}!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Import failed: Invalid JSON.');
    }
  };
  reader.readAsText(file);
}

// ─── Search ───────────────────────────────────────────────────────────────────

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    `<em>${text.slice(idx, idx + query.length)}</em>` +
    text.slice(idx + query.length)
  );
}

function initSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const resultsEl = document.getElementById('search-results');
  let selectedIndex = -1;
  let currentTabs = [];

  function updateActiveSelection() {
    const items = resultsEl.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('keyboard-selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('keyboard-selected');
      }
    });
  }

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    clearBtn.style.display = query ? 'flex' : 'none';
    selectedIndex = -1;

    if (!query) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
      currentTabs = [];
      return;
    }

    // Query ALL tabs across ALL windows
    const allTabs = await chrome.tabs.query({});
    const SKIP = ['chrome://', 'chrome-extension://', 'about:'];
    const filtered = allTabs.filter(tab => {
      if (!tab.url || SKIP.some(p => tab.url.startsWith(p))) return false;
      return (
        tab.title?.toLowerCase().includes(query.toLowerCase()) ||
        tab.url?.toLowerCase().includes(query.toLowerCase())
      );
    });

    resultsEl.innerHTML = '';
    resultsEl.style.display = 'block';
    currentTabs = filtered.slice(0, 10);

    if (currentTabs.length === 0) {
      resultsEl.innerHTML = '<div class="search-no-results">No matching tabs found.</div>';
      return;
    }

    currentTabs.forEach((tab, index) => {
      const item = document.createElement('div');
      item.className = 'search-result-item';

      const faviconUrl = tab.favIconUrl;
      const faviconEl = faviconUrl
        ? `<img class="search-result-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">`
        : `<div class="search-result-favicon-placeholder"></div>`;

      let displayUrl = '';
      try { displayUrl = new URL(tab.url).hostname; } catch (_) { displayUrl = tab.url; }

      item.innerHTML = `
        ${faviconEl}
        <div class="search-result-info">
          <div class="search-result-title">${highlightMatch(tab.title || 'Untitled', query)}</div>
          <div class="search-result-url">${highlightMatch(displayUrl, query)}</div>
        </div>
      `;

      item.addEventListener('click', async () => {
        await chrome.windows.update(tab.windowId, { focused: true });
        await chrome.tabs.update(tab.id, { active: true });
        window.close();
      });

      resultsEl.appendChild(item);
    });
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    resultsEl.style.display = 'none';
    resultsEl.innerHTML = '';
    currentTabs = [];
    selectedIndex = -1;
    input.focus();
  });

  // Handle key navigation
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      clearBtn.style.display = 'none';
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
      currentTabs = [];
      selectedIndex = -1;
      return;
    }

    if (currentTabs.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % currentTabs.length;
      updateActiveSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + currentTabs.length) % currentTabs.length;
      updateActiveSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const tab = currentTabs[targetIndex];
      if (tab) {
        await chrome.windows.update(tab.windowId, { focused: true });
        await chrome.tabs.update(tab.id, { active: true });
        window.close();
      }
    }
  });

  // Close results when clicking outside the search area
  document.addEventListener('click', (e) => {
    if (!input.closest('.search-bar-wrapper')?.contains(e.target)) {
      resultsEl.style.display = 'none';
    }
  });
}

// ─── Button Events ────────────────────────────────────────────────────────────

function bindEvents() {
  const groupBtn = document.getElementById('btn-group-all');
  const groupLabel = document.getElementById('btn-group-label');
  const spinner = document.getElementById('group-spinner');

  groupBtn.addEventListener('click', () => {
    // Ripple effect
    groupBtn.classList.remove('ripple');
    void groupBtn.offsetWidth; // force reflow
    groupBtn.classList.add('ripple');
    setTimeout(() => groupBtn.classList.remove('ripple'), 500);

    // Show spinner
    groupBtn.disabled = true;
    groupLabel.style.display = 'none';
    spinner.style.display = 'inline-block';

    chrome.runtime.sendMessage({ action: 'GROUP_ALL' }, async () => {
      await updateTabStats();
      groupBtn.disabled = false;
      groupLabel.style.display = 'inline';
      spinner.style.display = 'none';
      showToast('✅ Tabs grouped successfully!');
    });
  });

  const saveBtn = document.getElementById('btn-save-session');
  saveBtn.addEventListener('click', async () => {
    const input = document.getElementById('session-name-input');
    const name = input.value.trim();
    if (!name) {
      input.focus();
      input.style.borderColor = 'var(--color-red)';
      setTimeout(() => { input.style.borderColor = ''; }, 1200);
      showToast('⚠️ Please enter a session name.');
      return;
    }
    await saveSession(name);
    input.value = '';
    await updateSessionsList();
    showToast(`💾 Session "${name}" saved!`);
  });

  // Enter key on session name input
  document.getElementById('session-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click();
  });

  // Clean duplicate tabs binding
  document.getElementById('btn-clean-duplicates').addEventListener('click', cleanDuplicateTabs);
}

// ---- Deduplication Helper ----

async function cleanDuplicateTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  const urlToTabs = {};
  for (const tab of tabs) {
    if (!tab.url) continue;
    if (!urlToTabs[tab.url]) urlToTabs[tab.url] = [];
    urlToTabs[tab.url].push(tab);
  }

  const tabIdsToRemove = [];
  for (const [url, tabList] of Object.entries(urlToTabs)) {
    if (tabList.length <= 1) continue;
    
    tabList.sort((a, b) => {
      if (a.active) return -1;
      if (b.active) return 1;
      return a.index - b.index;
    });

    const tabsToRemove = tabList.slice(1);
    tabIdsToRemove.push(...tabsToRemove.map(t => t.id));
  }

  if (tabIdsToRemove.length === 0) {
    showToast('🧹 No duplicate tabs found.');
    return;
  }

  await Promise.all(tabIdsToRemove.map(id => chrome.tabs.remove(id)));
  showToast(`🧹 Closed ${tabIdsToRemove.length} duplicate tab${tabIdsToRemove.length !== 1 ? 's' : ''}!`);
  await updateTabStats();
}

// ─── Custom Select Component ──────────────────────────────────────────────────

function setupCustomSelects() {
  const customSelects = document.querySelectorAll('.custom-select');

  customSelects.forEach(select => {
    const trigger = select.querySelector('.custom-select-trigger');
    const triggerText = select.querySelector('.custom-select-trigger-text');
    const options = select.querySelectorAll('.custom-select-option');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      customSelects.forEach(other => {
        if (other !== select) other.classList.remove('open');
      });
      select.classList.toggle('open');
    });

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = option.getAttribute('data-value');
        const label = option.textContent;

        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        select.setAttribute('data-value', value);
        triggerText.textContent = label;
        select.classList.remove('open');

        const event = new CustomEvent('change', { detail: { value } });
        select.dispatchEvent(event);
      });
    });
  });

  document.addEventListener('click', () => {
    customSelects.forEach(select => select.classList.remove('open'));
  });
}

function setCustomSelectValue(selectEl, value) {
  selectEl.setAttribute('data-value', value);
  const option = selectEl.querySelector(`.custom-select-option[data-value="${value}"]`);
  const triggerText = selectEl.querySelector(`.custom-select-trigger-text`);
  const options = selectEl.querySelectorAll('.custom-select-option');
  
  options.forEach(opt => opt.classList.remove('selected'));
  if (option) {
    option.classList.add('selected');
    triggerText.textContent = option.textContent;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  setupCustomSelects();
  await updateTabStats();
  await updateSessionsList();
  await initSettings();
  initSearch();
  bindEvents();
});
