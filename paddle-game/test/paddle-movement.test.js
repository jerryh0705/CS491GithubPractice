// Property-based test for paddle directional movement.
//
// Property 1: Paddle moves at fixed speed in the pressed direction.
//
// updatePaddle(state) is pure (no DOM/canvas access), so it can be exercised
// directly via the window.Game namespace loaded into jsdom by loadGame().
// We generate random ACTIVE states with exactly one of keys.left/keys.right
// pressed and a paddle starting x that may be in or out of canvas bounds
// (negative or past the right edge). For the cases where the move does not
// reach a boundary — i.e. the post-move position already lies within
// [0, CANVAS_WIDTH - PADDLE_WIDTH] so clampPaddle does not intervene — we
// assert paddle.x changes by exactly PADDLE_SPEED toward the pressed edge.
// For every case we additionally assert the paddle ends up in bounds.
//
// **Validates: Requirements 1.1, 1.2**

import { loadGame } from './loadGame.js';
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

const Game = loadGame();
const { CANVAS_WIDTH, PADDLE_WIDTH, PADDLE_SPEED, STATES } = Game;
// Rightmost in-bounds left edge for the paddle (CANVAS_WIDTH - paddle.width).
const MAX_X = CANVAS_WIDTH - PADDLE_WIDTH;

describe('Property 1: Paddle moves at fixed speed in the pressed direction', () => {
  /* Feature: paddle-ball-game, Property 1: Paddle moves at fixed speed in the pressed direction */
  it('an ACTIVE paddle with exactly one key pressed moves by exactly PADDLE_SPEED toward that edge when the move does not reach a boundary', () => {
    fc.assert(
      fc.property(
        // Direction of the single pressed key (exactly one of left/right).
        fc.constantFrom('left', 'right'),
        // Paddle left-edge x, deliberately including out-of-bounds starts
        // (negative or past the right edge) so the generator covers the full
        // range. The exact-movement assertion is gated to the non-boundary
        // cases inside the property below.
        fc.integer({ min: -50, max: CANVAS_WIDTH + 50 }),
        (dir, startX) => {
          // Build an ACTIVE state with the single key pressed.
          const state = Game.createInitialState();
          state.status = STATES.ACTIVE;
          state.paddle.x = startX;
          state.keys = { left: dir === 'left', right: dir === 'right' };

          const oldX = state.paddle.x;
          Game.updatePaddle(state);
          const newX = state.paddle.x;

          // Position after the move, before clamping.
          const movedX = dir === 'left' ? startX - PADDLE_SPEED : startX + PADDLE_SPEED;

          // The exact-movement invariant holds only when the move does not
          // reach a boundary: the post-move position is already within
          // [0, MAX_X], so clampPaddle leaves it untouched.
          const withinBounds = movedX >= 0 && movedX <= MAX_X;
          if (withinBounds) {
            // paddle.x changed by exactly PADDLE_SPEED toward the pressed edge
            // (decreasing for left, increasing for right). (Requirements 1.1, 1.2)
            expect(newX - oldX).toBe(dir === 'left' ? -PADDLE_SPEED : PADDLE_SPEED);
            expect(newX).toBe(movedX);
          }

          // The paddle must always end up within the canvas bounds, even for
          // out-of-bounds starts (clampPaddle invariant). This guards the
          // out-of-bounds generated values the arbitrary is designed to cover.
          expect(newX).toBeGreaterThanOrEqual(0);
          expect(newX).toBeLessThanOrEqual(MAX_X);

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
