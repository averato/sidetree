'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const MongoDb_1 = require('../common/MongoDb');
const MongoDbConfirmationStore_1 = require('../../lib/core/MongoDbConfirmationStore');
function createConfirmationStore (ConfirmationStoreUri, databaseName) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const ConfirmationStore = new MongoDbConfirmationStore_1.default(ConfirmationStoreUri, databaseName);
    yield ConfirmationStore.initialize();
    return ConfirmationStore;
  });
}
describe('MongoDbConfirmationStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  const config = require('../json/config-test.json');
  const databaseName = 'sidetree-test';
  let confirmationStore;
  beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield MongoDb_1.default.createInmemoryDb(config);
    confirmationStore = yield createConfirmationStore(config.mongoDbConnectionString, databaseName);
  }));
  beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield confirmationStore.clearCollection();
  }));
  describe('getLastSubmitted', () => {
    it('should get the last submitted transaction', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield confirmationStore.submit('anchor-string1', 103);
      yield confirmationStore.submit('anchor-string2', 104);
      yield confirmationStore.submit('anchor-string3', 105);
      yield confirmationStore.submit('anchor-string4', 102);
      yield confirmationStore.submit('anchor-string5', 101);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 105, anchorString: 'anchor-string3'
      }));
    }));
    it('should return undefined if nothing has been submitted yet', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(undefined);
    }));
    it('should return confirmed once confirmed', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield confirmationStore.submit('anchor-string1', 100);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, anchorString: 'anchor-string1'
      }));
      yield confirmationStore.confirm('anchor-string1', 101);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, confirmedAt: 101, anchorString: 'anchor-string1'
      }));
      yield confirmationStore.submit('anchor-string2', 105);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 105, anchorString: 'anchor-string2'
      }));
      yield confirmationStore.confirm('anchor-string2', 106);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 105, confirmedAt: 106, anchorString: 'anchor-string2'
      }));
    }));
    it('should clear the collections using afterReset with undefined args', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield confirmationStore.submit('anchor-string1', 100);
      yield confirmationStore.confirm('anchor-string1', 101);
      yield confirmationStore.submit('anchor-string2', 110);
      yield confirmationStore.resetAfter(undefined);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 110, anchorString: 'anchor-string2'
      }));
    }));
    it('should handle reorg correctly', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield confirmationStore.submit('anchor-string1', 100);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, anchorString: 'anchor-string1'
      }));
      yield confirmationStore.confirm('anchor-string1', 101);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, confirmedAt: 101, anchorString: 'anchor-string1'
      }));
      yield confirmationStore.resetAfter(101);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, confirmedAt: 101, anchorString: 'anchor-string1'
      }));
      yield confirmationStore.resetAfter(100);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, anchorString: 'anchor-string1'
      }));
      yield confirmationStore.confirm('anchor-string1', 102);
      yield expectAsync(confirmationStore.getLastSubmitted()).toBeResolvedTo(jasmine.objectContaining({
        submittedAt: 100, confirmedAt: 102, anchorString: 'anchor-string1'
      }));
    }));
  });
}));
// # sourceMappingURL=MongoDbConfirmationStore.spec.js.map
