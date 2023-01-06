const { GRID_SIZE } = require("./constants");

function initializeGame() {
  const state = createGameState();
  generateFoodRandomly(state);
  return state;
}

function createGameState() {
  return {
    players: [
      {
        position: {
          x: 3,
          y: 10,
        },
        velocity: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        position: {
          x: 18,
          y: 10,
        },
        velocity: {
          x: 0,
          y: 0,
        },
        snake: [
          { x: 20, y: 3 },
          { x: 19, y: 3 },
          { x: 18, y: 3 },
        ],
      },
    ],
    food: {},
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.position.x += playerOne.velocity.x;
  playerOne.position.y += playerOne.velocity.y;

  playerTwo.position.x += playerTwo.velocity.x;
  playerTwo.position.y += playerTwo.velocity.y;

  if (
    playerOne.position.x < 0 ||
    playerOne.position.x > GRID_SIZE ||
    playerOne.position.y < 0 ||
    playerOne.position.y > GRID_SIZE
  ) {
    return 2;
  }

  if (
    playerTwo.position.x < 0 ||
    playerTwo.position.x > GRID_SIZE ||
    playerTwo.position.y < 0 ||
    playerTwo.position.y > GRID_SIZE
  ) {
    return 1;
  }

  if (
    state.food.x === playerOne.position.x &&
    state.food.y === playerOne.position.y
  ) {
    playerOne.snake.push({ ...playerOne.position });
    playerOne.position.x += playerOne.velocity.x;
    playerOne.position.y += playerOne.velocity.y;
    generateFoodRandomly(state);
  }

  if (
    state.food.x === playerTwo.position.x &&
    state.food.y === playerTwo.position.y
  ) {
    playerTwo.snake.push({ ...playerTwo.position });
    playerTwo.position.x += playerTwo.velocity.x;
    playerTwo.position.y += playerTwo.velocity.y;
    generateFoodRandomly(state);
  }

  if (playerOne.velocity.x || playerOne.velocity.y) {
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.position.x && cell.y === playerOne.position.y) {
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.position });
    playerOne.snake.shift();
  }

  if (playerTwo.velocity.x || playerTwo.velocity.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.position.x && cell.y === playerTwo.position.y) {
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.position });
    playerTwo.snake.shift();
  }

  return false;
}

function generateFoodRandomly(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return generateFoodRandomly(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return generateFoodRandomly(state);
    }
  }

  state.food = food;
}

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: {
      // left
      return { x: -1, y: 0 };
    }
    case 38: {
      // down
      return { x: 0, y: -1 };
    }
    case 39: {
      // right
      return { x: 1, y: 0 };
    }
    case 40: {
      // up
      return { x: 0, y: 1 };
    }
  }
}

module.exports = {
  initializeGame,
  gameLoop,
  getUpdatedVelocity,
};
