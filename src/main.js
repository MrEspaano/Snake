import {
  DIRECTIONS,
  createInitialState,
  restartState,
  setDirection,
  stepState,
  togglePause,
} from "./gameLogic.js";

const TICK_MS = 140;
const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-btn");
const restartButton = document.querySelector("#restart-btn");
const touchControls = document.querySelector(".touch-controls");

const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  w: DIRECTIONS.UP,
  s: DIRECTIONS.DOWN,
  a: DIRECTIONS.LEFT,
  d: DIRECTIONS.RIGHT,
};

let state = createInitialState({ width: 20, height: 20 });
let cells = [];

function pointToIndex(x, y, width) {
  return y * width + x;
}

function buildBoard() {
  boardElement.style.setProperty("--grid-width", state.width);
  boardElement.style.setProperty("--grid-height", state.height);

  const fragment = document.createDocumentFragment();
  cells = [];

  for (let index = 0; index < state.width * state.height; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cells.push(cell);
    fragment.appendChild(cell);
  }

  boardElement.replaceChildren(fragment);
}

function render() {
  for (const cell of cells) {
    cell.className = "cell";
  }

  for (let index = 0; index < state.snake.length; index += 1) {
    const segment = state.snake[index];
    const cellIndex = pointToIndex(segment.x, segment.y, state.width);
    const cell = cells[cellIndex];
    if (!cell) {
      continue;
    }
    cell.classList.add("snake");
    if (index === 0) {
      cell.classList.add("snake-head");
    }
  }

  if (state.food) {
    const foodIndex = pointToIndex(state.food.x, state.food.y, state.width);
    const foodCell = cells[foodIndex];
    if (foodCell) {
      foodCell.classList.add("food");
    }
  }

  scoreElement.textContent = `Score: ${state.score}`;

  if (state.won) {
    statusElement.textContent = "You win! Press restart.";
  } else if (state.gameOver) {
    statusElement.textContent = "Game over! Press restart.";
  } else if (state.paused) {
    statusElement.textContent = "Paused";
  } else {
    statusElement.textContent = "Running";
  }

  pauseButton.textContent = state.paused ? "Resume" : "Pause";
}

function restartGame() {
  state = restartState(state);
  render();
}

function tick() {
  state = stepState(state);
  render();
}

function handleDirectionInput(direction) {
  state = setDirection(state, direction);
}

document.addEventListener("keydown", (event) => {
  const mappedDirection = KEY_TO_DIRECTION[event.key] ?? KEY_TO_DIRECTION[event.key.toLowerCase()];

  if (mappedDirection) {
    event.preventDefault();
    handleDirectionInput(mappedDirection);
    return;
  }

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (event.key.toLowerCase() === "r") {
    restartGame();
  }
});

touchControls.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const direction = target.dataset.dir;
  if (direction) {
    handleDirectionInput(direction);
  }
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", () => {
  restartGame();
});

buildBoard();
render();
setInterval(tick, TICK_MS);
