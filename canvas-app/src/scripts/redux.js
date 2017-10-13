import { createStore } from 'redux';
import io from 'socket.io-client';
import extend from 'extend';

let socket;
if (process.env.NODE_ENV === 'development') socket = io.connect('localhost:3000');
else socket = io.connect();

const initialState = {
  drawingArray: [],
};

const reducer = (state=initialState, action) => {
  const rs = extend(true, {}, state);
  switch(action.type) {
    case 'DRAWING_UPDATE': {
      rs.drawingArray = action.drawingArray;
      return rs;
    }
    default: { return rs; }
  }
}

export const store = createStore(reducer);

export const emit = (eventName, data) => socket.emit('clientEmit', { eventName, data });

// Convery emits from the server directly into actions for the store
socket.on('serverEmit', (emitData) => {
  let action = { type: emitData.eventName };
  Object.assign(action, emitData.data);
  store.dispatch(action);
});