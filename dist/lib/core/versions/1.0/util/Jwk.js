"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = tslib_1.__importDefault(require("../ErrorCode"));
const jose_1 = require("jose");
const SidetreeError_1 = tslib_1.__importDefault(require("../../../../common/SidetreeError"));
class Jwk {
    static generateEs256kKeyPair() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const keyPair = yield jose_1.JWK.generate('EC', 'secp256k1');
            const publicKeyInternal = keyPair.toJWK();
            const publicKey = {
                kty: publicKeyInternal.kty,
                crv: publicKeyInternal.crv,
                x: publicKeyInternal.x,
                y: publicKeyInternal.y
            };
            const privateKey = Object.assign({ d: keyPair.d }, publicKey);
            return [publicKey, privateKey];
        });
    }
    static validateJwkEs256k(publicKeyJwk) {
        if (publicKeyJwk === undefined) {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kUndefined);
        }
        const allowedProperties = new Set(['kty', 'crv', 'x', 'y']);
        for (const property in publicKeyJwk) {
            if (!allowedProperties.has(property)) {
                throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kHasUnknownProperty);
            }
        }
        if (publicKeyJwk.kty !== 'EC') {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidKty);
        }
        if (publicKeyJwk.crv !== 'secp256k1') {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidCrv);
        }
        if (typeof publicKeyJwk.x !== 'string') {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidTypeX);
        }
        if (typeof publicKeyJwk.y !== 'string') {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidTypeY);
        }
        if (publicKeyJwk.x.length !== 43) {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kHasIncorrectLengthOfX, `SECP256K1 JWK 'x' property must be 43 bytes.`);
        }
        if (publicKeyJwk.y.length !== 43) {
            throw new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kHasIncorrectLengthOfY, `SECP256K1 JWK 'y' property must be 43 bytes.`);
        }
    }
    static getEs256kPublicKey(privateKey) {
        const keyCopy = Object.assign({}, privateKey);
        delete keyCopy.d;
        return keyCopy;
    }
}
exports.default = Jwk;
//# sourceMappingURL=Jwk.js.map