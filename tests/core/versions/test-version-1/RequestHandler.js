'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class RequestHandler {
  constructor (resolver, operationQueue, didMethodName) {
    this.resolver = resolver;
    this.operationQueue = operationQueue;
    this.didMethodName = didMethodName;
    console.info(this.resolver, this.operationQueue, this.didMethodName);
  }

  handleOperationRequest (request) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw new Error(`RequestHandler: Not implemented. Version: TestVersion1. Inputs: ${request}`);
    });
  }

  handleResolveRequest (didOrDidDocument) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw new Error(`RequestHandler: Not implemented. Version: TestVersion1. Inputs: ${didOrDidDocument}`);
    });
  }
}
exports.default = RequestHandler;
// # sourceMappingURL=RequestHandler.js.map
