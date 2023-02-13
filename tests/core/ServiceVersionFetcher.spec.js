'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const ReadableStream_1 = require('../../lib/common/ReadableStream');
const ServiceVersionFetcher_1 = require('../../lib/core/ServiceVersionFetcher');
describe('ServiceVersionFetcher', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('getVersion()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get version by making a REST api call.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const expectedServiceVersion = { name: 'test-service', version: 'x.y.z' };
      const serviceVersionFetcher = new ServiceVersionFetcher_1.default('someURI');
      const fetchSpy = spyOn(serviceVersionFetcher, 'fetch').and.returnValue(Promise.resolve({ status: 200 }));
      const readAllSpy = spyOn(ReadableStream_1.default, 'readAll').and.returnValue(Promise.resolve(Buffer.from(JSON.stringify(expectedServiceVersion))));
      const version = yield serviceVersionFetcher.getVersion();
      expect(fetchSpy).toHaveBeenCalled();
      expect(readAllSpy).toHaveBeenCalled();
      expect(version).toEqual(expectedServiceVersion);
    }));
    it('should return undefined version if there is an exception during version REST call.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const serviceVersionFetcher = new ServiceVersionFetcher_1.default('someURI');
      const fetchSpy = spyOn(serviceVersionFetcher, 'fetch').and.throwError('some error.');
      const version = yield serviceVersionFetcher.getVersion();
      expect(fetchSpy).toHaveBeenCalled();
      expect(version.name).toEqual('undefined');
      expect(version.version).toEqual('undefined');
    }));
    it('should not fetch again if last fetch was within the threshold.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const serviceVersionFetcher = new ServiceVersionFetcher_1.default('someURI');
      const fetchSpy = spyOn(serviceVersionFetcher, 'fetch').and.throwError('some error.');
      const tryGetServiceVersionSpy = spyOn(serviceVersionFetcher, 'tryGetServiceVersion').and.callThrough();
      yield serviceVersionFetcher.getVersion();
      expect(fetchSpy).toHaveBeenCalled();
      expect(tryGetServiceVersionSpy).toHaveBeenCalled();
      yield serviceVersionFetcher.getVersion();
      expect(tryGetServiceVersionSpy.calls.count()).toEqual(1);
    }));
    it('should fetch again if last fetch was outside the threshold.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const expectedServiceVersion = { name: 'test-service', version: 'x.y.z' };
      const serviceVersionFetcher = new ServiceVersionFetcher_1.default('someURI');
      const fetchSpy = spyOn(serviceVersionFetcher, 'fetch').and.returnValue(Promise.resolve({ status: 200 }));
      const readAllSpy = spyOn(ReadableStream_1.default, 'readAll').and.returnValue(Promise.resolve(Buffer.from(JSON.stringify(expectedServiceVersion))));
      const tryGetServiceVersionSpy = spyOn(serviceVersionFetcher, 'tryGetServiceVersion').and.callThrough();
      yield serviceVersionFetcher.getVersion();
      expect(fetchSpy).toHaveBeenCalled();
      expect(readAllSpy).toHaveBeenCalled();
      expect(tryGetServiceVersionSpy).toHaveBeenCalled();
      const fetchWaitTimeInMillisecs = (10 * 60 * 1000) + 1;
      const futureTimeInMillisecs = Date.now() + fetchWaitTimeInMillisecs;
      spyOn(Date, 'now').and.returnValue(futureTimeInMillisecs);
      yield serviceVersionFetcher.getVersion();
      expect(fetchSpy.calls.count()).toEqual(2);
      expect(tryGetServiceVersionSpy.calls.count()).toEqual(2);
    }));
  }));
}));
// # sourceMappingURL=ServiceVersionFetcher.spec.js.map
