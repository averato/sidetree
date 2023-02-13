'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const timeSpan = require('time-span');
const DownloadManager_1 = require('../../lib/core/DownloadManager');
const Logger_1 = require('../../lib/common/Logger');
const MockCas_1 = require('../mocks/MockCas');
describe('DownloadManager', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  const maxConcurrentDownloads = 3;
  const mockSecondsTakenForEachCasFetch = 2;
  let cas;
  let downloadManager;
  const originalDefaultTestTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  describe('constructor', () => {
    it('should use default values if maxConcurrentDownloads is NaN', () => {
      const testDownloadManager = new DownloadManager_1.default(undefined, new MockCas_1.default(mockSecondsTakenForEachCasFetch));
      expect(testDownloadManager['maxConcurrentDownloads']).toEqual(20);
    });
  });
  describe('start', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });
    it('should log error and restart the timer if an error is thrown within start', () => {
      const loggerErrorSpy = spyOn(Logger_1.default, 'error');
      cas = new MockCas_1.default(mockSecondsTakenForEachCasFetch);
      downloadManager = new DownloadManager_1.default(maxConcurrentDownloads, cas);
      downloadManager['activeDownloads'] = 1;
      downloadManager.start();
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });
  describe('download', () => {
    beforeAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
      cas = new MockCas_1.default(mockSecondsTakenForEachCasFetch);
      downloadManager = new DownloadManager_1.default(maxConcurrentDownloads, cas);
      downloadManager.start();
    });
    afterAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalDefaultTestTimeout;
    });
    it('should queue up downloads if max concurrent download count is exceeded.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const content1 = yield cas.write(Buffer.from('1'));
      const content2 = yield cas.write(Buffer.from('2'));
      const content3 = yield cas.write(Buffer.from('3'));
      const content4 = yield cas.write(Buffer.from('4'));
      const endTimer = timeSpan();
      const maxContentSizeInBytes = 20000000;
      downloadManager.download(content1, maxContentSizeInBytes);
      downloadManager.download(content2, maxContentSizeInBytes);
      downloadManager.download(content3, maxContentSizeInBytes);
      yield downloadManager.download(content4, maxContentSizeInBytes);
      const totalDownloadTimeInMs = endTimer.rounded();
      const minimalTimeTakenInMs = mockSecondsTakenForEachCasFetch * 2 * 1000;
      expect(totalDownloadTimeInMs).toBeGreaterThanOrEqual(minimalTimeTakenInMs);
    }));
  });
  describe('downloadAsync', () => {
    beforeEach(() => {
      jasmine.clock().install();
      cas = new MockCas_1.default(mockSecondsTakenForEachCasFetch);
      downloadManager = new DownloadManager_1.default(maxConcurrentDownloads, cas);
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });
    it('should log error if CAS read throws', () => {
      spyOn(cas, 'read').and.throwError('expected test error');
      const loggerErrorSpy = spyOn(Logger_1.default, 'error');
      downloadManager['downloadAsync']({});
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });
}));
// # sourceMappingURL=DownloadManager.spec.js.map
