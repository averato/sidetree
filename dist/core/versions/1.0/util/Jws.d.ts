import JwkEs256k from '../../../models/JwkEs256k';
import JwsModel from '../models/JwsModel';
export default class Jws {
    readonly protected: string;
    readonly payload: string;
    readonly signature: string;
    private constructor();
    toCompactJws(): string;
    verifySignature(publicKey: JwkEs256k): Promise<boolean>;
    static verifySignature(encodedProtectedHeader: string, encodedPayload: string, signature: string, publicKey: JwkEs256k): Promise<boolean>;
    static verifyCompactJws(compactJws: string, publicKeyJwk: any): boolean;
    static sign(protectedHeader: any, payload: any, privateKey: JwkEs256k): Promise<JwsModel>;
    static signAsCompactJws(payload: object, privateKey: any, protectedHeader?: object): string;
    static parseCompactJws(compactJws: any): Jws;
    static createCompactJws(protectedHeader: string, payload: string, signature: string): string;
}
