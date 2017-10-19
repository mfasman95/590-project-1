import extend from 'extend';

// Set initial application state
const initialState = {
  rooms: {},
};

// Handle actions dispatched to the reducer
const actionHandlers = {
  INIT_STATE: (returnState, action) => {
    const rs = returnState;

    // When this action is received, set the initial state for this client
    rs.rooms = action.rooms;
    rs.myId = action.socketId;
    rs.color = action.color;
    return rs;
  },
  SET_NAME: (returnState, action) => {
    const rs = returnState;

    // When this action is received, the user has set their name
    rs.name = action.name;
    return rs;
  },
  UPDATE_ROOM: (returnState, action) => {
    const rs = returnState;

    // When this action is received, a room has been updated in some way
    rs.rooms[action.room.name] = action.room;
    return rs;
  },
  JOIN_ROOM: (returnState, action) => {
    const rs = returnState;

    // When this action is received, set the value for the room this user is in
    // This is useful for looking up data about this specific room
    rs.inRoom = action.roomName;
    return rs;
  },
  LEAVE_ROOM: (returnState) => {
    const rs = returnState;

    // When this action is received, delete the inRoom variable
    // This will signify this user not being in a room
    delete rs.inRoom;
    return rs;
  },
};

// Export the reducer
export default (state = initialState, action) => {
  // Make an object for the return state
  const rs = extend(true, {}, state);

  // Handle unknown action types
  if (!actionHandlers[action.type]) return rs;

  // Handle the action dispatched to the reducer, return the updated state
  return actionHandlers[action.type](rs, action, state);
};
