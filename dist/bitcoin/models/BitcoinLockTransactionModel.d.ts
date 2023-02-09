export default interface BitcoinLockTransactionModel {
    redeemScriptAsHex: string;
    serializedTransactionObject: string;
    transactionId: string;
    transactionFee: number;
}
