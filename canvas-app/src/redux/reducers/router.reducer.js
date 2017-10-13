import extend from 'extend';

// Set initial application state
const initialState = {
  page: 'HOME',
};

// Handle actions dispatched to the reducer
const actionHandlers = {
  CHANGE_PAGE: (returnState, action) => {
    const rs = returnState;

    // Set the new page value
    rs.page = action.page;
    return rs;
  },
};

export const changePage = page => ({ type: 'CHANGE_PAGE', page });

// Export the reducer
export default (state = initialState, action) => {
  // Make an object for the return state
  const rs = extend(true, {}, state);

  // Handle unknown action types
  if (!actionHandlers[action.type]) return rs;

  // Handle the action dispatched to the reducer, return the updated state
  return actionHandlers[action.type](rs, action, state);
};
