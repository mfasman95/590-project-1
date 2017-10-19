import extend from 'extend';

// Set initial application state
const initialState = {};

// Handle actions dispatched to the reducer
const actionHandlers = {
  GAME_START: (returnState) => {
    const rs = returnState;

    // Clear the previous game result
    if (rs.artistsWin) delete rs.artistsWin;
    rs.gameStarted = true;
    return rs;
  },
  GAME_END: (returnState) => {
    const rs = returnState;

    if (rs.gameStarted !== undefined) delete rs.gameStarted;
    if (rs.wordSelected !== undefined) delete rs.wordSelected;
    if (rs.word !== undefined) delete rs.word;
    return rs;
  },
  WORD_SELECTED: (returnState, action) => {
    const rs = returnState;

    rs.wordSelected = true;
    rs.word = action.word;
    return rs;
  },
  ACCUSATION_RESULT: (returnState, action) => {
    const rs = returnState;

    rs.artistsWin = action.result;
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
