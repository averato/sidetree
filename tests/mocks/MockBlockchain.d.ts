import BlockchainTimeModel from '../../lib/core/models/BlockchainTimeModel';
import IBlockchain from '../../lib/core/interfaces/IBlockchain';
import ServiceVersionModel from '../../lib/common/models/ServiceVersionModel';
import TransactionModel from '../../lib/common/models/TransactionModel';
import ValueTimeLockModel from '../../lib/common/models/ValueTimeLockModel';
export default class MockBlockchain implements IBlockchain {
    hashes: [string, number][];
    write(anchorString: string, fee: number): Promise<void>;
    read(sinceTransactionNumber?: number, _transactionTimeHash?: string): Promise<{
        moreTransactions: boolean;
        transactions: TransactionModel[];
    }>;
    getFirstValidTransaction(_transactions: TransactionModel[]): Promise<TransactionModel | undefined>;
    getServiceVersion(): Promise<ServiceVersionModel>;
    private latestTime?;
    getLatestTime(): Promise<BlockchainTimeModel>;
    setLatestTime(time: BlockchainTimeModel): void;
    getFee(transactionTime: number): Promise<number>;
    getValueTimeLock(_lockIdentifer: string): Promise<ValueTimeLockModel | undefined>;
    getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined>;
}
