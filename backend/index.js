const socket = require("socket.io")();
const { initializeGame, gameLoop, getUpdatedVelocity } = require("./game");
const { FRAME_RATE } = require("./constants");

const globalState = {};
const clientRooms = {};

let generateRoomCode = (length) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

let startGameInterval = (roomName) => {
  const intervalId = setInterval(() => {
    const winner = gameLoop(globalState[roomName]);

    if (!winner) {
      emitGameState(roomName, globalState[roomName]);
    } else {
      emitGameOver(roomName, winner);
      globalState[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
};

let emitGameState = (room, gameState) => {
  // Send this event to everyone in the room.
  socket.sockets.in(room).emit("gameState", JSON.stringify(gameState));
};

let emitGameOver = (room, winner) => {
  socket.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
};

socket.on("connection", (client) => {
  let handleJoinGame = (roomName) => {
    const room = socket.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit("init", 2);

    startGameInterval(roomName);
  };

  let handleNewGame = () => {
    let roomName = generateRoomCode(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    globalState[roomName] = initializeGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  };

  let handleKeydown = (keyCode) => {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const velocity = getUpdatedVelocity(keyCode);

    if (velocity) {
      globalState[roomName].players[client.number - 1].velocity = velocity;
    }
  };

  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
});

socket.listen(process.env.PORT || 3000);
