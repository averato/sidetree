export default interface BlockMetadataWithoutNormalizedFee {
    height: number;
    hash: string;
    previousHash: string;
    transactionCount: number;
    totalFee: number;
}
