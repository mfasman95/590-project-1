import io from 'socket.io-client';
import store from './../redux/store';

const socket = io.connect();
export default socket;

export const emit = (eventName, data) => socket.emit('clientEmit', { eventName, data });

// Convery emits from the server directly into actions for the store
socket.on('serverEmit', (emitData) => {
  const action = { type: emitData.eventName };
  Object.assign(action, emitData.data);
  store.dispatch(action);
});
