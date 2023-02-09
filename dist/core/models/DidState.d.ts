export default interface DidState {
    document: any;
    nextRecoveryCommitmentHash?: string;
    nextUpdateCommitmentHash?: string;
    lastOperationTransactionNumber: number;
}
