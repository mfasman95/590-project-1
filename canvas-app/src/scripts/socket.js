/* eslint-disable */
import io from 'socket.io-client';
import store from './../redux/store';

let socket;
if (process.env.NODE_ENV === 'development') socket = io.connect('http://localhost:3001');
else socket = io.connect();
export default socket;

export const emit = (eventName, data) => socket.emit('clientEmit', { eventName, data });

// Convery emits from the server directly into actions for the store
socket.on('serverEmit', (emitData) => {
  const action = { type: emitData.eventName };
  Object.assign(action, emitData.data);
  store.dispatch(action);
});
