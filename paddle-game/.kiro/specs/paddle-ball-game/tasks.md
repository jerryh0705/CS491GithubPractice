# Implementation Plan: Paddle Ball Game

## Overview

This plan converts the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Each prompt builds on the previous prompts and ends by wiring things together, so there is no hanging or orphaned code that isn't integrated into a previous step. Only tasks that involve writing, modifying, or testing code are included.

Implementation language is **JavaScript** (vanilla), matching the design's single-file `index.html` approach with inline CSS and an inline `<script>`. The design separates pure game logic from side-effecting I/O so physics, collisions, state transitions, and reset can be tested without a browser. To make that testable, the inline script exposes pure logic on a `window.Game` namespace that the test harness can call directly after loading `index.html` into a jsdom environment with a stubbed `canvas.getContext('2d')`.

The game loop drives one `update(state)` (pure logic) then one `render(state, ctx)` (side effects) per `requestAnimationFrame` frame. A three-state machine (`ACTIVE`, `GAME_OVER`, `WIN`) controls ball movement: the loop advances the ball only when `status === ACTIVE`, satisfying the terminal-state ball-stop requirements.

## Tasks

- [x] 1. Set up HTML skeleton and test harness
  - [x] 1.1 Create `index.html` with canvas, score display, restart button, and message elements plus inline `<style>` and an inline `<script>` skeleton that defines a `window.Game` namespace
    - Add a `<canvas>`, a score text node, a restart `<button>`, and game-over/win message elements
    - Put all CSS inline within a `<style>` element and all JS inline within a `<script>` element (no external `src`)
    - In the script, create a `window.Game = {}` namespace object that later tasks attach pure functions to, so tests can reach them via jsdom
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 1.2 Set up the test infrastructure
    - Add `package.json` with Vitest, jsdom, and fast-check as dev dependencies
    - Add a Vitest config with the jsdom environment and a setup file that provides `document`, `requestAnimationFrame`, and a stubbed `canvas.getContext('2d')`
    - Add a loader that reads `index.html` and evaluates its inline `<script>` in the jsdom global scope so `window.Game` is available to tests
    - _Requirements: 8.1_

- [x] 2. Define constants, data models, and state factory
  - [x] 2.1 Define game constants, `STATES` enum, and data-model field contracts in the inline script
    - Add `CANVAS_WIDTH`, `CANVAS_HEIGHT`, `BALL_RADIUS`, `BALL_SPEED`, `PADDLE_WIDTH`, `PADDLE_HEIGHT`, `PADDLE_SPEED`, `PADDLE_Y`, `BRICK_COUNT`, `BRICK_WIDTH`, `BRICK_HEIGHT`, `BRICK_PADDING`, `BRICK_OFFSET_TOP`, `BRICK_OFFSET_LEFT`
    - Add `STATES = { ACTIVE, GAME_OVER, WIN }`
    - Document the `Ball`, `Paddle`, `Brick`, and `GameState` field contracts as plain JS objects
    - Attach these to `window.Game` so tests can read the constants
    - _Requirements: 4.1, 5.1_

  - [x] 2.2 Implement `createInitialState()` state factory
    - Build a `GameState` with a fresh ball at center moving with a non-zero velocity, a centered paddle, a single flat row of `BRICK_COUNT` bricks all with `exists === true`, `score` 0, `status` ACTIVE, and `keys = { left: false, right: false }`
    - Attach `createInitialState` to `window.Game`
    - _Requirements: 4.1, 5.1_

  - [x] 2.3 Write property test for the initial state
    - **Property 8: Initial state has a single row of bricks and a zero score**
    - Assert `bricks` is non-empty, every brick shares the same `y` (single row) with `exists === true`, `score` is 0, and `status` is ACTIVE
    - Use fast-check with a minimum of 100 iterations; tag the test `/* Feature: paddle-ball-game, Property 8: Initial state has a single row of bricks and a zero score */`
    - _Requirements: 4.1, 5.1_

