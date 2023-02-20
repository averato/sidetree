'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Encoder_1 = require('../Encoder');
const ErrorCode_1 = require('../ErrorCode');
const jose_1 = require('jose');
const Logger_1 = require('../../../../common/Logger');
const SidetreeError_1 = require('../../../../common/SidetreeError');
class Jws {
  constructor (compactJws) {
    if (typeof compactJws !== 'string') {
      throw new SidetreeError_1.default(ErrorCode_1.default.JwsCompactJwsNotString);
    }
    const parts = compactJws.split('.');
    if (parts.length !== 3) {
      throw new SidetreeError_1.default(ErrorCode_1.default.JwsCompactJwsInvalid);
    }
    const protectedHeader = parts[0];
    const payload = parts[1];
    const signature = parts[2];
    const decodedProtectedHeadJsonString = Encoder_1.default.decodeBase64UrlAsString(protectedHeader);
    const decodedProtectedHeader = JSON.parse(decodedProtectedHeadJsonString);
    const expectedHeaderPropertyCount = 1;
    const headerProperties = Object.keys(decodedProtectedHeader);
    if (headerProperties.length !== expectedHeaderPropertyCount) {
      throw new SidetreeError_1.default(ErrorCode_1.default.JwsProtectedHeaderMissingOrUnknownProperty);
    }
    if (decodedProtectedHeader.alg !== 'ES256K') {
      throw new SidetreeError_1.default(ErrorCode_1.default.JwsProtectedHeaderMissingOrIncorrectAlg);
    }
    if (!Encoder_1.default.isBase64UrlString(signature)) {
      throw new SidetreeError_1.default(ErrorCode_1.default.JwsSignatureNotBase64UrlString);
    }
    if (!Encoder_1.default.isBase64UrlString(payload)) {
      throw new SidetreeError_1.default(ErrorCode_1.default.JwsPayloadNotBase64UrlString);
    }
    this.protected = protectedHeader;
    this.payload = payload;
    this.signature = signature;
  }

  toCompactJws () {
    return Jws.createCompactJws(this.protected, this.payload, this.signature);
  }

  verifySignature (publicKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return Jws.verifySignature(this.protected, this.payload, this.signature, publicKey);
    });
  }

  static verifySignature (encodedProtectedHeader, encodedPayload, signature, publicKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const jwsSigningInput = encodedProtectedHeader + '.' + encodedPayload + '.' + signature;
      const signatureValid = Jws.verifyCompactJws(jwsSigningInput, publicKey);
      return signatureValid;
    });
  }

  static verifyCompactJws (compactJws, publicKeyJwk) {
    try {
      jose_1.JWS.verify(compactJws, publicKeyJwk);
      return true;
    } catch (error) {
      if (error instanceof SidetreeError_1.default) { Logger_1.default.info(`Input '${compactJws}' failed signature verification: ${SidetreeError_1.default.createFromError(ErrorCode_1.default.JwsFailedSignatureValidation, error)}`); }
      return false;
    }
  }

  static sign (protectedHeader, payload, privateKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const flattenedJws = jose_1.JWS.sign.flattened(payload, privateKey, protectedHeader);
      const jws = {
        protected: flattenedJws.protected,
        payload: flattenedJws.payload,
        signature: flattenedJws.signature
      };
      return jws;
    });
  }

  static signAsCompactJws (payload, privateKey, protectedHeader) {
    const compactJws = jose_1.JWS.sign(payload, privateKey, protectedHeader);
    return compactJws;
  }

  static parseCompactJws (compactJws) {
    return new Jws(compactJws);
  }

  static createCompactJws (protectedHeader, payload, signature) {
    return protectedHeader + '.' + payload + '.' + signature;
  }
}
exports.default = Jws;
// # sourceMappingURL=Jws.js.map
