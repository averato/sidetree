"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const SharedErrorCode_1 = require("../common/SharedErrorCode");
const SidetreeError_1 = require("./SidetreeError");
class ReadableStream {
    static readAll(stream, maxAllowedSizeInBytes) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let content = Buffer.alloc(0);
            let currentSizeInBytes = 0;
            stream.on('readable', () => {
                let chunk = stream.read();
                while (chunk !== null) {
                    currentSizeInBytes += chunk.length;
                    if (maxAllowedSizeInBytes !== undefined &&
                        currentSizeInBytes > maxAllowedSizeInBytes) {
                        const error = new SidetreeError_1.default(SharedErrorCode_1.default.ReadableStreamMaxAllowedDataSizeExceeded, `Max data size allowed: ${maxAllowedSizeInBytes} bytes, aborted reading at ${currentSizeInBytes} bytes.`);
                        stream.destroy(error);
                    }
                    content = Buffer.concat([content, chunk]);
                    chunk = stream.read();
                }
            });
            const readBody = new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });
            yield readBody;
            return content;
        });
    }
}
exports.default = ReadableStream;
//# sourceMappingURL=ReadableStream.js.map