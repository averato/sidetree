import JwkEs256k from '../../../models/JwkEs256k';
export default interface RecoverSignedDataModel {
    deltaHash: string;
    recoveryKey: JwkEs256k;
    recoveryCommitment: string;
}
