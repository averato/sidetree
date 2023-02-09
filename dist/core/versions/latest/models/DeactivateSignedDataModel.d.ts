import JwkEs256k from '../../../models/JwkEs256k';
export default interface DeactivateSignedDataModel {
    didSuffix: string;
    recoveryKey: JwkEs256k;
}
