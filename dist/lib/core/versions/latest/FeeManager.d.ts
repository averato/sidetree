export default class FeeManager {
    static computeMinimumTransactionFee(normalizedFee: number, numberOfOperations: number): number;
    static verifyTransactionFeeAndThrowOnError(transactionFeePaid: number, numberOfOperations: number, normalizedFee: number): void;
}
