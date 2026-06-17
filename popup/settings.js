// ---- Storage Helpers ----

async function getCustomRules() {
  const data = await chrome.storage.local.get('customRules');
  return data.customRules || [];
}

async function saveCustomRules(rules) {
  await chrome.storage.local.set({ customRules: rules });
}

// ---- Toast Helper ----

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

// ---- Render Rules ----

const CATEGORY_LABELS = {
  GITHUB: 'GitHub',
  STACKOVERFLOW: 'Stack Overflow',
  DOCS: 'Documentation',
  PROJECT: 'Project Tools',
  AI: 'AI Tools',
  OTHER: 'Other'
};

async function renderRules() {
  const rules = await getCustomRules();
  const list = document.getElementById('rules-list');
  const countEl = document.getElementById('rules-count');

  countEl.textContent = `${rules.length} rule${rules.length !== 1 ? 's' : ''}`;

  if (rules.length === 0) {
    list.innerHTML = '<div class="no-rules">No custom rules yet. Add one above!</div>';
    return;
  }

  list.innerHTML = '';
  rules.forEach((rule, index) => {
    const item = document.createElement('div');
    item.className = 'rule-item';
    item.innerHTML = `
      <span class="rule-domain">${escapeHtml(rule.domain)}</span>
      <span class="rule-arrow">→</span>
      <span class="rule-category-badge badge-${rule.category}">${CATEGORY_LABELS[rule.category] || rule.category}</span>
      <button class="btn-delete-rule" data-index="${index}" title="Delete rule">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" stroke-linecap="round">
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
      showToast(`🗑️ Rule for "${removed[0]?.domain}" removed.`);
      await renderRules();
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Add Rule ----

async function addRule() {
  const domainInput = document.getElementById('rule-domain');
  const categorySelect = document.getElementById('rule-category');

  const domain = domainInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  if (!domain) {
    domainInput.focus();
    domainInput.style.borderColor = '#ef4444';
    setTimeout(() => { domainInput.style.borderColor = ''; }, 1200);
    return;
  }

  // Basic domain sanity check
  if (domain.includes('://')) {
    showToast('⚠️ Enter just the domain, not a full URL.');
    return;
  }

  const rules = await getCustomRules();

  // Prevent duplicates
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

// ---- Init ----

document.addEventListener('DOMContentLoaded', async () => {
  await renderRules();

  document.getElementById('btn-add-rule').addEventListener('click', addRule);

  document.getElementById('rule-domain').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addRule();
  });

  document.getElementById('back-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.history.back();
  });
});
