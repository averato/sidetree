"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Encoder_1 = require("../../lib/core/versions/latest/Encoder");
const ErrorCode_1 = require("../../lib/core/versions/latest/ErrorCode");
const JasmineSidetreeErrorValidator_1 = require("../JasmineSidetreeErrorValidator");
const Jwk_1 = require("../../lib/core/versions/latest/util/Jwk");
const OperationGenerator_1 = require("../generators/OperationGenerator");
const OperationType_1 = require("../../lib/core/enums/OperationType");
const RecoverOperation_1 = require("../../lib/core/versions/latest/RecoverOperation");
const SidetreeError_1 = require("../../lib/common/SidetreeError");
describe('RecoverOperation', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    describe('parse()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('parse as expected', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newSigningPublicKey] = yield OperationGenerator_1.default.generateKeyPair('singingKey');
            const recoverOperationRequest = yield OperationGenerator_1.default.generateRecoverOperationRequest('EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg', recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey);
            const operationBuffer = Buffer.from(JSON.stringify(recoverOperationRequest));
            const result = yield RecoverOperation_1.default.parse(operationBuffer);
            expect(result).toBeDefined();
            done();
        }));
        it('should throw if operation type is incorrect', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newSigningPublicKey] = yield OperationGenerator_1.default.generateKeyPair('singingKey');
            const recoverOperationRequest = yield OperationGenerator_1.default.generateRecoverOperationRequest('EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg', recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey);
            recoverOperationRequest.type = OperationType_1.default.Create;
            const operationBuffer = Buffer.from(JSON.stringify(recoverOperationRequest));
            yield expectAsync(RecoverOperation_1.default.parse(operationBuffer)).toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.RecoverOperationTypeIncorrect));
            done();
        }));
        it('should throw if didUniqueSuffix is not string.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newSigningPublicKey] = yield OperationGenerator_1.default.generateKeyPair('singingKey');
            const recoverOperationRequest = yield OperationGenerator_1.default.generateRecoverOperationRequest('unused-DID-unique-suffix', recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey);
            recoverOperationRequest.didSuffix = 123;
            const operationBuffer = Buffer.from(JSON.stringify(recoverOperationRequest));
            yield expectAsync(RecoverOperation_1.default
                .parse(operationBuffer))
                .toBeRejectedWith(new SidetreeError_1.default(`The recover request didSuffix must be a string but is of number type.`));
            done();
        }));
        it('should throw if didUniqueSuffix is undefined.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newSigningPublicKey] = yield OperationGenerator_1.default.generateKeyPair('singingKey');
            const recoverOperationRequest = yield OperationGenerator_1.default.generateRecoverOperationRequest('unused-DID-unique-suffix', recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey);
            recoverOperationRequest.didSuffix = undefined;
            const operationBuffer = Buffer.from(JSON.stringify(recoverOperationRequest));
            yield expectAsync(RecoverOperation_1.default
                .parse(operationBuffer))
                .toBeRejectedWith(new SidetreeError_1.default(`The recover request didSuffix must be a string but is of undefined type.`));
            done();
        }));
        it('should throw if didUniqueSuffix is not multihash.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newSigningPublicKey] = yield OperationGenerator_1.default.generateKeyPair('singingKey');
            const recoverOperationRequest = yield OperationGenerator_1.default.generateRecoverOperationRequest('unused-DID-unique-suffix', recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey);
            recoverOperationRequest.didSuffix = 'thisIsNotMultiHash';
            const operationBuffer = Buffer.from(JSON.stringify(recoverOperationRequest));
            yield expectAsync(RecoverOperation_1.default
                .parse(operationBuffer))
                .toBeRejectedWith(new SidetreeError_1.default(`Given recover request didSuffix string 'thisIsNotMultiHash' is not a multihash.`));
            done();
        }));
    }));
    describe('parseObject()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should throw if operation contains an additional unknown property.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const recoverOperation = {
                type: OperationType_1.default.Recover,
                didSuffix: 'unusedSuffix',
                revealValue: 'unusedReveal',
                signedData: 'unusedSignedData',
                delta: 'unusedDelta',
                extraProperty: 'thisPropertyShouldCauseErrorToBeThrown'
            };
            yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => RecoverOperation_1.default.parseObject(recoverOperation, Buffer.from('unused')), ErrorCode_1.default.InputValidatorInputContainsNowAllowedProperty, 'recover request');
        }));
        it('should throw if hash of `recoveryKey` does not match the revealValue.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const didUniqueSuffix = OperationGenerator_1.default.generateRandomHash();
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const recoverOperationData = yield OperationGenerator_1.default.generateRecoverOperation({ didUniqueSuffix, recoveryPrivateKey });
            const recoverRequest = JSON.parse(recoverOperationData.operationBuffer.toString());
            recoverRequest.revealValue = OperationGenerator_1.default.generateRandomHash();
            yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => RecoverOperation_1.default.parseObject(recoverRequest, Buffer.from('unused')), ErrorCode_1.default.CanonicalizedObjectHashMismatch, 'recover request');
        }));
    }));
    describe('parseSignedDataPayload()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should throw if signedData contains an additional unknown property.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const nextRecoveryCommitmentHash = OperationGenerator_1.default.generateRandomHash();
            const signedData = {
                deltaHash: 'anyUnusedHash',
                recoveryKey: 'anyUnusedRecoveryKey',
                nextRecoveryCommitmentHash,
                extraProperty: 'An unknown extra property',
                revealValue: 'some value'
            };
            const encodedSignedData = Encoder_1.default.encode(JSON.stringify(signedData));
            yield expectAsync(RecoverOperation_1.default.parseSignedDataPayload(encodedSignedData))
                .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.RecoverOperationSignedDataMissingOrUnknownProperty));
            done();
        }));
        it('should throw if signedData missing property.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const signedData = {};
            const encodedSignedData = Encoder_1.default.encode(JSON.stringify(signedData));
            yield expectAsync(RecoverOperation_1.default.parseSignedDataPayload(encodedSignedData))
                .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.RecoverOperationSignedDataMissingOrUnknownProperty));
            done();
        }));
    }));
}));
//# sourceMappingURL=RecoverOperation.spec.js.map