import extend from 'extend';

// Set initial application state
const initialState = {
  rooms: {},
};

// Handle actions dispatched to the reducer
const actionHandlers = {
  INIT_STATE: (returnState, action) => {
    const rs = returnState;

    rs.rooms = action.rooms;
    rs.myId = action.socketId;
    rs.color = action.color;
    return rs;
  },
  SET_NAME: (returnState, action) => {
    const rs = returnState;

    rs.name = action.name;
    return rs;
  },
  UPDATE_ROOM: (returnState, action) => {
    const rs = returnState;

    rs.rooms[action.room.name] = action.room;
    return rs;
  },
  JOIN_ROOM: (returnState, action) => {
    const rs = returnState;

    rs.inRoom = action.roomName;
    return rs;
  },
  LEAVE_ROOM: (returnState) => {
    const rs = returnState;

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
