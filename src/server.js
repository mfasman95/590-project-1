const { log, warn, socketOut, socketIn } = require('./utility/logger');
const { DEFAULT_PORT, EMIT_KEYS } = require('./utility/constants');
const express = require('express');

const PORT = process.env.PORT || process.env.NODE_PORT || DEFAULT_PORT;
const serverCallback = () => log(`Server is listening at localhost:${PORT}`);

const app = express();
const expressHandler = require('./express/expressHandler');
const server = require('http').Server(app);
const io = require('socket.io')(server);

let drawingArray = [];

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

  // Send initial drawing update to client on connect
  emitter('DRAWING_UPDATE', { drawingArray }, socket);
};

const handleDisconnect = (sock) => {
  const socket = sock;

  socketIn(`Socket ${socket.id} has disconnected from the server`);
};

const handleEvent = (sock, params) => {
  const socket = sock;
  const { eventName, data } = params;

  socketIn(`Received event ${eventName} from socket ${socket.id}`);

  switch (eventName) {
    case 'lineDraw': {
      drawingArray.push(data.newLine);
      return emitToAll('DRAWING_UPDATE', { drawingArray });
    }
    case 'clearCanvas': {
      drawingArray = [];
      return emitToAll('DRAWING_UPDATE', { drawingArray });
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
