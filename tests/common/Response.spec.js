"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Response_1 = require("../../lib/common/Response");
const ResponseStatus_1 = require("../../lib/common/enums/ResponseStatus");
describe('Response', () => {
    it('should return 200 as HTTP status code if ResponseStatus is Success.', () => {
        const httpStatusCode = Response_1.default.toHttpStatus(ResponseStatus_1.default.Succeeded);
        expect(httpStatusCode).toEqual(200);
    });
    it('should return 400 as HTTP status code if ResponseStatus is Bad Request.', () => {
        const httpStatusCode = Response_1.default.toHttpStatus(ResponseStatus_1.default.BadRequest);
        expect(httpStatusCode).toEqual(400);
    });
    it('should return 410 as HTTP status code if ResponseStatus is Deactivated.', () => {
        const httpStatusCode = Response_1.default.toHttpStatus(ResponseStatus_1.default.Deactivated);
        expect(httpStatusCode).toEqual(410);
    });
    it('should return 404 as HTTP status code if ResponseStatus is Not Found.', () => {
        const httpStatusCode = Response_1.default.toHttpStatus(ResponseStatus_1.default.NotFound);
        expect(httpStatusCode).toEqual(404);
    });
    it('should return 500 as HTTP status code if ResponseStatus is ServerError.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const httpStatusCode = Response_1.default.toHttpStatus(ResponseStatus_1.default.ServerError);
        expect(httpStatusCode).toEqual(500);
    }));
});
//# sourceMappingURL=Response.spec.js.map