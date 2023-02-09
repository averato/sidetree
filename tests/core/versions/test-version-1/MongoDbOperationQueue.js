"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MockOperationQueue_1 = require("../../../mocks/MockOperationQueue");
class MongoDbOperationQueue extends MockOperationQueue_1.default {
    constructor(connectionString) {
        super();
        this.connectionString = connectionString;
        console.info('Making typescript ', this.connectionString);
    }
    initialize() { }
    enqueue(didUniqueSuffix, operationBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            throw new Error(`MongoDbOperationQueue: Not implemented. Version: TestVersion1. Inputs: ${didUniqueSuffix}, ${operationBuffer}`);
        });
    }
}
exports.default = MongoDbOperationQueue;
//# sourceMappingURL=MongoDbOperationQueue.js.map