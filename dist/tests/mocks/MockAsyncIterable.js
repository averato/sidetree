"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockAsyncIterable {
    constructor(doneValue, notDoneValue, numOfElements) {
        this.doneValue = {
            value: undefined,
            done: true
        };
        this.notDoneValue = {
            value: undefined,
            done: false
        };
        this.indexTracker = {
            numOfElements: Number.MAX_SAFE_INTEGER,
            currentIndex: 0
        };
        this.doneValue.value = doneValue;
        this.notDoneValue.value = notDoneValue;
        if (numOfElements !== undefined) {
            this.indexTracker.numOfElements = numOfElements;
        }
    }
    next(...args) {
        if (args[0] && args[0] === 'notDone') {
            return new Promise((resolve) => {
                resolve(this.notDoneValue);
            });
        }
        return new Promise((resolve) => {
            resolve(this.doneValue);
        });
    }
    [Symbol.asyncIterator]() {
        const notDoneValue = this.notDoneValue;
        const indexTracker = this.indexTracker;
        const doneValue = this.doneValue;
        return {
            next() {
                if (indexTracker.currentIndex < indexTracker.numOfElements) {
                    indexTracker.currentIndex++;
                    return Promise.resolve(notDoneValue);
                }
                return Promise.resolve(doneValue);
            }
        };
    }
}
exports.default = MockAsyncIterable;
//# sourceMappingURL=MockAsyncIterable.js.map