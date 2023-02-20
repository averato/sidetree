'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const crypto = require('crypto');
const EventCode_1 = require('./EventCode');
const EventEmitter_1 = require('../common/EventEmitter');
const Logger_1 = require('../common/Logger');
class DownloadManager {
  constructor (maxConcurrentDownloads, cas) {
    this.maxConcurrentDownloads = maxConcurrentDownloads;
    this.cas = cas;
    this.pendingDownloads = [];
    this.activeDownloads = new Map();
    this.completedDownloads = new Map();
    if (isNaN(maxConcurrentDownloads)) {
      const defaultMaxConcurrentDownloads = 20;
      Logger_1.default.info(`Maximum concurrent CAS download count not given, defaulting to ${defaultMaxConcurrentDownloads}.`);
      this.maxConcurrentDownloads = defaultMaxConcurrentDownloads;
    }
  }

  start () {
    try {
      const completedDownloadHandles = [];
      for (const [downloadHandle, downloadInfo] of this.activeDownloads) {
        if (downloadInfo.completed) {
          this.completedDownloads.set(downloadHandle, downloadInfo.fetchResult);
          completedDownloadHandles.push(downloadHandle);
          downloadInfo.resolve();
        }
      }
      for (const downloadHandle of completedDownloadHandles) {
        this.activeDownloads.delete(downloadHandle);
      }
      const availableDownloadLanes = this.maxConcurrentDownloads - this.activeDownloads.size;
      if (availableDownloadLanes <= 0) {
        return;
      }
      if (this.pendingDownloads.length === 0) {
        return;
      }
      for (let i = 0; i < this.pendingDownloads.length && i < availableDownloadLanes; i++) {
        const downloadInfo = this.pendingDownloads[i];
        this.downloadAsync(downloadInfo);
        this.activeDownloads.set(downloadInfo.handle, downloadInfo);
      }
      this.pendingDownloads.splice(0, availableDownloadLanes);
    } catch (error) {
      Logger_1.default.error(`Encountered unhandled/unexpected error in DownloadManager, must investigate and fix: ${error}`);
    } finally {
      setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function * () { return this.start(); }), 1000);
    }
  }

  download (contentHash, maxSizeInBytes) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const handle = crypto.randomBytes(32);
      const fetchPromise = new Promise(resolve => {
        const downloadInfo = { handle, contentHash, maxSizeInBytes, resolve, completed: false, content: undefined };
        this.pendingDownloads.push(downloadInfo);
      });
      yield fetchPromise;
      const fetchResult = this.completedDownloads.get(handle);
      this.completedDownloads.delete(handle);
      EventEmitter_1.default.emit(EventCode_1.default.SidetreeDownloadManagerDownload, { code: fetchResult.code });
      return fetchResult;
    });
  }

  downloadAsync (downloadInfo) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let contentHash = '';
      try {
        contentHash = downloadInfo.contentHash;
        const fetchResult = yield this.cas.read(contentHash, downloadInfo.maxSizeInBytes);
        downloadInfo.fetchResult = fetchResult;
      } catch (error) {
        Logger_1.default.error(`Unexpected error while downloading '${contentHash}, investigate and fix ${error}'.`);
      } finally {
        downloadInfo.completed = true;
      }
    });
  }
}
exports.default = DownloadManager;
// # sourceMappingURL=DownloadManager.js.map