- [x] 3. Implement paddle movement logic
  - [x] 3.1 Implement `updatePaddle()` and `clampPaddle()` pure functions
    - `updatePaddle(state)` moves `paddle.x` by `-PADDLE_SPEED` when `keys.left` is pressed and `+PADDLE_SPEED` when `keys.right` is pressed, only while `status === ACTIVE`
    - `clampPaddle(state)` clamps `paddle.x` to `[0, CANVAS_WIDTH - paddle.width]`
    - Attach both to `window.Game`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.2 Write property test for paddle directional movement
    - **Property 1: Paddle moves at fixed speed in the pressed direction**
    - For any ACTIVE state with exactly one of left/right pressed and the move not reaching a boundary, assert `paddle.x` changes by exactly `PADDLE_SPEED` toward the pressed edge
    - Use fast-check, minimum 100 iterations; include generators for paddle starting out of bounds
    - _Requirements: 1.1, 1.2_

  - [x] 3.3 Write property test for paddle bounds
    - **Property 2: Paddle stays within canvas bounds**
    - For any state and any combination of pressed keys, after one update step assert `0 <= paddle.x <= CANVAS_WIDTH - paddle.width`
    - Use fast-check, minimum 100 iterations; include a generator with paddle starting negative or past the right edge
    - _Requirements: 1.3_

- [ ] 4. Implement ball movement and wall bouncing
  - [x] 4.1 Implement `updateBall()` and `bounceWalls()` with a `ballHitsWall()` helper
    - `updateBall(state)` advances the ball by `(dx, dy)` only when `status === ACTIVE`
    - `bounceWalls(state)` reverses the perpendicular velocity and clamps position at the top (set `dy > 0`, clamp `y` to top), left (set `dx > 0`, clamp `x`), and right (set `dx < 0`, clamp `x`) walls
    - Attach all three to `window.Game`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [-] 4.2 Write property test for constant ball speed
    - **Property 3: Ball advances at constant speed in the active state**
    - For any ACTIVE state where the ball does not collide with a wall, paddle, or brick during the step, assert the new position equals old position + `(dx, dy)` and `sqrt(dx*dx + dy*dy)` is unchanged
    - Use fast-check, minimum 100 iterations
    - _Requirements: 2.1_

  - [-] 4.3 Write property test for wall bounces
    - **Property 4: Wall bounces reverse the perpendicular velocity and keep the ball in bounds**
    - For each wall hit, assert the perpendicular velocity reverses and the ball stays within `[0, CANVAS_WIDTH]` horizontally and `y >= 0` vertically
    - Use fast-check, minimum 100 iterations; include generators for ball exactly on a wall, deep past a wall, and at a canvas corner
    - _Requirements: 2.2, 2.3, 2.4_

- [ ] 5. Implement paddle collision and bottom-edge game over
  - [ ] 5.1 Implement `collidePaddle()` with a `ballHitsPaddle()` helper, plus the bottom-edge game-over transition
    - `ballHitsPaddle(state)` is a circle/rect overlap test guarded by a downward-motion check (`dy > 0`), so an upward-moving ball grazing the paddle does not bounce
    - `collidePaddle(state)` reverses `dy` upward when the ball overlaps the paddle while moving downward
    - When the ball reaches the bottom edge (`y + radius >= CANVAS_HEIGHT`), transition `status` to `GAME_OVER`
    - Attach all to `window.Game`
    - _Requirements: 2.5, 3.1_

  - [~] 5.2 Write property test for paddle bounce direction
    - **Property 5: Paddle bounce reverses the ball upward**
    - For any ACTIVE state where the ball overlaps the paddle and `dy > 0`, after update assert `dy` is negative
    - Use fast-check, minimum 100 iterations; include generators for ball moving upward vs downward near the paddle
    - _Requirements: 2.5_

  - [~] 5.3 Write property test for bottom-edge game over
    - **Property 6: Bottom edge triggers game over**
    - For any ACTIVE state where `ball.y + radius >= CANVAS_HEIGHT`, after update assert `status === GAME_OVER`
    - Use fast-check, minimum 100 iterations
    - _Requirements: 3.1_

