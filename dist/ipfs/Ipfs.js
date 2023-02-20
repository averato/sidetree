'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const HttpStatus = require('http-status');
const crypto = require('crypto');
const FetchResultCode_1 = require('../common/enums/FetchResultCode');
const IpfsErrorCode_1 = require('../ipfs/IpfsErrorCode');
const Logger_1 = require('../common/Logger');
const ReadableStream_1 = require('../common/ReadableStream');
const SharedErrorCode_1 = require('../common/SharedErrorCode');
const SidetreeError_1 = require('../common/SidetreeError');
const Timeout_1 = require('./Util/Timeout');
const node_fetch_1 = require('node-fetch');
const Cids = require('cids');
class Ipfs {
  constructor (uri, fetchTimeoutInSeconds) {
    this.uri = uri;
    this.fetchTimeoutInSeconds = fetchTimeoutInSeconds;
    this.fetch = node_fetch_1.default;
  }

  write (content) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const multipartBoundaryString = crypto.randomBytes(32).toString('hex');
      const beginBoundary = Buffer.from(`--${multipartBoundaryString}\n`);
      const contentDisposition = Buffer.from(`Content-Disposition: form-data;\n`);
      const firstPartContentType = Buffer.from(`Content-Type: application/octet-stream\n\n`);
      const endBoundary = Buffer.from(`\n--${multipartBoundaryString}--`);
      const requestBody = Buffer.concat([beginBoundary, contentDisposition, firstPartContentType, content, endBoundary]);
      const requestParameters = {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${multipartBoundaryString}` },
        body: requestBody
      };
      const addUrl = new URL('/api/v0/add', this.uri).toString();
      const response = yield this.fetch(addUrl, requestParameters);
      if (response.status !== HttpStatus.OK) {
        Logger_1.default.error(`IPFS write error response status: ${response.status}`);
        if (response.body) {
          const errorBody = yield ReadableStream_1.default.readAll(response.body);
          Logger_1.default.error(`IPFS write error body: ${errorBody}`);
        }
        throw new SidetreeError_1.default(IpfsErrorCode_1.default.IpfsFailedWritingContent, `Failed writing content of ${content.length} bytes.`);
      }
      const body = yield ReadableStream_1.default.readAll(response.body);
      const casUri = JSON.parse(body.toString()).Hash;
      Logger_1.default.info(`Wrote ${content.length} byte content as IPFS CID: ${casUri}`);
      return casUri;
    });
  }

  read (casUri, maxSizeInBytes) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      try {
        new Cids(casUri);
      } catch (error) {
        if (error instanceof SidetreeError_1.default) {
          Logger_1.default.info(`'${casUri}' is not a valid CID: ${SidetreeError_1.default.stringify(error)}`);
          return { code: FetchResultCode_1.default.InvalidHash };
        }
        throw error;
      }
      let fetchResult;
      try {
        const fetchContentPromise = this.fetchContent(casUri, maxSizeInBytes);
        fetchResult = yield Timeout_1.default.timeout(fetchContentPromise, this.fetchTimeoutInSeconds * 1000);
      } catch (error) {
        if (error instanceof SidetreeError_1.default) {
          if (error.code === IpfsErrorCode_1.default.TimeoutPromiseTimedOut) {
            Logger_1.default.info(`Timed out fetching CID '${casUri}'.`);
          } else {
            const errorMessage = `Unexpected error while fetching CID '${casUri}'. ` +
                            `Investigate and fix: ${SidetreeError_1.default.stringify(error)}`;
            Logger_1.default.error(errorMessage);
          }
        }
        return { code: FetchResultCode_1.default.NotFound };
      }
      if (fetchResult.code === FetchResultCode_1.default.Success) {
        yield this.pinContent(casUri);
        Logger_1.default.info(`Read and pinned ${fetchResult.content.length} bytes for CID: ${casUri}.`);
      }
      return fetchResult;
    });
  }

  fetchContent (base58Multihash, maxSizeInBytes) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let response;
      try {
        const catUrl = new URL(`/api/v0/cat?arg=${base58Multihash}&length=${maxSizeInBytes + 1}`, this.uri).toString();
        response = yield this.fetch(catUrl, { method: 'POST' });
      } catch (error) {
        if (error instanceof SidetreeError_1.default && error.code === 'ECONNREFUSED') {
          return { code: FetchResultCode_1.default.CasNotReachable };
        }
        throw error;
      }
      if (response.status !== HttpStatus.OK) {
        const body = yield ReadableStream_1.default.readAll(response.body);
        const json = JSON.parse(body.toString());
        if (json.Message === 'this dag node is a directory') {
          return { code: FetchResultCode_1.default.NotAFile };
        }
        Logger_1.default.info(`Received response code ${response.status} from IPFS for CID ${base58Multihash}: ${json})}`);
        return { code: FetchResultCode_1.default.NotFound };
      }
      const fetchResult = { code: FetchResultCode_1.default.Success };
      try {
        fetchResult.content = yield ReadableStream_1.default.readAll(response.body, maxSizeInBytes);
        return fetchResult;
      } catch (error) {
        if (error instanceof SidetreeError_1.default &&
                    error.code === SharedErrorCode_1.default.ReadableStreamMaxAllowedDataSizeExceeded) {
          return { code: FetchResultCode_1.default.MaxSizeExceeded };
        }
        throw error;
      }
    });
  }

  pinContent (hash) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const pinUrl = new URL(`/api/v0/pin/add?arg=${hash}`, this.uri).toString();
      yield this.fetch(pinUrl, { method: 'POST' });
    });
  }
}
exports.default = Ipfs;
// # sourceMappingURL=Ipfs.js.map
