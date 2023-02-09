import JwkEs256k from '../../../models/JwkEs256k';
export default class Jwk {
    static generateEs256kKeyPair(): Promise<[JwkEs256k, JwkEs256k]>;
    static validateJwkEs256k(publicKeyJwk: any): void;
    static getEs256kPublicKey(privateKey: JwkEs256k): JwkEs256k;
}
