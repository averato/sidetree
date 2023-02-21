"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = require("../../lib/common/Logger");
const mongodb_1 = require("mongodb");
const MongoDb_1 = require("./MongoDb");
const MongoDbStore_1 = require("../../lib/common/MongoDbStore");
describe('MongoDbStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const config = require('../json/config-test.json');
    beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield MongoDb_1.default.createInmemoryDb(config);
    }));
    beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    }));
    it('should invoke command monitoring logger with different log level according to command response status', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        spyOn(Logger_1.default, 'info');
        spyOn(Logger_1.default, 'warn');
        spyOn(Logger_1.default, 'error');
        const client = yield mongodb_1.MongoClient.connect(config.mongoDbConnectionString, {
            monitorCommands: true
        });
        MongoDbStore_1.default.enableCommandResultLogging(client);
        yield expectAsync(client.db('sidetree-test').collection('service').findOne({ id: 1 })).toBeResolved();
        expect(Logger_1.default.info).toHaveBeenCalledWith(jasmine.objectContaining({ commandName: 'find' }));
        yield expectAsync(client.db('sidetree-test').collection('service').dropIndex('test')).toBeRejected();
        expect(Logger_1.default.warn).toHaveBeenCalledWith(jasmine.objectContaining({ commandName: 'dropIndexes' }));
        client.emit('commandSucceeded', {
            commandName: 'ping',
            address: 'ping',
            requestId: 0,
            duration: 1000,
            reply: 'pong',
            hasServiceId: false
        });
        expect(Logger_1.default.info).not.toHaveBeenCalledWith(jasmine.objectContaining({ commandName: 'ping' }));
    }));
    it('should invoke logger with corresponding method according to the passed state', () => {
        spyOn(Logger_1.default, 'info');
        spyOn(Logger_1.default, 'warn');
        spyOn(Logger_1.default, 'error');
        expect(Logger_1.default.info).not.toHaveBeenCalled();
        const state = {
            className: 'className',
            date: 0,
            message: 'message',
            pid: 0,
            type: 'debug'
        };
        state.type = 'info';
        expect(Logger_1.default.info).toHaveBeenCalledWith(state);
        state.type = 'error';
        expect(Logger_1.default.error).toHaveBeenCalledWith(state);
        state.type = 'whatever';
        expect(Logger_1.default.info).toHaveBeenCalledWith(state);
    });
}));
//# sourceMappingURL=MongoDbStore.spec.js.map