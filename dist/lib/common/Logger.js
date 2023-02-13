'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ConsoleLogger_1 = require('./ConsoleLogger');
class Logger {
  static initialize (customLogger) {
    if (customLogger !== undefined) {
      Logger.singleton = customLogger;
    }
  }

  static info (data) {
    Logger.singleton.info(data);
  }

  static warn (data) {
    Logger.singleton.warn(data);
  }

  static error (data) {
    Logger.singleton.error(data);
  }
}
exports.default = Logger;
Logger.singleton = new ConsoleLogger_1.default();
// # sourceMappingURL=Logger.js.map
