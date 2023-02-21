"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Encoder_1 = require("../../../lib/core/versions/latest/Encoder");
const ErrorCode_1 = require("../../../lib/core/versions/latest/ErrorCode");
const Jwk_1 = require("../../../lib/core/versions/latest/util/Jwk");
const Jws_1 = require("../../../lib/core/versions/latest/util/Jws");
const SidetreeError_1 = require("../../../lib/common/SidetreeError");
describe('Jws', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    describe('parseCompactJws()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should throw error if given input to parse is not a string.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const anyObject = { a: 'abc' };
            expect(() => { Jws_1.default.parseCompactJws(anyObject); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwsCompactJwsNotString));
        }));
        it('should throw error if given input string has more than 3 parts separated by a "." character.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const invalidCompactJwsString = 'aaa.bbb.ccc.ddd';
            expect(() => { Jws_1.default.parseCompactJws(invalidCompactJwsString); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwsCompactJwsInvalid));
        }));
        it('should throw error if protected header contains unexpected property.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, signingPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const protectedHeader = {
                unknownProperty: 'anyValue',
                alg: 'ES256K'
            };
            const payload = { anyProperty: 'anyValue' };
            const jws = Jws_1.default.signAsCompactJws(payload, signingPrivateKey, protectedHeader);
            expect(() => { Jws_1.default.parseCompactJws(jws); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwsProtectedHeaderMissingOrUnknownProperty));
        }));
        it('should throw error if `alg` in header is missing or is in incorrect type.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [, signingPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const protectedHeader = {
                alg: 'ES256K'
            };
            const payload = { anyProperty: 'anyValue' };
            const jws = yield Jws_1.default.sign(protectedHeader, payload, signingPrivateKey);
            const invalidProtectedHeader = {
                alg: true
            };
            const invalidEncodedProtectedHeader = Encoder_1.default.encode(JSON.stringify(invalidProtectedHeader));
            const compactJws = Jws_1.default.createCompactJws(invalidEncodedProtectedHeader, jws.payload, jws.signature);
            expect(() => { Jws_1.default.parseCompactJws(compactJws); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwsProtectedHeaderMissingOrIncorrectAlg));
        }));
        it('should throw error if payload is not Base64URL string.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const protectedHeader = {
                alg: 'ES256K'
            };
            const encodedProtectedHeader = Encoder_1.default.encode(JSON.stringify(protectedHeader));
            const compactJws = Jws_1.default.createCompactJws(encodedProtectedHeader, '***InvalidPayloadString****', 'anyValidBase64UrlStringAsSignature');
            expect(() => { Jws_1.default.parseCompactJws(compactJws); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwsPayloadNotBase64UrlString));
        }));
        it('should throw error if signature is not Base64URL string.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const protectedHeader = {
                alg: 'ES256K'
            };
            const encodedProtectedHeader = Encoder_1.default.encode(JSON.stringify(protectedHeader));
            const compactJws = Jws_1.default.createCompactJws(encodedProtectedHeader, 'anyValidBase64UrlStringAsPayload', '***InvalidSignatureString****');
            expect(() => { Jws_1.default.parseCompactJws(compactJws); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwsSignatureNotBase64UrlString));
        }));
    }));
    describe('verifyCompactJws()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should return true if given compact JWS string has a valid signature.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [publicKey, privateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const payload = { abc: 'unused value' };
            const compactJws = Jws_1.default.signAsCompactJws(payload, privateKey);
            expect(Jws_1.default.verifyCompactJws(compactJws, publicKey)).toBeTruthy();
            done();
        }));
        it('should return false if given compact JWS string has an ivalid signature.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const [publicKey1] = yield Jwk_1.default.generateEs256kKeyPair();
            const [, privateKey2] = yield Jwk_1.default.generateEs256kKeyPair();
            const payload = { abc: 'some value' };
            const compactJws = Jws_1.default.signAsCompactJws(payload, privateKey2);
            expect(Jws_1.default.verifyCompactJws(compactJws, publicKey1)).toBeFalsy();
            done();
        }));
        it('should return false if input is not a valid JWS string', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const input = 'some invalid string';
            const [publicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            expect(Jws_1.default.verifyCompactJws(input, publicKey)).toBeFalsy();
            done();
        }));
    }));
}));
//# sourceMappingURL=Jws.spec.js.map