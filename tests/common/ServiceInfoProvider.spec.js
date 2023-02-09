"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ServiceInfoProvider_1 = require("../../lib/common/ServiceInfoProvider");
describe('ServiceInfoProvider', () => {
    it('should return the version from the package.json file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const packageJson = require('../../package.json');
        const serviceInfo = new ServiceInfoProvider_1.default('test-service');
        const serviceVersion = serviceInfo.getServiceVersion();
        expect(serviceVersion.name).toEqual('test-service');
        expect(serviceVersion.version).toEqual(packageJson.version);
    }));
});
//# sourceMappingURL=ServiceInfoProvider.spec.js.map