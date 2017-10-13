const { Room } = require('./room');

const ROOMS = {};

const createRoom = (name) => {
  // Return false if the room exists already
  if (ROOMS[name]) return false;

  // Return true if the room does not exist
  ROOMS[name] = new Room(name);
  return true;
};

module.exports = Object.freeze({
  createRoom, ROOMS,
});
