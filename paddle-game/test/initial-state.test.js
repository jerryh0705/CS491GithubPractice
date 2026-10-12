// Property-based test for the initial game state.
//
// Property 8: Initial state has a single row of bricks and a zero score.
//
// The createInitialState() factory is pure (no DOM/canvas access), so it can be
// exercised directly via the window.Game namespace loaded into jsdom by
// loadGame(). Since it takes no arguments, the fast-check arbitrary only
// drives iteration count — the point is to run the assertion at least 100
// times, catching any non-determinism or shared-state bugs in the factory.
//
// **Validates: Requirements 4.1, 5.1**

import { loadGame } from './loadGame.js';
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

const Game = loadGame();

describe('Property 8: Initial state has a single row of bricks and a zero score', () => {
  /* Feature: paddle-ball-game, Property 8: Initial state has a single row of bricks and a zero score */
  it('createInitialState returns non-empty single-row bricks with exists=true, score 0, status ACTIVE', () => {
    fc.assert(
      fc.property(fc.nat({ max: 999 }), (_n) => {
        const state = Game.createInitialState();

        // Bricks array is non-empty (Requirement 4.1: a single row of bricks).
        expect(state.bricks).toBeInstanceOf(Array);
        expect(state.bricks.length).toBeGreaterThan(0);

        // Every brick exists and shares the same y coordinate (single row).
        const rowY = state.bricks[0].y;
        for (const brick of state.bricks) {
          expect(brick.exists).toBe(true);
          expect(brick.y).toBe(rowY);
        }

        // Score starts at zero (Requirement 5.1).
        expect(state.score).toBe(0);

        // Game starts in the ACTIVE state.
        expect(state.status).toBe(Game.STATES.ACTIVE);
        expect(state.status).toBe('ACTIVE');

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
