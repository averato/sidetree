"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CreateOperation_1 = tslib_1.__importDefault(require("./CreateOperation"));
const Delta_1 = tslib_1.__importDefault(require("./Delta"));
const Encoder_1 = tslib_1.__importDefault(require("./Encoder"));
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const JsonCanonicalizer_1 = tslib_1.__importDefault(require("./util/JsonCanonicalizer"));
const Multihash_1 = tslib_1.__importDefault(require("./Multihash"));
const OperationType_1 = tslib_1.__importDefault(require("../../enums/OperationType"));
const SidetreeError_1 = tslib_1.__importDefault(require("../../../common/SidetreeError"));
class Did {
    constructor(did, didMethodName) {
        this.didMethodName = didMethodName;
        const didPrefix = `did:${didMethodName}:`;
        if (!did.startsWith(didPrefix)) {
            throw new SidetreeError_1.default(ErrorCode_1.default.DidIncorrectPrefix, `Expected DID prefix ${didPrefix} not given in DID.`);
        }
        const didWithoutPrefix = did.split(didPrefix)[1];
        const didSplitLength = didWithoutPrefix.split(':').length;
        if (didSplitLength === 1) {
            this.isShortForm = true;
        }
        else {
            this.isShortForm = false;
        }
        if (this.isShortForm) {
            this.uniqueSuffix = did.substring(didPrefix.length);
        }
        else {
            this.uniqueSuffix = did.substring(didPrefix.length, did.lastIndexOf(':'));
            this.longForm = did;
        }
        if (this.uniqueSuffix.length === 0) {
            throw new SidetreeError_1.default(ErrorCode_1.default.DidNoUniqueSuffix);
        }
        this.shortForm = didPrefix + this.uniqueSuffix;
    }
    static create(didString, didMethodName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const did = new Did(didString, didMethodName);
            if (!did.isShortForm) {
                const initialStateEncodedJcs = Did.getInitialStateFromDidStringWithExtraColon(didString);
                const createOperation = Did.constructCreateOperationFromEncodedJcs(initialStateEncodedJcs);
                const suffixDataJcsBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(createOperation.suffixData);
                const suffixDataHashMatchesUniqueSuffix = Multihash_1.default.verifyEncodedMultihashForContent(suffixDataJcsBuffer, did.uniqueSuffix);
                if (!suffixDataHashMatchesUniqueSuffix) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.DidUniqueSuffixFromInitialStateMismatch);
                }
                did.createOperation = createOperation;
            }
            return did;
        });
    }
    static computeUniqueSuffix(suffixDataModel) {
        const hashAlgorithmInMultihashCode = 18;
        const suffixDataBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(suffixDataModel);
        const multihash = Multihash_1.default.hash(suffixDataBuffer, hashAlgorithmInMultihashCode);
        const encodedMultihash = Encoder_1.default.encode(multihash);
        return encodedMultihash;
    }
    static getInitialStateFromDidStringWithExtraColon(didString) {
        const lastColonIndex = didString.lastIndexOf(':');
        const initialStateValue = didString.substring(lastColonIndex + 1);
        return initialStateValue;
    }
    static constructCreateOperationFromEncodedJcs(initialStateEncodedJcs) {
        const initialStateDecodedJcs = Encoder_1.default.decodeAsString(initialStateEncodedJcs);
        let initialStateObject;
        try {
            initialStateObject = JSON.parse(initialStateDecodedJcs);
        }
        catch (_a) {
            throw new SidetreeError_1.default(ErrorCode_1.default.DidInitialStateJcsIsNotJson, 'Long form initial state should be encoded jcs.');
        }
        Did.validateInitialStateJcs(initialStateEncodedJcs, initialStateObject);
        Delta_1.default.validateDelta(initialStateObject.delta);
        const createOperationRequest = {
            type: OperationType_1.default.Create,
            suffixData: initialStateObject.suffixData,
            delta: initialStateObject.delta
        };
        const createOperationBuffer = Buffer.from(JSON.stringify(createOperationRequest));
        const createOperation = CreateOperation_1.default.parseObject(createOperationRequest, createOperationBuffer);
        return createOperation;
    }
    static validateInitialStateJcs(initialStateEncodedJcs, initialStateObject) {
        const expectedInitialState = Encoder_1.default.encode(JsonCanonicalizer_1.default.canonicalizeAsBuffer(initialStateObject));
        if (expectedInitialState !== initialStateEncodedJcs) {
            throw new SidetreeError_1.default(ErrorCode_1.default.DidInitialStateJcsIsNotJcs, 'Initial state object and JCS string mismatch.');
        }
    }
}
exports.default = Did;
//# sourceMappingURL=Did.js.map