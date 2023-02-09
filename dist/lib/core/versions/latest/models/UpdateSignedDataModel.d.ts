import JwkEs256k from '../../../models/JwkEs256k';
export default interface UpdateSignedDataModel {
    deltaHash: string;
    updateKey: JwkEs256k;
}
