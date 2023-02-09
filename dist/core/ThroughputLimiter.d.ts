import IVersionManager from './interfaces/IVersionManager';
import TransactionModel from '../common/models/TransactionModel';
export default class ThroughputLimiter {
    private versionManager;
    constructor(versionManager: IVersionManager);
    getQualifiedTransactions(transactions: TransactionModel[]): Promise<TransactionModel[]>;
}
