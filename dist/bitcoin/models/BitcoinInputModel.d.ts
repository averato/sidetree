export default interface BitcoinInputModel {
    previousTransactionId: string;
    outputIndexInPreviousTransaction: number;
    scriptAsmAsString: string;
}
