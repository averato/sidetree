import * as Deque from 'double-ended-queue';
import BatchFile from './BatchFile';
import Encoder from './Encoder';
import MerkleTree from './lib/MerkleTree';
import timeSpan = require('time-span');
import { getProtocol } from './Protocol';
import { Blockchain } from './Blockchain';
import { Cas } from './Cas';

/**
 * Class that performs periodic writing of batches of Sidetree operations to CAS and blockchain.
 */
export default class BatchWriter {
  private operations: Deque<Buffer> = new Deque<Buffer>();

  /**
   * Flag indicating if this Batch Writer is currently processing a batch of operations.
   */
  private processing: boolean = false;

  public constructor (
    private blockchain: Blockchain,
    private cas: Cas,
    private batchingIntervalInSeconds: number) {
  }

  /**
   * Adds the given operation to a queue to be batched and anchored on blockchain.
   */
  public add (operation: Buffer) {
    this.operations.push(operation);
  }

  /**
   * Returns the current operation queue length.
   */
  public getOperationQueueLength (): number {
    return this.operations.length;
  }

  /**
   * The function that starts periodically anchoring operation batches to blockchain.
   */
  public startPeriodicBatchWriting () {
    setInterval(async () => this.writeOperationBatch(), this.batchingIntervalInSeconds * 1000);
  }

  /**
   * Processes the operations in the queue.
   */
  public async writeOperationBatch () {
    const endTimer = timeSpan(); // For calcuating time taken to write operations.

    // Wait until the next interval if the Batch Writer is still processing a batch.
    if (this.processing) {
      return;
    }

    try {
      console.info('Start batch writing...');
      this.processing = true;

      // Get the batch of operations to be anchored on the blockchain.
      const batch = await this.getBatch();
      console.info('Batch size = ' + batch.length);

      // Do nothing if there is nothing to batch together.
      if (batch.length === 0) {
        return;
      }

      // Combine all operations into a Batch File buffer.
      const batchBuffer = BatchFile.fromOperations(batch).toBuffer();

      // TODO: Compress the batch buffer.

      // Make the 'batch file' available in CAS.
      const batchFileHash = await this.cas.write(batchBuffer);
      console.info(`Wrote batch file ${batchFileHash} to CAS.`);

      // Compute the Merkle root hash.
      const merkleRoot = MerkleTree.create(batch).rootHash;
      const encodedMerkleRoot = Encoder.encode(merkleRoot);

      // Construct the 'anchor file'.
      const anchorFile = {
        batchFileHash: batchFileHash,
        merkleRoot: encodedMerkleRoot
      };

      // Make the 'anchor file' available in CAS.
      const anchorFileJsonBuffer = Buffer.from(JSON.stringify(anchorFile));
      const anchorFileAddress = await this.cas.write(anchorFileJsonBuffer);
      console.info(`Wrote anchor file ${anchorFileAddress} to CAS.`);

      // Anchor the 'anchor file hash' on blockchain.
      await this.blockchain.write(anchorFileAddress);
    } catch (error) {
      console.error('Unexpected and unhandled error during batch writing, investigate and fix:');
      console.error(error);
    } finally {
      this.processing = false;

      console.info(`End batch writing. Duration: ${endTimer.rounded()} ms.`);
    }
  }

  /**
   * Gets a batch of operations to be anchored on the blockchain.
   * If number of pending operations is greater than the Sidetree protocol's maximum allowed number per batch,
   * then the maximum allowed number of operation is returned.
   */
  private async getBatch (): Promise<Buffer[]> {
    // Get the protocol version according to current blockchain time to decide on the batch size limit to enforce.
    const currentTime = await this.blockchain.getLatestTime();
    const protocol = getProtocol(currentTime.time + 1);

    let queueSize = this.operations.length;
    let batchSize = queueSize;

    if (queueSize > protocol.maxOperationsPerBatch) {
      batchSize = protocol.maxOperationsPerBatch;
    }

    const batch = new Array<Buffer>(batchSize);
    let count = 0;
    while (count < batchSize) {
      batch[count] = this.operations.shift()!;
      count++;
    }

    return batch;
  }
}
