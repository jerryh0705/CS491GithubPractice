import { defineConfig } from 'vitest/config';

// Vitest configuration for the paddle-ball-game test harness.
//
// - environment: 'jsdom' provides a browser-like `window`/`document` so the
//   inline <script> from index.html can run outside a real browser.
// - setupFiles: test/setup.js installs `requestAnimationFrame` and a stubbed
//   `canvas.getContext('2d')` that jsdom does not provide on its own.
//
// The pure game logic is exposed on `window.Game` (see test/loadGame.js) so
// property-based tests (fast-check) and unit tests can call it directly.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    // Keep test files isolated so each gets a fresh jsdom document and a
    // fresh module registry (the loader's cache is per-file).
    isolate: true,
  },
});
