import { createStore, combineReducers } from 'redux';
import main from './reducers/main.reducer';
import route from './reducers/router.reducer';
import canvas from './reducers/canvas.reducer';
import notifications from './reducers/notification.reducer';
import game from './reducers/game.reducer';

export default createStore(combineReducers({
  main,
  route,
  canvas,
  notifications,
  game,
}));
