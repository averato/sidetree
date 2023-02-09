import AbstractVersionMetadata from '../../../../lib/core/abstracts/AbstractVersionMetadata';
export default class VersionMetadata extends AbstractVersionMetadata {
    hashAlgorithmInMultihashCode: number;
    normalizedFeeToPerOperationFeeMultiplier: number;
    valueTimeLockAmountMultiplier: number;
    constructor();
}
