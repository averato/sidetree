import Did from './Did';
import DidState from '../../models/DidState';
export default class DocumentComposer {
    private static resolutionObjectContextUrl;
    private static didDocumentContextUrl;
    static transformToExternalDocument(didState: DidState, did: Did, published: boolean): any;
    private static createDeactivatedResolutionResult;
    private static validateDocument;
    static validateDocumentPatches(patches: any): void;
    private static validatePatch;
    private static validateAddPublicKeysPatch;
    private static validatePublicKeys;
    private static validateRemovePublicKeysPatch;
    private static validateRemoveServicesPatch;
    private static validateAddServicesPatch;
    private static validateServices;
    private static validateId;
    static applyPatches(document: any, patches: any[]): void;
    private static applyPatchToDidDocument;
    private static addPublicKeys;
    private static removePublicKeys;
    private static addServices;
    private static removeServices;
}
