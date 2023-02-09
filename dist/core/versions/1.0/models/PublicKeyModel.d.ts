import PublicKeyPurpose from '../PublicKeyPurpose';
export default interface PublicKeyModel {
    id: string;
    type: string;
    publicKeyJwk: any;
    purposes?: PublicKeyPurpose[];
}
