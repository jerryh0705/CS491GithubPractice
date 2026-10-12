// Loader: reads index.html, populates the jsdom document with its DOM, then
// evaluates the inline <script> in the global scope so `window.Game` (the
// testable pure-logic namespace) becomes available to tests.
//
// Why populate the DOM too? Later tasks' inline script reaches for
// `document.getElementById('canvas')`, the score node, and the restart button
// at load time. If the jsdom document were empty those lookups would return
// null and the script could throw. So we copy index.html's <head> and <body>
// content into the live jsdom document first, then run the script.
//
// The inline script must NOT be a module (index.html uses a classic inline
// <script>), so `new Function` is the right tool to run it in global scope.
//
// Requires the Vitest jsdom environment + test/setup.js so that `window`,
// `document`, `requestAnimationFrame`, and `canvas.getContext('2d')` exist.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Resolve once relative to the project root (cwd is the workspace root under
// Vitest). Falling back to the directory of this file keeps it robust.
const INDEX_HTML = (() => {
  const candidates = [
    resolve(process.cwd(), 'index.html'),
    resolve(process.cwd(), 'paddle-game', 'index.html'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Default to the standard location so the error message is helpful.
  return resolve(process.cwd(), 'index.html');
})();

// Cache the loaded namespace so the script is evaluated only once per test
// file (avoids duplicate event listeners and re-declarations).
let cachedGame = null;

/**
 * Loads index.html into the jsdom environment and returns the `window.Game`
 * namespace exported by its inline <script>.
 *
 * @returns {object} the `window.Game` namespace
 * @throws {Error} if index.html is missing, has no inline <script>, or the
 *   script does not define `window.Game`.
 */
export function loadGame() {
  if (cachedGame) return cachedGame;

  if (!existsSync(INDEX_HTML)) {
    throw new Error(
      `loadGame: index.html not found at ${INDEX_HTML}. ` +
        'Task 1.1 creates it; run that first.',
    );
  }

  const html = readFileSync(INDEX_HTML, 'utf8');

  // Parse the page without executing scripts, then copy <head> and <body>
  // contents into the live jsdom document so the page's elements exist.
  populateDocument(html);

  // Evaluate every inline (no src) <script> in global scope, in document
  // order. `new Function` runs in the global scope, so `window.Game = ...`
  // inside the script assigns to the jsdom `window` object that tests share.
  const inlineScripts = extractInlineScripts(html);
  if (inlineScripts.length === 0) {
    throw new Error('loadGame: no inline <script> element found in index.html');
  }
  for (const code of inlineScripts) {
    // eslint-disable-next-line no-new-func
    new Function(code).call(globalThis);
  }

  cachedGame = typeof window !== 'undefined' ? window.Game : globalThis.Game;
  if (!cachedGame) {
    throw new Error(
      'loadGame: the inline script ran but did not define `window.Game`. ' +
        'Ensure Task 1.1 creates the `window.Game = {}` namespace.',
    );
  }
  return cachedGame;
}

/**
 * Parse `html` with DOMParser (no script execution) and copy the parsed
 * <head> and <body> inner HTML into the live jsdom document.
 */
function populateDocument(html) {
  const parser =
    typeof DOMParser !== 'undefined'
      ? new DOMParser()
      : typeof window !== 'undefined'
        ? new window.DOMParser()
        : null;
  if (!parser) return; // No DOMParser available; nothing to populate.

  const parsed = parser.parseFromString(html, 'text/html');
  if (parsed.head) document.head.innerHTML = parsed.head.innerHTML;
  if (parsed.body) document.body.innerHTML = parsed.body.innerHTML;
}

/**
 * Extract the source of every inline <script> (those without a `src`
 * attribute), preserving document order. Uses DOMParser when available,
 * with a regex fallback.
 */
function extractInlineScripts(html) {
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const scripts = Array.from(doc.querySelectorAll('script'));
      const inline = scripts
        .filter((el) => !el.hasAttribute('src'))
        .map((el) => (el.textContent || '').trim())
        .filter(Boolean);
      if (inline.length > 0) return inline;
    } catch {
      // fall through to regex
    }
  }
  // Regex fallback: capture inline <script> bodies without a src attribute.
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (/\bsrc\s*=/i.test(m[1] || '')) continue;
    const body = (m[2] || '').trim();
    if (body) out.push(body);
  }
  return out;
}
