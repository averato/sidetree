"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = require("../common/Logger");
const ReadableStream_1 = require("../common/ReadableStream");
const node_fetch_1 = require("node-fetch");
class ServiceVersionFetcher {
    constructor(uri) {
        this.uri = uri;
        this.fetch = node_fetch_1.default;
        this.lastTryFetchTime = 0;
        this.cachedVersion = ServiceVersionFetcher.emptyServiceVersion;
    }
    getVersion() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Date.now() - this.lastTryFetchTime > ServiceVersionFetcher.fetchWaitTimeInMilliseconds) {
                this.cachedVersion = yield this.tryGetServiceVersion();
            }
            return this.cachedVersion;
        });
    }
    tryGetServiceVersion() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this.lastTryFetchTime = Date.now();
                const versionUri = `${this.uri}/version`;
                Logger_1.default.info(`Trying to get the version info from the blockchain service. Url: ${versionUri}`);
                const response = yield this.fetch(versionUri);
                const responseBodyBuffer = yield ReadableStream_1.default.readAll(response.body);
                Logger_1.default.info(`Received version response from the blockchain service: ${responseBodyBuffer.toString()}`);
                return JSON.parse(responseBodyBuffer.toString());
            }
            catch (e) {
                Logger_1.default.error(`Ignoring the exception during blockchain service version retrieval: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
            }
            return ServiceVersionFetcher.emptyServiceVersion;
        });
    }
    static get emptyServiceVersion() {
        return {
            name: 'undefined',
            version: 'undefined'
        };
    }
}
exports.default = ServiceVersionFetcher;
ServiceVersionFetcher.fetchWaitTimeInMilliseconds = 600000;
//# sourceMappingURL=ServiceVersionFetcher.js.map