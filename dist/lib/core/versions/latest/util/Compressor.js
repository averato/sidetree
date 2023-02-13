'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const util = require('util');
const zlib = require('zlib');
const ErrorCode_1 = require('../ErrorCode');
const SidetreeError_1 = require('../../../../common/SidetreeError');
class Compressor {
  static compress (inputAsBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const result = yield Compressor.gzipAsync(inputAsBuffer);
      return result;
    });
  }

  static decompress (inputAsBuffer, maxAllowedDecompressedSizeInBytes) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const gunzip = zlib.createGunzip();
      let content = Buffer.alloc(0);
      gunzip.on('data', (chunk) => {
        const currentContentLength = content.length + chunk.length;
        if (currentContentLength > maxAllowedDecompressedSizeInBytes) {
          const error = new SidetreeError_1.default(ErrorCode_1.default.CompressorMaxAllowedDecompressedDataSizeExceeded, `Max data size allowed: ${maxAllowedDecompressedSizeInBytes} bytes, aborted decompression at ${currentContentLength} bytes.`);
          gunzip.destroy(error);
          return;
        }
        content = Buffer.concat([content, chunk]);
      });
      const readBody = new Promise((resolve, reject) => {
        gunzip.on('end', resolve);
        gunzip.on('error', reject);
      });
      gunzip.end(inputAsBuffer);
      yield readBody;
      return content;
    });
  }
}
exports.default = Compressor;
Compressor.estimatedDecompressionMultiplier = 3;
Compressor.gzipAsync = util.promisify(zlib.gzip);
// # sourceMappingURL=Compressor.js.map
