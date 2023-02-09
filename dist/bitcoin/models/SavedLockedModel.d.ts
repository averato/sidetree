import LockTransactionType from '../enums/SavedLockType';
export default interface SavedLockModel {
    transactionId: string;
    rawTransaction: string;
    redeemScriptAsHex: string;
    desiredLockAmountInSatoshis: number;
    createTimestamp: number;
    type: LockTransactionType;
}
