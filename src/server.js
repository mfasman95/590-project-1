const { log, warn, socketOut, socketIn } = require('./utility/logger');
const { DEFAULT_PORT, EMIT_KEYS } = require('./utility/constants');
const { ROOMS, createRoom } = require('./game/manageRooms');
const express = require('express');

const PORT = process.env.PORT || process.env.NODE_PORT || DEFAULT_PORT;
const serverCallback = () => log(`Server is listening at localhost:${PORT}`);

const app = express();
const expressHandler = require('./express/expressHandler');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const random0to255 = () => Math.floor(Math.random() * 255);
const randomColor = () => `rgb(${random0to255()},${random0to255()},${random0to255()})`;

const connectedSockets = {};

const makeEmitObj = eventName => data => Object.assign({}, { eventName, data: data || 'No Data Provided' });
const emitter = (eventName, data, socket) => {
  socket.emit(EMIT_KEYS.server, makeEmitObj(eventName)(data));
  socketOut(`Event ${eventName} sent to ${socket.id}`);
};
const emitToAll = (eventName, data) => {
  io.sockets.emit(EMIT_KEYS.server, makeEmitObj(eventName)(data));
  socketOut(`Event ${eventName} sent to all sockets`);
};
const emitToRoom = (eventName, data, room) => {
  const players = room.players;
  const emitObj = makeEmitObj(eventName)(data);
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    connectedSockets[player].emit(EMIT_KEYS.server, emitObj);
  }
  socketOut(`Event ${eventName} sent to room ${room.name}`);
};
const handleConnect = (sock) => {
  const socket = sock;

  socketIn(`Socket ${socket.id} has connected to the server...`);

  connectedSockets[socket.id] = socket;
  socket.color = randomColor();

  emitter('INIT_STATE', { rooms: ROOMS, socketId: socket.id, color: socket.color }, socket);
};

const handleDisconnect = (sock) => {
  const socket = sock;

  // Remove socket from the room it is in, if that room exists
  if (ROOMS[socket.inRoom]) {
    const room = ROOMS[socket.inRoom];
    if (room.host === socket.id) {
      emitToRoom('CHANGE_PAGE', { page: 'ROOMS' }, room);
      emitToRoom('LEAVE_ROOM', {}, room);
      // TODO: Send a notification to everyone in the room that host quit
    }
    const gameEnded = room.removePlayer(socket.id);
    if (gameEnded) emitToRoom('GAME_END', {}, room);
    emitToAll('UPDATE_ROOM', { room });
  }

  delete connectedSockets[socket.id];
};

const handleEvent = (sock, params) => {
  const socket = sock;
  const { eventName, data } = params;

  socketIn(`Received event ${eventName} from socket ${socket.id}`);

  switch (eventName) {
    case 'setName' : {
      socket.name = data.name;
      emitter('SET_NAME', { name: socket.name }, socket);
      return emitter('CHANGE_PAGE', { page: 'ROOMS' }, socket);
    }
    case 'joinRoom' : {
      socket.inRoom = data.roomName;
      const joined = ROOMS[data.roomName].addPlayer(socket);
      if (joined) {
        emitter('JOIN_ROOM', { roomName: data.roomName }, socket);
        emitter('CANVAS_UPDATE', { drawingArray: ROOMS[socket.inRoom].drawingArray }, socket);
        emitter('CHANGE_PAGE', { page: 'GAME' }, socket);
        return emitToAll('UPDATE_ROOM', {
          room: ROOMS[data.roomName],
        });
      }
      return emitter('FAILED_ROOM_JOIN', {}, socket);
    }
    case 'leaveRoom' : {
      const room = ROOMS[socket.inRoom];
      if (room.host === socket.id) {
        emitToRoom('CHANGE_PAGE', { page: 'ROOMS' }, room);
        emitToRoom('LEAVE_ROOM', {}, room);
        // TODO: Send a notification to everyone in the room that host quit
      } else {
        emitter('CHANGE_PAGE', { page: 'ROOMS' }, socket);
        emitter('LEAVE_ROOM', {}, socket);
      }
      const gameEnded = room.removePlayer(socket.id);
      console.log(gameEnded);
      if (gameEnded) emitToRoom('GAME_END', {}, room);

      return emitToAll('UPDATE_ROOM', { room });
    }
    case 'createRoom' : {
      const created = createRoom(data.roomName);
      if (created) {
        return emitToAll('UPDATE_ROOM', {
          room: ROOMS[data.roomName],
        });
      }
      return emitter('FAILED_TO_MAKE_ROOM', {}, socket);
    }
    case 'startGame': {
      const room = ROOMS[socket.inRoom];
      room.startGame();
      emitToAll('UPDATE_ROOM', { room });
      return emitToRoom('GAME_START', {}, room);
    }
    case 'selectWord': {
      const room = ROOMS[socket.inRoom];
      room.setWord(data.word);
      emitToRoom('UPDATE_ROOM', { room }, room);
      return emitToRoom('WORD_SELECTED', { word: room.word }, room);
    }
    case 'endTurn': {
      const room = ROOMS[socket.inRoom];
      room.addLine(data.line);
      room.nextTurn();
      emitToRoom('UPDATE_ROOM', { room }, room);
      return emitToRoom('NEW_LINE', { line: data.line }, room);
    }
    case 'accusePlayer': {
      const room = ROOMS[socket.inRoom];
      const accusation = room.accuse(data.player);
      // Emit the result of the accusation
      emitToRoom('ACCUSATION_RESULT', { result: accusation }, room);
      emitToRoom('GAME_END', {}, room);
      return emitToAll('UPDATE_ROOM', { room });
    }
    default: { return warn(`Event ${eventName} received without a handler`); }
  }
};

expressHandler.initExpress(app);
io.on('connection', (socket) => {
  handleConnect(socket);
  socket.on(EMIT_KEYS.client, data => handleEvent(socket, data));
  socket.on('disconnect', () => handleDisconnect(socket));
});
server.listen(PORT, serverCallback);

module.exports = Object.freeze({
  server,
  io,
  app,
  PORT,
  emitToAll,
  emitToRoom,
  emitter,
});

// *** DUMB FIX FOR WINDOWS GIT BASH BUG *** //
const readline = require('readline');

if (process.platform === 'win32' || process.platform === 'win64') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('(WINDOWS ONLY) Press enter to kill this process...\n', () => process.emit('SIGINT'));
  process.on('SIGINT', process.exit);
}
