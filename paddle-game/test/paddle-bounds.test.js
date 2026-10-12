// Property-based test for paddle bounds.
//
// Property 2: Paddle stays within canvas bounds.
//
// updatePaddle(state) only moves the paddle while the game is ACTIVE; in
// terminal states (GAME_OVER / WIN) it returns the state unchanged, so key
// presses can never drive the paddle out of bounds. While ACTIVE it applies the
// movement and then calls clampPaddle, which clamps paddle.x to
// [0, CANVAS_WIDTH - paddle.width]. Together this guarantees Requirement 1.3:
// "WHILE the Paddle is moving, the Paddle SHALL remain within the horizontal
// boundaries of the Canvas."
//
// The arbitrary covers every status (ACTIVE plus both terminal states) and
// starts the paddle anywhere from well left of the canvas to well past the
// right edge, so the clamp safety net is exercised from out-of-bounds starts.
//
// Note on scope: the bounds invariant is asserted for ACTIVE states, where the
// paddle moves and is clamped (Req 1.3 is "while moving"). In terminal states
// the paddle does not move at all, so we instead assert it is unchanged — key
// presses cannot move it, in or out of bounds.
//
// **Validates: Requirements 1.3**

import { loadGame } from './loadGame.js';
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

const Game = loadGame();

// Arbitrary start x spanning well outside both canvas edges, so out-of-bounds
// starts (negative and past the right edge) are generated alongside in-bounds.
const startXArb = fc.integer({ min: -100, max: Game.CANVAS_WIDTH + 100 });

// Any combination of left/right key presses.
const keysArb = fc.record({
  left: fc.boolean(),
  right: fc.boolean(),
});

// Every game status: ACTIVE (paddle moves) plus both terminal states (no move).
const statusArb = fc.constantFrom(
  Game.STATES.ACTIVE,
  Game.STATES.GAME_OVER,
  Game.STATES.WIN,
);

const stateInputArb = fc.record({
  startX: startXArb,
  keys: keysArb,
  status: statusArb,
});

describe('Property 2: Paddle stays within canvas bounds', () => {
  /* Feature: paddle-ball-game, Property 2: Paddle stays within canvas bounds */
  it('after one updatePaddle step the paddle is within canvas bounds (or unmoved in terminal states)', () => {
    fc.assert(
      fc.property(stateInputArb, ({ startX, keys, status }) => {
        const state = Game.createInitialState();
        state.status = status;
        state.paddle.x = startX;
        state.keys = { left: keys.left, right: keys.right };
        Game.updatePaddle(state);

        if (status === Game.STATES.ACTIVE) {
          // While moving (Active), the paddle stays within the horizontal
          // boundaries of the canvas (Requirement 1.3). The clamp keeps it
          // in bounds even from an out-of-bounds start.
          expect(state.paddle.x).toBeGreaterThanOrEqual(0);
          expect(state.paddle.x).toBeLessThanOrEqual(
            Game.CANVAS_WIDTH - state.paddle.width,
          );
        } else {
          // In terminal states the paddle does not move (updatePaddle returns
          // early), so key presses cannot drive it out of bounds: its x is
          // unchanged from the start.
          expect(state.paddle.x).toBe(startX);
        }
        return true;
      }),
      { numRuns: 100 },
    );
  });

  // Explicit edge cases that make the out-of-bounds coverage unambiguous.

  it('clamps a paddle starting left of the canvas to within bounds in ACTIVE', () => {
    const keyCombos = [
      { left: true, right: false },
      { left: false, right: true },
      { left: true, right: true },
      { left: false, right: false },
    ];
    for (const keys of keyCombos) {
      const state = Game.createInitialState();
      state.status = Game.STATES.ACTIVE;
      state.paddle.x = -50; // well left of the canvas
      state.keys = keys;
      Game.updatePaddle(state);
      expect(state.paddle.x).toBeGreaterThanOrEqual(0);
      expect(state.paddle.x).toBeLessThanOrEqual(
        Game.CANVAS_WIDTH - state.paddle.width,
      );
    }
  });

  it('clamps a paddle starting past the right edge to the right boundary in ACTIVE', () => {
    const state = Game.createInitialState();
    state.status = Game.STATES.ACTIVE;
    state.paddle.x = Game.CANVAS_WIDTH + 50; // well past the right edge
    state.keys = { left: false, right: true };
    Game.updatePaddle(state);
    expect(state.paddle.x).toBe(Game.CANVAS_WIDTH - state.paddle.width);
  });

  it('does not move the paddle in terminal states even with keys pressed', () => {
    for (const status of [Game.STATES.GAME_OVER, Game.STATES.WIN]) {
      const state = Game.createInitialState();
      state.status = status;
      state.paddle.x = 123;
      state.keys = { left: true, right: true };
      Game.updatePaddle(state);
      expect(state.paddle.x).toBe(123);
    }
  });
});
