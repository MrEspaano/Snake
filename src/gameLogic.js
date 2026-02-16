export const DIRECTIONS = Object.freeze({
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
});

const DIRECTION_VECTORS = Object.freeze({
  [DIRECTIONS.UP]: { x: 0, y: -1 },
  [DIRECTIONS.DOWN]: { x: 0, y: 1 },
  [DIRECTIONS.LEFT]: { x: -1, y: 0 },
  [DIRECTIONS.RIGHT]: { x: 1, y: 0 },
});

function isOppositeDirection(from, to) {
  return (
    (from === DIRECTIONS.UP && to === DIRECTIONS.DOWN) ||
    (from === DIRECTIONS.DOWN && to === DIRECTIONS.UP) ||
    (from === DIRECTIONS.LEFT && to === DIRECTIONS.RIGHT) ||
    (from === DIRECTIONS.RIGHT && to === DIRECTIONS.LEFT)
  );
}

function keyForPoint(point) {
  return `${point.x},${point.y}`;
}

function arePointsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function hasDuplicatePoints(points) {
  const seen = new Set();

  for (const point of points) {
    const key = keyForPoint(point);
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }

  return false;
}

function createInitialSnake(width, height) {
  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);

  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

export function getEmptyCells(width, height, snake) {
  const occupied = new Set(snake.map((segment) => keyForPoint(segment)));
  const cells = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

export function placeFood(width, height, snake, random = Math.random) {
  const emptyCells = getEmptyCells(width, height, snake);

  if (emptyCells.length === 0) {
    return null;
  }

  const randomIndex = Math.min(
    emptyCells.length - 1,
    Math.floor(random() * emptyCells.length),
  );

  return emptyCells[randomIndex];
}

export function createInitialState(options = {}) {
  const width = options.width ?? 20;
  const height = options.height ?? 20;
  const random = options.random ?? Math.random;
  const snake = createInitialSnake(width, height);

  return {
    width,
    height,
    snake,
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    food: placeFood(width, height, snake, random),
    score: 0,
    paused: false,
    gameOver: false,
    won: false,
  };
}

export function setDirection(state, direction) {
  if (state.gameOver || state.won) {
    return state;
  }

  if (!(direction in DIRECTION_VECTORS)) {
    return state;
  }

  if (state.nextDirection !== state.direction) {
    return state;
  }

  if (isOppositeDirection(state.direction, direction)) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction,
  };
}

export function togglePause(state) {
  if (state.gameOver || state.won) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused,
  };
}

export function restartState(state, random = Math.random) {
  return createInitialState({
    width: state.width,
    height: state.height,
    random,
  });
}

export function stepState(state, random = Math.random) {
  if (state.gameOver || state.won || state.paused) {
    return state;
  }

  const direction = state.nextDirection;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const newHead = { x: head.x + vector.x, y: head.y + vector.y };

  const hitWall =
    newHead.x < 0 ||
    newHead.x >= state.width ||
    newHead.y < 0 ||
    newHead.y >= state.height;

  if (hitWall) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      gameOver: true,
    };
  }

  const isEating = state.food && arePointsEqual(newHead, state.food);
  const nextSnake = [newHead, ...state.snake];

  if (!isEating) {
    nextSnake.pop();
  }

  if (hasDuplicatePoints(nextSnake)) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      gameOver: true,
    };
  }

  let score = state.score;
  let food = state.food;
  let won = state.won;
  let gameOver = state.gameOver;

  if (isEating) {
    score += 1;
    food = placeFood(state.width, state.height, nextSnake, random);
    if (!food) {
      won = true;
      gameOver = true;
    }
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food,
    score,
    won,
    gameOver,
  };
}
