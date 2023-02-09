"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
class MongoDb {
    static createInmemoryDb(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!MongoDb.initialized) {
                const prefix = 'mongodb://localhost:';
                if (config.mongoDbConnectionString.startsWith(prefix)) {
                    const port = parseInt(config.mongoDbConnectionString.substr(prefix.length));
                    yield MongoMemoryServer.create({
                        instance: {
                            port
                        }
                    });
                }
                MongoDb.initialized = true;
            }
        });
    }
}
exports.default = MongoDb;
//# sourceMappingURL=MongoDb.js.map