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
  const categorySelect = document.getElementById('rule-category');
  const domain = domainInput.value.trim().toLowerCase();
  const category = categorySelect.value;

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
  showToast(`✅ Rule added: "${domain}" → ${CATEGORY_LABELS[category]}`);
  await renderRules();
}

async function initSettings() {
  const data = await chrome.storage.local.get('settings');
  const toggle = document.getElementById('auto-group-toggle');
  toggle.checked = data.settings?.autoGrouping || false;
  toggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ settings: { autoGrouping: toggle.checked } });

    if (toggle.checked) {
      // Auto was just enabled — immediately group all already-open tabs,
      // not just future navigations. Reuse the GROUP_ALL background handler.
      showToast('⚡ Auto-Group enabled — grouping open tabs...');
      chrome.runtime.sendMessage({ action: 'GROUP_ALL' }, async () => {
        await updateTabStats();
        showToast('✅ All tabs grouped!');
      });
    } else {
      showToast('⏸️ Auto-Group disabled.');
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

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    clearBtn.style.display = query ? 'flex' : 'none';

    if (!query) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
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

    if (filtered.length === 0) {
      resultsEl.innerHTML = '<div class="search-no-results">No matching tabs found.</div>';
      return;
    }

    filtered.slice(0, 10).forEach(tab => {
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
    input.focus();
  });

  // Close results on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      clearBtn.style.display = 'none';
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
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
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await updateTabStats();
  await updateSessionsList();
  await initSettings();
  initSearch();
  bindEvents();
});
