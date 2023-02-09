export default interface ProtocolParameters {
    valueTimeLockDurationInBlocks: number;
    initialNormalizedFeeInSatoshis: number;
    feeLookBackWindowInBlocks: number;
    feeMaxFluctuationMultiplierPerBlock: number;
}
