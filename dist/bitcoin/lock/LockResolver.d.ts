import BitcoinClient from '../BitcoinClient';
import LockIdentifierModel from '../models/LockIdentifierModel';
import ValueTimeLockModel from '../../common/models/ValueTimeLockModel';
import VersionManager from '../VersionManager';
export default class LockResolver {
    private versionManager;
    private bitcoinClient;
    constructor(versionManager: VersionManager, bitcoinClient: BitcoinClient);
    resolveSerializedLockIdentifierAndThrowOnError(serializedLockIdentifier: string): Promise<ValueTimeLockModel>;
    resolveLockIdentifierAndThrowOnError(lockIdentifier: LockIdentifierModel): Promise<ValueTimeLockModel>;
    private static isRedeemScriptALockScript;
    private static isOutputPayingToTargetScript;
    private static createScript;
    private getTransaction;
    private calculateLockStartingBlock;
}
