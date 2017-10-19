import extend from 'extend';

// Set initial application state
const initialState = {
  drawingArray: [],
};

// Handle actions dispatched to the reducer
const actionHandlers = {
  CANVAS_UPDATE: (returnState, action) => {
    const rs = returnState;

    rs.drawingArray = action.drawingArray;

    return rs;
  },
  NEW_LINE: (returnState, action) => {
    const rs = returnState;

    rs.drawingArray = rs.drawingArray.concat(action.line);
    // Sort array by timestamp whenever a new line comes in
    rs.drawingArray.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

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
