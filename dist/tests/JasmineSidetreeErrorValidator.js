"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const SidetreeError_1 = require("../lib/common/SidetreeError");
class JasmineSidetreeErrorValidator {
    static expectSidetreeErrorToBeThrown(functionToExecute, expectedErrorCode, expectedContainedStringInMessage) {
        let validated = false;
        try {
            functionToExecute();
        }
        catch (e) {
            if (e instanceof SidetreeError_1.default) {
                expect(e.code).toEqual(expectedErrorCode);
                if (expectedContainedStringInMessage !== undefined) {
                    expect(e.message).toContain(expectedContainedStringInMessage);
                }
                validated = true;
            }
        }
        if (!validated) {
            fail(`Expected error '${expectedErrorCode}' did not occur.`);
        }
    }
    static expectSidetreeErrorToBeThrownAsync(functionToExecute, expectedErrorCode, expectedContainedStringInMessage) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let validated = false;
            let actualError;
            try {
                yield functionToExecute();
            }
            catch (e) {
                actualError = e;
                if (e instanceof SidetreeError_1.default) {
                    expect(e.code).toEqual(expectedErrorCode);
                    if (expectedContainedStringInMessage !== undefined) {
                        expect(e.message).toContain(expectedContainedStringInMessage);
                    }
                    validated = true;
                }
            }
            if (!validated) {
                fail(`Expected error '${expectedErrorCode}' did not occur. Instead got '${actualError}'`);
            }
        });
    }
}
exports.default = JasmineSidetreeErrorValidator;
//# sourceMappingURL=JasmineSidetreeErrorValidator.js.map