- [ ] 6. Implement brick collision and win condition
  - [~] 6.1 Implement `collideBricks()` with a `ballHitsBrick()` helper, plus `checkWin()`
    - `ballHitsBrick(state, brick)` is a bounding-box overlap test between the ball and a brick rectangle
    - `collideBricks(state)` loops bricks, processes the first existing brick the ball overlaps, sets its `exists = false`, reverses `dy`, and increments `score` by exactly 1 (single first-hit per frame to avoid double-counting)
    - `checkWin(state)` transitions `status` to `WIN` when every brick has `exists === false`
    - Attach all to `window.Game`
    - _Requirements: 4.2, 4.3, 5.2, 6.1_

  - [~] 6.2 Write property test for brick collision effects
    - **Property 9: Brick collision removes the brick, reverses the ball, and increments the score**
    - For any ACTIVE state where the ball overlaps an existing brick, after update assert that brick's `exists` is false, `dy` is negated, and `score` increases by exactly 1
    - Use fast-check, minimum 100 iterations; include generators for exactly one brick remaining
    - _Requirements: 4.2, 4.3, 5.2_

  - [~] 6.3 Write property test for the win transition
    - **Property 10: All bricks removed triggers a win**
    - For any ACTIVE state where every brick has `exists === false`, after update assert `status === WIN`
    - Use fast-check, minimum 100 iterations
    - _Requirements: 6.1_

- [ ] 7. Implement update orchestrator, terminal-state freeze, and reset
  - [~] 7.1 Implement `update(state)` orchestrating all logic in order with status checks
    - Run `updatePaddle` → `updateBall` (only when ACTIVE) → `bounceWalls` (incl. bottom-edge game over) → `collidePaddle` → `collideBricks` → `checkWin`, mutating and returning `state`
    - Skipping ball advance when `status !== ACTIVE` guarantees the ball freezes in terminal states
    - Attach to `window.Game`
    - _Requirements: 2.1, 3.1, 3.3, 6.3_

  - [~] 7.2 Write property test for terminal-state freeze
    - **Property 7: Ball freezes in terminal states**
    - For any state whose status is `GAME_OVER` or `WIN`, after update assert `ball.x`, `ball.y`, `ball.dx`, and `ball.dy` are unchanged
    - Use fast-check, minimum 100 iterations
    - _Requirements: 3.3, 6.3_

  - [~] 7.3 Implement `reset(state)` function
    - Replace every field of `state` with initial values (fresh ball with non-zero velocity, centered paddle, all bricks `exists === true`, score 0) and set `status` to ACTIVE, reassigning fields in place so the loop and listeners keep the same object reference
    - Attach to `window.Game`
    - _Requirements: 7.1, 7.2_

  - [~] 7.4 Write property test for reset
    - **Property 11: Reset returns to the initial active state**
    - For any state (mid-game, partial, and terminal), after `reset` assert the result equals `createInitialState()` in ball, paddle, bricks (all `exists === true`), and score, with `status` ACTIVE and a non-zero ball velocity
    - Use fast-check, minimum 100 iterations
    - _Requirements: 7.1, 7.2_

- [~] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement renderer
  - [~] 9.1 Implement `clearCanvas()`, `drawBall()`, `drawPaddle()`, and `drawBricks()`
    - `clearCanvas(ctx)` clears the frame
    - `drawBall(state, ctx)` draws a circle with `BALL_RADIUS`
    - `drawPaddle(state, ctx)` draws the filled paddle rectangle
    - `drawBricks(state, ctx)` iterates bricks and draws only those with `exists === true`
    - Wire these into a `render(state, ctx)` entry point that calls them in order
    - _Requirements: 4.1_

  - [~] 9.2 Implement `drawScore()` and `drawMessages()`
    - `drawScore(state)` updates the score text node to the current `score`
    - `drawMessages(state)` shows the game-over message when `status === GAME_OVER` and the win message when `status === WIN`, hiding them otherwise
    - Wire both into `render(state, ctx)`
    - _Requirements: 3.2, 5.3, 6.2_

  - [~] 9.3 Write unit tests for score display and terminal messages
    - After a score change, assert the score display text node reflects the current score (Req 5.3)
    - When `status === GAME_OVER`, assert rendering shows the game-over message (Req 3.2)
    - When `status === WIN`, assert rendering shows the win message (Req 6.2)
    - _Requirements: 3.2, 5.3, 6.2_

  - [~] 9.4 Write unit tests for rendering/logic edge cases
    - Ball moving upward near the paddle does not bounce off it
    - Ball exactly at the bottom edge (`y + radius === CANVAS_HEIGHT`) triggers game over
    - Hitting the last brick simultaneously transitions to win and the ball stops
    - Restarting during `WIN` and during `GAME_OVER` both yield a fresh active state
    - _Requirements: 2.5, 3.1, 6.1, 7.1, 7.2_

