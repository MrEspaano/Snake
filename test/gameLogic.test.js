import assert from "node:assert/strict";
import test from "node:test";
import {
  DIRECTIONS,
  createInitialState,
  placeFood,
  setDirection,
  stepState,
} from "../src/gameLogic.js";

function makeState(overrides = {}) {
  return {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    food: { x: 5, y: 5 },
    score: 0,
    paused: false,
    gameOver: false,
    won: false,
    ...overrides,
  };
}

test("stepState moves snake forward by one tile", () => {
  const state = makeState();
  const next = stepState(state, () => 0);

  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.equal(next.snake.length, 3);
  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
});

test("setDirection rejects immediate reverse and second queued turn", () => {
  const state = makeState();
  const reversed = setDirection(state, DIRECTIONS.LEFT);
  assert.equal(reversed.nextDirection, DIRECTIONS.RIGHT);

  const turned = setDirection(state, DIRECTIONS.UP);
  assert.equal(turned.nextDirection, DIRECTIONS.UP);

  const secondTurn = setDirection(turned, DIRECTIONS.LEFT);
  assert.equal(secondTurn.nextDirection, DIRECTIONS.UP);
});

test("snake grows and score increments after eating food", () => {
  const state = makeState({ food: { x: 3, y: 2 } });
  const next = stepState(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.notDeepEqual(next.food, { x: 3, y: 2 });
});

test("game ends when snake hits wall", () => {
  const state = makeState({
    snake: [
      { x: 5, y: 2 },
      { x: 4, y: 2 },
      { x: 3, y: 2 },
    ],
  });
  const next = stepState(state, () => 0);

  assert.equal(next.gameOver, true);
});

test("game ends when snake collides with itself", () => {
  const state = makeState({
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
    ],
    direction: DIRECTIONS.LEFT,
    nextDirection: DIRECTIONS.LEFT,
    food: { x: 0, y: 0 },
  });
  const next = stepState(state, () => 0);

  assert.equal(next.gameOver, true);
});

test("placeFood uses empty cells only and returns null when full", () => {
  const food = placeFood(
    2,
    2,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    () => 0,
  );
  assert.deepEqual(food, { x: 1, y: 1 });

  const none = placeFood(
    2,
    2,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    () => 0,
  );
  assert.equal(none, null);
});

test("initial state creates valid defaults", () => {
  const initial = createInitialState({ width: 8, height: 8, random: () => 0 });

  assert.equal(initial.width, 8);
  assert.equal(initial.height, 8);
  assert.equal(initial.snake.length, 3);
  assert.equal(initial.direction, DIRECTIONS.RIGHT);
  assert.equal(initial.gameOver, false);
});
