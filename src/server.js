const { log, warn, socketOut, socketIn } = require('./utility/logger');
const { DEFAULT_PORT, EMIT_KEYS } = require('./utility/constants');
const { ROOMS, createRoom } = require('./game/manageRooms');
const express = require('express');

// Set the server port
const PORT = process.env.PORT || process.env.NODE_PORT || DEFAULT_PORT;
// Set the message to log when the server starts listening
const serverCallback = () => log(`Server is listening at localhost:${PORT}`);

const app = express();
const expressHandler = require('./express/expressHandler');
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Function for generating a random 0 to 255 value
const random0to255 = () => Math.floor(Math.random() * 255);
// Build a color from three random values
const randomColor = () => `rgb(${random0to255()},${random0to255()},${random0to255()})`;

// Store all connected sockets
const connectedSockets = {};

// Utility function for making an object to emit in the format { eventName: name, data: dataObj, }
const makeEmitObj = eventName => data => Object.assign({}, { eventName, data: data || 'No Data Provided' });

// Emit to a single socket
const emitter = (eventName, data, socket) => {
  socket.emit(EMIT_KEYS.server, makeEmitObj(eventName)(data));
  socketOut(`Event ${eventName} sent to ${socket.id}`);
};

// Emit to all connected sockets
const emitToAll = (eventName, data) => {
  io.sockets.emit(EMIT_KEYS.server, makeEmitObj(eventName)(data));
  socketOut(`Event ${eventName} sent to all sockets`);
};

// Emit to all sockets in a specific room
const emitToRoom = (eventName, data, room) => {
  const players = room.players;
  const emitObj = makeEmitObj(eventName)(data);
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    connectedSockets[player].emit(EMIT_KEYS.server, emitObj);
  }
  socketOut(`Event ${eventName} sent to room ${room.name}`);
};

// Handle the initial socket connection
const handleConnect = (sock) => {
  const socket = sock;

  socketIn(`Socket ${socket.id} has connected to the server...`);

  // Add the socket to connected sockets
  connectedSockets[socket.id] = socket;
  // Set the color for this user, randomly
  socket.color = randomColor();

  // Emit the initial application state to the client
  emitter('INIT_STATE', { rooms: ROOMS, socketId: socket.id, color: socket.color }, socket);
};

// Handle socket disconnection
const handleDisconnect = (sock) => {
  const socket = sock;

  // Remove socket from the room it is in, if that room exists
  if (ROOMS[socket.inRoom]) {
    const room = ROOMS[socket.inRoom];
    // If the host disconnects, remove all users from that room
    if (room.host === socket.id) {
      emitToRoom('CHANGE_PAGE', { page: 'ROOMS' }, room);
      emitToRoom('LEAVE_ROOM', {}, room);
      // TODO: Send a notification to everyone in the room that host quit
    }
    // If this user leaving ended the game, emit that knowledge to all players in that room still
    const gameEnded = room.removePlayer(socket.id);
    if (gameEnded) emitToRoom('GAME_END', {}, room);

    // Update this room state for all connected sockets
    emitToAll('UPDATE_ROOM', { room });
  }

  // Remove this socket from storage
  delete connectedSockets[socket.id];
};

// Universal event handlers
const handleEvent = (sock, params) => {
  const socket = sock;
  // Dereference the event name and emit data
  const { eventName, data } = params;

  socketIn(`Received event ${eventName} from socket ${socket.id}`);

  switch (eventName) {
    case 'setName' : {
      // Set the users name on this socket
      socket.name = data.name;
      // Send that data back to the client
      emitter('SET_NAME', { name: socket.name }, socket);
      // Move the client to the 'ROOMS' page
      return emitter('CHANGE_PAGE', { page: 'ROOMS' }, socket);
    }
    case 'joinRoom' : {
      // Update the 'inRoom' value on the socket, for future reference
      socket.inRoom = data.roomName;

      // Store if the user succesfully joined the room
      const joined = ROOMS[data.roomName].addPlayer(socket);
      if (joined) {
        // Tell the user they joined the room
        emitter('JOIN_ROOM', { roomName: data.roomName }, socket);
        // Give the user the current canvas state
        emitter('CANVAS_UPDATE', { drawingArray: ROOMS[socket.inRoom].drawingArray }, socket);
        // Move the user to the game
        emitter('CHANGE_PAGE', { page: 'GAME' }, socket);
        // Update the room state for all clients
        return emitToAll('UPDATE_ROOM', {
          room: ROOMS[data.roomName],
        });
      }
      // If the user failed to join, notify them (TODO: handle on client)
      return emitter('FAILED_ROOM_JOIN', {}, socket);
    }
    case 'leaveRoom' : {
      // Get a reference to the room
      const room = ROOMS[socket.inRoom];
      // If the room's host is leaving, kick all clients from the room
      if (room.host === socket.id) {
        emitToRoom('CHANGE_PAGE', { page: 'ROOMS' }, room);
        emitToRoom('LEAVE_ROOM', {}, room);
        // TODO: Send a notification to everyone in the room that host quit
      } else {
        // Change the users page back to room selection
        emitter('CHANGE_PAGE', { page: 'ROOMS' }, socket);
        // Update their state so the client knows they are no longer in the room
        emitter('LEAVE_ROOM', {}, socket);
      }
      // Check if this user leaving triggered an invalid game state
      const gameEnded = room.removePlayer(socket.id);
      // If the game cannot continue, notify all remaining users in the room
      if (gameEnded) emitToRoom('GAME_END', {}, room);

      // Update room state for all clients
      return emitToAll('UPDATE_ROOM', { room });
    }
    case 'createRoom' : {
      // Store if the room was successfully created
      const created = createRoom(data.roomName);
      if (created) {
        // Emit this room to all users
        return emitToAll('UPDATE_ROOM', {
          room: ROOMS[data.roomName],
        });
      }
      // If the user failed to make a room, notify them (TODO: handle on client)
      return emitter('FAILED_TO_MAKE_ROOM', {}, socket);
    }
    case 'startGame': {
      // Store a reference to the room in question
      const room = ROOMS[socket.inRoom];
      // Update the room state on server side
      room.startGame();
      // Update the room state on client side
      emitToAll('UPDATE_ROOM', { room });
      // Notify all users in the room that the game started
      return emitToRoom('GAME_START', {}, room);
    }
    case 'selectWord': {
      // Store a reference to the room in question
      const room = ROOMS[socket.inRoom];
      // Set the word to draw for the room
      room.setWord(data.word);
      // Update the room state to the players in the room
      emitToRoom('UPDATE_ROOM', { room }, room);
      // Notify the users that a word has been selected
      return emitToRoom('WORD_SELECTED', { word: room.word }, room);
    }
    case 'endTurn': {
      // Store a reference to the room in question
      const room = ROOMS[socket.inRoom];
      // Add the new line data from the turn to the room
      room.addLine(data.line);
      // Move to the next users turn
      room.nextTurn();
      // Update users in the room to the new room state
      emitToRoom('UPDATE_ROOM', { room }, room);
      // Send the new line data to all users in the room
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
    // Catch any unrecognized events
    default: { return warn(`Event ${eventName} received without a handler`); }
  }
};

// Set up any express end points
expressHandler.initExpress(app);

// Set up the basic socket io event handlers for any client
io.on('connection', (socket) => {
  // Handle initial connection
  handleConnect(socket);
  // Handle custom events
  socket.on(EMIT_KEYS.client, data => handleEvent(socket, data));
  // Handle disconnection
  socket.on('disconnect', () => handleDisconnect(socket));
});

// Start listening on the provided port, and then log that port
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
