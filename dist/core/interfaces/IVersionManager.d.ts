import IBatchWriter from './IBatchWriter';
import IOperationProcessor from './IOperationProcessor';
import IRequestHandler from './IRequestHandler';
import ITransactionProcessor from './ITransactionProcessor';
import ITransactionSelector from './ITransactionSelector';
export default interface IVersionManager {
    getBatchWriter(blockchainTime: number): IBatchWriter;
    getOperationProcessor(blockchainTime: number): IOperationProcessor;
    getRequestHandler(blockchainTime: number): IRequestHandler;
    getTransactionProcessor(blockchainTime: number): ITransactionProcessor;
    getTransactionSelector(blockchainTime: number): ITransactionSelector;
}
