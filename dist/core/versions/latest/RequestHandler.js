"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Delta_1 = require("./Delta");
const Did_1 = require("./Did");
const DocumentComposer_1 = require("./DocumentComposer");
const ErrorCode_1 = require("./ErrorCode");
const JsonAsync_1 = require("./util/JsonAsync");
const Logger_1 = require("../../../common/Logger");
const Operation_1 = require("./Operation");
const OperationProcessor_1 = require("./OperationProcessor");
const OperationType_1 = require("../../enums/OperationType");
const ResponseStatus_1 = require("../../../common/enums/ResponseStatus");
const SidetreeError_1 = require("../../../common/SidetreeError");
class RequestHandler {
    constructor(resolver, operationQueue, didMethodName) {
        this.resolver = resolver;
        this.operationQueue = operationQueue;
        this.didMethodName = didMethodName;
        this.operationProcessor = new OperationProcessor_1.default();
    }
    handleOperationRequest(request) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Handling operation request of size ${request.length} bytes...`);
            let operationModel;
            try {
                const operationRequest = yield JsonAsync_1.default.parse(request);
                if (operationRequest.type === OperationType_1.default.Create ||
                    operationRequest.type === OperationType_1.default.Recover ||
                    operationRequest.type === OperationType_1.default.Update) {
                    Delta_1.default.validateDelta(operationRequest.delta);
                }
                operationModel = yield Operation_1.default.parse(request);
                if (yield this.operationQueue.contains(operationModel.didUniqueSuffix)) {
                    const errorMessage = `An operation request already exists in queue for DID '${operationModel.didUniqueSuffix}', only one is allowed at a time.`;
                    throw new SidetreeError_1.default(ErrorCode_1.default.QueueingMultipleOperationsPerDidNotAllowed, errorMessage);
                }
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default) {
                    Logger_1.default.info(`Bad request: ${error.code}`);
                    Logger_1.default.info(`Error message: ${error.message}`);
                    return {
                        status: ResponseStatus_1.default.BadRequest,
                        body: { code: error.code, message: error.message }
                    };
                }
                Logger_1.default.info(`Bad request: ${error}`);
                return {
                    status: ResponseStatus_1.default.BadRequest
                };
            }
            try {
                Logger_1.default.info(`Operation type: '${operationModel.type}', DID unique suffix: '${operationModel.didUniqueSuffix}'`);
                let response;
                switch (operationModel.type) {
                    case OperationType_1.default.Create:
                        response = yield this.handleCreateRequest(operationModel);
                        break;
                    case OperationType_1.default.Update:
                    case OperationType_1.default.Recover:
                    case OperationType_1.default.Deactivate:
                        response = {
                            status: ResponseStatus_1.default.Succeeded
                        };
                        break;
                    default:
                        response = {
                            status: ResponseStatus_1.default.BadRequest,
                            body: { code: ErrorCode_1.default.RequestHandlerUnknownOperationType, message: `Unsupported operation type '${operationModel.type}'.` }
                        };
                }
                if (response.status === ResponseStatus_1.default.Succeeded) {
                    yield this.operationQueue.enqueue(operationModel.didUniqueSuffix, operationModel.operationBuffer);
                }
                return response;
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default) {
                    Logger_1.default.info(`Sidetree error: ${error.code} ${error.message}`);
                    return {
                        status: ResponseStatus_1.default.BadRequest,
                        body: { code: error.code, message: error.message }
                    };
                }
                Logger_1.default.info(`Unexpected error: ${error}`);
                return {
                    status: ResponseStatus_1.default.ServerError
                };
            }
        });
    }
    handleCreateRequest(operationModel) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const didState = yield this.applyCreateOperation(operationModel);
            if (didState === undefined) {
                return {
                    status: ResponseStatus_1.default.BadRequest,
                    body: 'Invalid create operation.'
                };
            }
            const didString = `did:${this.didMethodName}:${operationModel.didUniqueSuffix}`;
            const published = false;
            const did = yield Did_1.default.create(didString, this.didMethodName);
            const document = DocumentComposer_1.default.transformToExternalDocument(didState, did, published);
            return {
                status: ResponseStatus_1.default.Succeeded,
                body: document
            };
        });
    }
    handleResolveRequest(shortOrLongFormDid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                Logger_1.default.info(`Handling resolution request for: ${shortOrLongFormDid}...`);
                const did = yield Did_1.default.create(shortOrLongFormDid, this.didMethodName);
                let didState;
                let published = false;
                if (did.isShortForm) {
                    didState = yield this.resolver.resolve(did.uniqueSuffix);
                    if (didState !== undefined) {
                        published = true;
                    }
                }
                else {
                    [didState, published] = yield this.resolveLongFormDid(did);
                }
                if (didState === undefined) {
                    Logger_1.default.info(`DID not found for DID '${shortOrLongFormDid}'...`);
                    return {
                        status: ResponseStatus_1.default.NotFound,
                        body: { code: ErrorCode_1.default.DidNotFound, message: 'DID Not Found' }
                    };
                }
                const document = DocumentComposer_1.default.transformToExternalDocument(didState, did, published);
                const didDeactivated = didState.nextRecoveryCommitmentHash === undefined;
                const status = didDeactivated ? ResponseStatus_1.default.Deactivated : ResponseStatus_1.default.Succeeded;
                Logger_1.default.info(`DID Document found for DID '${shortOrLongFormDid}'...`);
                return {
                    status,
                    body: document
                };
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default) {
                    Logger_1.default.info(`Bad request. Code: ${error.code}. Message: ${error.message}`);
                    return {
                        status: ResponseStatus_1.default.BadRequest,
                        body: { code: error.code, message: error.message }
                    };
                }
                Logger_1.default.info(`Unexpected error: ${error}`);
                return {
                    status: ResponseStatus_1.default.ServerError
                };
            }
        });
    }
    resolveLongFormDid(did) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Handling long-form DID resolution of DID '${did.longForm}'...`);
            let didState = yield this.resolver.resolve(did.uniqueSuffix);
            if (didState !== undefined) {
                return [didState, true];
            }
            didState = yield this.applyCreateOperation(did.createOperation);
            return [didState, false];
        });
    }
    applyCreateOperation(createOperation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operationWithMockedAnchorTime = {
                didUniqueSuffix: createOperation.didUniqueSuffix,
                type: OperationType_1.default.Create,
                transactionTime: 0,
                transactionNumber: 0,
                operationIndex: 0,
                operationBuffer: createOperation.operationBuffer
            };
            const newDidState = yield this.operationProcessor.apply(operationWithMockedAnchorTime, undefined);
            return newDidState;
        });
    }
}
exports.default = RequestHandler;
//# sourceMappingURL=RequestHandler.js.map