const { Room } = require('./room');

// Object for storing rooms
const ROOMS = {};

const createRoom = (name) => {
  // Return false if the room exists already
  if (ROOMS[name]) return false;

  // Store the rooms by their name
  ROOMS[name] = new Room(name);

  // Return true if the room does not exist
  return true;
};

module.exports = Object.freeze({
  createRoom, ROOMS,
});
