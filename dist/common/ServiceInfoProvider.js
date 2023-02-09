"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceInfoProvider {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    getServiceVersion() {
        return {
            name: this.serviceName,
            version: ServiceInfoProvider.packageJson.version
        };
    }
}
exports.default = ServiceInfoProvider;
ServiceInfoProvider.packageJson = require('../../package.json');
//# sourceMappingURL=ServiceInfoProvider.js.map