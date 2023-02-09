import IVersionMetadataFetcher from '../../interfaces/IVersionMetadataFetcher';
import ValueTimeLockModel from '../../../common/models/ValueTimeLockModel';
export default class ValueTimeLockVerifier {
    static calculateMaxNumberOfOperationsAllowed(valueTimeLock: ValueTimeLockModel | undefined, versionMetadataFetcher: IVersionMetadataFetcher): number;
    static verifyLockAmountAndThrowOnError(valueTimeLock: ValueTimeLockModel | undefined, numberOfOperations: number, sidetreeTransactionTime: number, sidetreeTransactionWriter: string, versionMetadataFetcher: IVersionMetadataFetcher): void;
}
