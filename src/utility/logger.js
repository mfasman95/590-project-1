/* eslint-disable */
const chalk = require('chalk');

const NODE_ENV = process.env.NODE_ENV || 'dev';

const logLoop = (chalkType, arr) => {
  if (NODE_ENV === 'dev' || NODE_ENV === 'test') {
    for (let i = 0; i < arr.length; i++) {
      const data = arr[i];
      switch (typeof data) {
        case 'object': {
          if (data instanceof Array) {
            for (let i = 0; i < data.length; i++) console.log(chalkType(data[i]));
          }
          else {
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) console.log(chalkType(data[keys[i]]));
          }
          break;
        }
        default: { console.log(chalkType(data)); break; }
      }
    }
    return true;
  }
  return undefined;
};

module.exports = {
  error: (...data) => logLoop(chalk.bold.red, data),
  warn: (...data) => logLoop(chalk.bold.yellow, data),
  log: (...data) => logLoop(chalk.bold.white, data),
  socketIn: (...data) => logLoop(chalk.bgWhite.blue, data),
  socketOut: (...data) => logLoop(chalk.bgWhite.red, data),
};
