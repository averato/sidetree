export default interface BlockMetadata {
    height: number;
    hash: string;
    normalizedFee: number;
    previousHash: string;
    transactionCount: number;
    totalFee: number;
}
