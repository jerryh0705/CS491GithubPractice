# Requirements Document

## Introduction

This document specifies the requirements for a classic paddle ball game (Breakout-style) implemented as a single-page web application. The game consists of a player-controlled paddle, a bouncing ball, a row of destructible bricks, a score display, and a restart mechanism. The game is rendered on an HTML5 canvas and packaged in a single index.html file with inline CSS and JavaScript so it can be opened directly in a browser without a server.

## Glossary

- **Game**: The complete paddle ball game application rendered on the Canvas.
- **Canvas**: The HTML5 canvas element on which the Game is drawn.
- **Paddle**: The player-controlled rectangle positioned near the bottom of the Canvas.
- **Ball**: The moving circle that bounces off the walls, the Paddle, and the Bricks.
- **Brick**: A destructible rectangle positioned in a row at the top of the Canvas.
- **Bricks**: The complete collection of Brick objects displayed at the top of the Canvas.
- **Score**: The numeric value displayed to the player representing the number of Bricks broken.
- **Score_Display**: The on-screen text element showing the current Score.
- **Restart_Button**: The button element that resets the Game to its initial state.
- **Game_Over_State**: The state of the Game after the Ball passes the bottom of the Canvas.
- **Win_State**: The state of the Game after all Bricks have been removed.
- **Active_State**: The state of the Game while the Ball is in motion and the player is playing.

## Requirements

### Requirement 1: Paddle Control

**User Story:** As a player, I want to control the paddle with the left and right arrow keys, so that I can hit the ball and keep it in play.

#### Acceptance Criteria

1. WHEN the left arrow key is pressed during the Active_State, THE Paddle SHALL move toward the left edge of the Canvas at a fixed speed.
2. WHEN the right arrow key is pressed during the Active_State, THE Paddle SHALL move toward the right edge of the Canvas at a fixed speed.
3. WHILE the Paddle is moving, THE Paddle SHALL remain within the horizontal boundaries of the Canvas.

### Requirement 2: Ball Movement and Wall Bouncing

**User Story:** As a player, I want the ball to move continuously and bounce off the walls, so that the game remains in motion.

#### Acceptance Criteria

1. THE Ball SHALL move continuously across the Canvas at a constant speed while in the Active_State.
2. WHEN the Ball reaches the top wall of the Canvas, THE Ball SHALL reverse its vertical direction downward.
3. WHEN the Ball reaches the left wall of the Canvas, THE Ball SHALL reverse its horizontal direction rightward.
4. WHEN the Ball reaches the right wall of the Canvas, THE Ball SHALL reverse its horizontal direction leftward.
5. WHEN the Ball collides with the Paddle, THE Ball SHALL reverse its vertical direction upward.

### Requirement 3: Game Over Condition

**User Story:** As a player, I want the game to end when the ball passes the bottom, so that missing the ball has a consequence.

#### Acceptance Criteria

1. WHEN the Ball reaches the bottom edge of the Canvas, THE Game SHALL enter the Game_Over_State.
2. WHILE in the Game_Over_State, THE Game SHALL display a game over message to the player.
3. WHILE in the Game_Over_State, THE Ball SHALL stop moving.

### Requirement 4: Bricks and Brick Destruction

**User Story:** As a player, I want to break bricks by hitting them with the ball, so that I can clear the board and score points.

#### Acceptance Criteria

1. THE Game SHALL display a single row of Bricks at the top of the Canvas at the start of each game.
2. WHEN the Ball collides with a Brick, THE Game SHALL remove that Brick from the Canvas.
3. WHEN the Ball collides with a Brick, THE Ball SHALL reverse its vertical direction.

### Requirement 5: Score Tracking and Display

**User Story:** As a player, I want to see my score increase as I break bricks, so that I can track my progress.

#### Acceptance Criteria

1. THE Game SHALL display the Score_Display with an initial Score value of zero.
2. WHEN the Ball collides with a Brick, THE Score SHALL increase by one point.
3. WHEN the Score changes, THE Score_Display SHALL update to show the current Score value.

### Requirement 6: Win Condition

**User Story:** As a player, I want to be notified when all bricks are cleared, so that I know I have completed the game.

#### Acceptance Criteria

1. WHEN all Bricks have been removed from the Canvas, THE Game SHALL enter the Win_State.
2. WHILE in the Win_State, THE Game SHALL display a win message to the player.
3. WHILE in the Win_State, THE Ball SHALL stop moving.

### Requirement 7: Game Restart

**User Story:** As a player, I want to restart the game, so that I can play again after winning or losing.

#### Acceptance Criteria

1. WHEN the Restart_Button is clicked, THE Game SHALL reset the Ball position, the Paddle position, the Bricks, and the Score to their initial values.
2. WHEN the Restart_Button is clicked, THE Game SHALL enter the Active_State and resume ball movement.

### Requirement 8: Single File Packaging

**User Story:** As a developer, I want the game contained in a single HTML file, so that it can be opened directly in a browser without a server.

#### Acceptance Criteria

1. THE Game SHALL be contained in a single index.html file.
2. THE index.html file SHALL include all CSS styling inline within a style element.
3. THE index.html file SHALL include all JavaScript logic inline within a script element.
