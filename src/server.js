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
  io.to(room).emit(EMIT_KEYS.server, makeEmitObj(eventName)(data));
  socketOut(`Event ${eventName} sent to ${room}`);
};
const broadcastToRoom = (eventName, data, room) => {
  io.to(room).broadcast(EMIT_KEYS.server, makeEmitObj(eventName)(data));
  socketOut(`Event ${eventName} sent to ${room}`);
};
const handleConnect = (sock) => {
  const socket = sock;

  socketIn(`Socket ${socket.id} has connected to the server...`);

  connectedSockets[socket.id] = socket;

  emitter('INIT_STATE', { rooms: ROOMS }, socket);
};

const handleDisconnect = (sock) => {
  const socket = sock;

  socketIn(`Socket ${socket.id} has disconnected from the server`);

  delete connectedSockets[socket.id];
};

const handleEvent = (sock, params) => {
  const socket = sock;
  const { eventName, data } = params;

  socketIn(`Received event ${eventName} from socket ${socket.id}`);

  switch (eventName) {
    case 'joinRoom' : {
      socket.inRoom = data.roomName;
      const joined = ROOMS[data.roomName].addPlayer(socket.id);
      if (joined) {
        emitter('JOIN_ROOM', { roomName: data.roomName }, socket);
        emitter('DRAWING_UPDATE', { drawingArray: ROOMS[socket.inRoom].drawingArray }, socket);
        emitter('CHANGE_PAGE', { page: 'GAME' }, socket);
        return emitToAll('UPDATE_ROOM', {
          room: ROOMS[data.roomName],
        });
      }
      return emitter('FAILED_ROOM_JOIN', {}, socket);
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
    case 'lineDraw': {
      ROOMS[socket.inRoom].addLine(data.newLine);
      return emitToAll('DRAWING_UPDATE', { drawingArray: ROOMS[socket.inRoom].drawingArray });
    }
    case 'clearCanvas': {
      ROOMS[socket.inRoom].clearDrawing();
      return emitToAll('DRAWING_UPDATE', { drawingArray: ROOMS[socket.inRoom].drawingArray });
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
  broadcastToRoom,
});

// *** DUMB FIX FOR WINDOWS GIT BASH BUG *** //
const readline = require('readline');

if (process.platform === 'win32' || process.platform === 'win64') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('(WINDOWS ONLY) Press enter to kill this process...\n', () => process.emit('SIGINT'));
  process.on('SIGINT', process.exit);
}
