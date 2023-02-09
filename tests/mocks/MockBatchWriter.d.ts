import IBatchWriter from '../../lib/core/interfaces/IBatchWriter';
export default class MockBatchWriter implements IBatchWriter {
    invocationCount: number;
    write(): Promise<number>;
}