- [ ] 10. Implement input handling and game loop, and wire everything together
  - [~] 10.1 Implement the input handler
    - Attach `keydown`/`keyup` listeners for the left/right arrow keys calling `setKey(state, 'left' | 'right', pressed)`; ignore all other key events
    - Attach a `click` listener on the restart button that calls `reset(state)`
    - _Requirements: 1.1, 1.2, 7.1, 7.2_

  - [~] 10.2 Implement the game loop with a context guard
    - `loop()` calls `update(state)`, then `render(state, ctx)`, then `requestAnimationFrame(loop)`
    - Before starting, check `canvas.getContext('2d')` returns a valid context; if not, log a message and do not start the loop (graceful degradation)
    - _Requirements: 2.1, 3.3, 6.3_

  - [~] 10.3 Wire input, update, render, and loop together and start the game on load
    - Create the initial state, attach the input listeners, start the loop, and ensure the ball begins moving in the ACTIVE state
    - Confirm restart from any state resumes ball movement
    - _Requirements: 1.1, 2.1, 7.2, 8.1_

- [~] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Smoke checks and optional integration test
  - [~] 12.1 Implement smoke/static checks for single-file packaging
    - Assert the deliverable is a single `index.html` with no separate required JS/CSS source files (Req 8.1)
    - Assert `index.html` contains an inline `<style>` element (Req 8.2)
    - Assert `index.html` contains an inline `<script>` element with no external `src` attribute (Req 8.3)
    - _Requirements: 8.1, 8.2, 8.3_

  - [~] 12.2 Write optional Playwright integration test
    - Load `index.html` in a headless browser, drive a deterministic sequence of arrow-key inputs, and verify the score increments and a terminal-state message eventually appears
    - _Requirements: 1.1, 5.2, 3.2, 6.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, though the property tests are the primary correctness guarantee for the pure logic layer.
- Each task references specific acceptance criteria for traceability; every requirement is covered by at least one implementation or test task.
- Checkpoints ensure incremental validation after the pure logic is complete and again after rendering, input, and loop wiring.
- Property tests (Tasks 2.3, 3.2, 3.3, 4.2, 4.3, 5.2, 5.3, 6.2, 6.3, 7.2, 7.4) validate the 11 universal correctness properties from the design; each uses fast-check with a minimum of 100 iterations.
- Unit tests (Tasks 9.3, 9.4) cover side-effecting rendering behavior and specific edge cases that are not universal properties.
- Smoke checks (Task 12.1) verify the single-file packaging requirements structurally.
- The pure logic is exposed on `window.Game` so tests run in jsdom without a real canvas; implementation tasks attach their functions to this namespace as they go.
- All implementation and test tasks use JavaScript (vanilla) with Vitest, jsdom, and fast-check, matching the design's language choice.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3"] },
    { "id": 9, "tasks": ["7.4", "9.1"] },
    { "id": 10, "tasks": ["9.2"] },
    { "id": 11, "tasks": ["9.3", "9.4", "10.1"] },
    { "id": 12, "tasks": ["10.2"] },
    { "id": 13, "tasks": ["10.3"] },
    { "id": 14, "tasks": ["12.1", "12.2"] }
  ]
}
```
