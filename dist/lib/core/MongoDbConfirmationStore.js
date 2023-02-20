"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MongoDbStore_1 = require("../common/MongoDbStore");
class MongoDbConfirmationStore extends MongoDbStore_1.default {
    constructor(serverUrl, databaseName) {
        super(serverUrl, MongoDbConfirmationStore.collectionName, databaseName);
    }
    confirm(anchorString, confirmedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.updateMany({ anchorString }, { $set: { confirmedAt } });
        });
    }
    resetAfter(confirmedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.updateMany({ confirmedAt: { $gt: confirmedAt } }, { $set: { confirmedAt: undefined } });
        });
    }
    getLastSubmitted() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.collection.find().sort({ submittedAt: -1 }).limit(1).toArray();
            if (response.length === 0) {
                return undefined;
            }
            if (response[0].confirmedAt === null) {
                response[0].confirmedAt = undefined;
            }
            return response[0];
        });
    }
    submit(anchorString, submittedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.insertOne({
                anchorString,
                submittedAt
            });
        });
    }
    createIndex() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.createIndex({ anchorString: 1 });
            yield this.collection.createIndex({ submittedAt: 1 });
            yield this.collection.createIndex({ confirmedAt: 1 });
        });
    }
}
exports.default = MongoDbConfirmationStore;
MongoDbConfirmationStore.collectionName = 'confirmations';
//# sourceMappingURL=MongoDbConfirmationStore.js.map