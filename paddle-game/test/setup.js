// Vitest setup file — runs once before the test suite in the jsdom environment.
//
// jsdom gives us `window`, `document`, and the DOM APIs the inline game script
// touches. jsdom does NOT provide two things the script needs, so we add them
// here:
//
//   1. requestAnimationFrame / cancelAnimationFrame — jsdom may omit these.
//      We provide them as NO-OPs that return/cancel an id. This is deliberate:
//      the game's `requestAnimationFrame(loop)` would otherwise schedule a
//      recursive setTimeout chain that mutates state and spawns timers for the
//      whole test run. Tests exercise the pure logic via `window.Game.*`
//      directly, so the loop never needs to actually fire here.
//
//   2. canvas.getContext('2d') — jsdom has no canvas backend and returns null
//      by default. We stub HTMLCanvasElement.prototype.getContext to return a
//      no-op 2d context so rendering functions run without a real canvas.

// ---------------------------------------------------------------------------
// requestAnimationFrame / cancelAnimationFrame (no-op)
// ---------------------------------------------------------------------------
if (typeof globalThis.requestAnimationFrame !== 'function') {
  let nextId = 1;
  globalThis.requestAnimationFrame = () => nextId++;
} else {
  // Even if jsdom provides one, replace it with a no-op so the game loop does
  // not run (and recurse) during tests.
  let nextId = 1;
  globalThis.requestAnimationFrame = () => nextId++;
}
if (typeof globalThis.cancelAnimationFrame !== 'function') {
  globalThis.cancelAnimationFrame = () => {};
} else {
  globalThis.cancelAnimationFrame = () => {};
}

// ---------------------------------------------------------------------------
// Stub 2d canvas context
// ---------------------------------------------------------------------------
// Returns a context object whose methods are all no-ops and whose state
// properties are writable, mirroring the subset of the CanvasRenderingContext2D
// API the renderer uses (and any reasonable extension later tasks add).
function createStub2dContext() {
  const noop = () => {};
  return {
    canvas: null,
    // Drawing state (writable, like a real context)
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    // Path & drawing methods
    save: noop,
    restore: noop,
    scale: noop,
    rotate: noop,
    translate: noop,
    transform: noop,
    setTransform: noop,
    resetTransform: noop,
    clearRect: noop,
    fillRect: noop,
    strokeRect: noop,
    rect: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: noop,
    arcTo: noop,
    ellipse: noop,
    bezierCurveTo: noop,
    quadraticCurveTo: noop,
    fill: noop,
    stroke: noop,
    clip: noop,
    fillText: noop,
    strokeText: noop,
    measureText: () => ({ width: 0 }),
    drawImage: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createConicGradient: () => ({ addColorStop: noop }),
    createPattern: () => ({ setTransform: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0 }),
    putImageData: noop,
  };
}

// Patch HTMLCanvasElement.prototype.getContext so any <canvas> in the jsdom
// document returns our stub 2d context. jsdom's default getContext returns null,
// which would break the game's context guard (Task 10.2) and all rendering.
const CanvasCtor =
  typeof HTMLCanvasElement !== 'undefined'
    ? HTMLCanvasElement
    : typeof window !== 'undefined'
      ? window.HTMLCanvasElement
      : undefined;

if (CanvasCtor && CanvasCtor.prototype) {
  CanvasCtor.prototype.getContext = function getContext(type) {
    if (type === '2d') {
      const ctx = createStub2dContext();
      ctx.canvas = this;
      return ctx;
    }
    // The game only ever requests a '2d' context; return null for anything
    // else, matching browser behaviour for unsupported context types.
    return null;
  };
}
