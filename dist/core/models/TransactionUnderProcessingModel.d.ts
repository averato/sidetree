import TransactionModel from '../../common/models/TransactionModel';
export declare enum TransactionProcessingStatus {
    Error = "error",
    Processing = "processing",
    Processed = "processed"
}
export default interface TransactionUnderProcessingModel {
    transaction: TransactionModel;
    processingStatus: TransactionProcessingStatus;
}
