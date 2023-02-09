"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const JsonCanonicalizer_1 = require("../../../lib/core/versions/latest/util/JsonCanonicalizer");
describe('JsonCanonicalizer', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    describe('canonicalizeAsBuffer()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should match test vector.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const publicKeyJwk = {
                kty: 'EC',
                crv: 'secp256k1',
                x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
                y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY'
            };
            const canonicalizedBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(publicKeyJwk);
            const expectedCanonicalizedString = '{"crv":"secp256k1","kty":"EC","x":"5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM","y":"v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY"}';
            expect(canonicalizedBuffer.toString()).toEqual(expectedCanonicalizedString);
        }));
    }));
}));
//# sourceMappingURL=JsonCanonicalizer.spec.js.map