import { TAB_TYPES } from './constants.js';

/**
 * Detects the category of a tab based on its URL.
 * Custom user rules are checked first and take priority over built-in patterns.
 *
 * @param {string} url - The URL of the tab.
 * @param {Array<{domain: string, category: string}>} customRules - Optional user-defined rules.
 * @returns {string} The key representing the tab type (e.g., 'GITHUB', 'AI', 'OTHER').
 */
export function detectTabType(url, customRules = []) {
  if (!url) return 'OTHER';

  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch (_) {
    // Fallback for malformed URLs — use raw string matching
    host = url.toLowerCase();
  }

  // 1. Check user-defined custom rules first (they always take priority)
  for (const rule of customRules) {
    if (!rule.domain || !rule.category) continue;
    const normalizedDomain = rule.domain.toLowerCase().trim();
    if (host.includes(normalizedDomain)) {
      return rule.category; // e.g. 'PROJECT', 'DOCS', etc.
    }
  }

  // 2. Fall back to built-in patterns
  for (const [key, type] of Object.entries(TAB_TYPES)) {
    if (key === 'OTHER') continue;
    const isMatch = type.patterns.some(pattern => {
      if (pattern.endsWith('.')) {
        return host.startsWith(pattern) || host.includes('.' + pattern);
      }
      return host.includes(pattern);
    });
    if (isMatch) return key;
  }

  return 'OTHER';
}
