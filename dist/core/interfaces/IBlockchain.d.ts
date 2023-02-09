import BlockchainTimeModel from '../models/BlockchainTimeModel';
import ServiceVersionModel from '../../common/models/ServiceVersionModel';
import TransactionModel from '../../common/models/TransactionModel';
import ValueTimeLockModel from '../../common/models/ValueTimeLockModel';
export default interface IBlockchain {
    write(anchorString: string, fee: number): Promise<void>;
    read(sinceTransactionNumber?: number, transactionTimeHash?: string): Promise<{
        moreTransactions: boolean;
        transactions: TransactionModel[];
    }>;
    getFirstValidTransaction(transactions: TransactionModel[]): Promise<TransactionModel | undefined>;
    getServiceVersion(): Promise<ServiceVersionModel>;
    getLatestTime(): Promise<BlockchainTimeModel>;
    getFee(transactionTime: number): Promise<number>;
    getValueTimeLock(lockIdentifier: string): Promise<ValueTimeLockModel | undefined>;
    getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined>;
}
