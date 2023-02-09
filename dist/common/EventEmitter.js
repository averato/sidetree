"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const LogColor_1 = require("./LogColor");
const Logger_1 = require("./Logger");
class EventEmitter {
    static initialize(customEventEmitter) {
        if (customEventEmitter !== undefined) {
            EventEmitter.customEvenEmitter = customEventEmitter;
            Logger_1.default.info('Custom event emitter given.');
        }
    }
    static emit(eventCode, eventData) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (EventEmitter.customEvenEmitter !== undefined) {
                yield EventEmitter.customEvenEmitter.emit(eventCode, eventData);
            }
            if (eventData === undefined) {
                Logger_1.default.info(LogColor_1.default.lightBlue(`Event emitted: ${LogColor_1.default.green(eventCode)}`));
            }
            else {
                Logger_1.default.info(LogColor_1.default.lightBlue(`Event emitted: ${LogColor_1.default.green(eventCode)}: ${JSON.stringify(eventData)}`));
            }
        });
    }
}
exports.default = EventEmitter;
//# sourceMappingURL=EventEmitter.js.map