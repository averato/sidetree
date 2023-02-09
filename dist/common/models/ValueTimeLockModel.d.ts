export default interface ValueTimeLockModel {
    identifier: string;
    amountLocked: number;
    lockTransactionTime: number;
    unlockTransactionTime: number;
    normalizedFee: number;
    owner: string;
}
