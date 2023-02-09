import PublicKeyModel from './PublicKeyModel';
import ServiceModel from './ServiceModel';
export default interface DocumentModel {
    publicKeys?: PublicKeyModel[];
    services?: ServiceModel[];
}
