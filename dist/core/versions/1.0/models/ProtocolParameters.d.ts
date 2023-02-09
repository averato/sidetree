export default interface ProtocolParameters {
    hashAlgorithmsInMultihashCode: number[];
    maxCasUriLength: number;
    maxCoreIndexFileSizeInBytes: number;
    maxProvisionalIndexFileSizeInBytes: number;
    maxProofFileSizeInBytes: number;
    maxChunkFileSizeInBytes: number;
    maxDeltaSizeInBytes: number;
    maxNumberOfOperationsPerTransactionTime: number;
    maxNumberOfOperationsForNoValueTimeLock: number;
    maxNumberOfTransactionsPerTransactionTime: number;
    maxOperationsPerBatch: number;
    maxWriterLockIdInBytes: number;
    normalizedFeeToPerOperationFeeMultiplier: number;
    valueTimeLockAmountMultiplier: number;
}
