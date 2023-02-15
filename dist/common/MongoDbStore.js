"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongodb_1 = require("mongodb");
const Logger_1 = require("../common/Logger");
class MongoDbStore {
    constructor(serverUrl, collectionName, databaseName) {
        this.serverUrl = serverUrl;
        this.collectionName = collectionName;
        this.databaseName = databaseName;
    }
    static enableCommandResultLogging(client) {
        client.on('commandSucceeded', (event) => {
            const lowerCaseCommandName = event.commandName.toLowerCase();
            if (!['ping', 'hello', 'ismaster', 'hostinfo'].includes(lowerCaseCommandName)) {
                Logger_1.default.info(event);
            }
        });
        client.on('commandFailed', (event) => {
            Logger_1.default.warn(event);
        });
    }
    static customLogger(_message, state) {
        if (state === undefined) {
            return;
        }
        switch (state.type) {
            case 'error':
                Logger_1.default.error(state);
                break;
            default:
                Logger_1.default.info(state);
        }
    }
    ;
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const client = yield mongodb_1.MongoClient.connect(this.serverUrl, {
                useNewUrlParser: true,
                logger: MongoDbStore.customLogger,
                monitorCommands: true,
                loggerLevel: 'error',
                useUnifiedTopology: true
            });
            MongoDbStore.enableCommandResultLogging(client);
            this.db = client.db(this.databaseName);
            yield this.createCollectionIfNotExist(this.db);
        });
    }
    clearCollection() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.deleteMany({});
        });
    }
    createCollectionIfNotExist(db) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const collections = yield db.collections();
            const collectionNames = collections.map(collection => collection.collectionName);
            if (collectionNames.includes(this.collectionName)) {
                Logger_1.default.info(`Collection '${this.collectionName}' found.`);
                this.collection = db.collection(this.collectionName);
            }
            else {
                Logger_1.default.info(`Collection '${this.collectionName}' does not exists, creating...`);
                this.collection = yield db.createCollection(this.collectionName);
                yield this.createIndex();
                Logger_1.default.info(`Collection '${this.collectionName}' created.`);
            }
        });
    }
    createIndex() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = MongoDbStore;
MongoDbStore.defaultQueryTimeoutInMilliseconds = 10000;
//# sourceMappingURL=MongoDbStore.js.map