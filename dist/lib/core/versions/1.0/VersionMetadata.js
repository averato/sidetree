"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AbstractVersionMetadata_1 = tslib_1.__importDefault(require("../../abstracts/AbstractVersionMetadata"));
const ProtocolParameters_1 = tslib_1.__importDefault(require("./ProtocolParameters"));
class VersionMetadata extends AbstractVersionMetadata_1.default {
    constructor() {
        super();
        this.normalizedFeeToPerOperationFeeMultiplier = ProtocolParameters_1.default.normalizedFeeToPerOperationFeeMultiplier;
        this.valueTimeLockAmountMultiplier = ProtocolParameters_1.default.valueTimeLockAmountMultiplier;
    }
}
exports.default = VersionMetadata;
//# sourceMappingURL=VersionMetadata.js.map