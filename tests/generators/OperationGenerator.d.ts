/// <reference types="node" />
import AnchoredOperationModel from '../../lib/core/models/AnchoredOperationModel';
import CreateOperation from '../../lib/core/versions/latest/CreateOperation';
import DeactivateOperation from '../../lib/core/versions/latest/DeactivateOperation';
import DocumentModel from '../../lib/core/versions/latest/models/DocumentModel';
import JwkEs256k from '../../lib/core/models/JwkEs256k';
import OperationModel from '../../lib/core/versions/latest/models/OperationModel';
import OperationType from '../../lib/core/enums/OperationType';
import PatchAction from '../../lib/core/versions/latest/PatchAction';
import PublicKeyModel from '../../lib/core/versions/latest/models/PublicKeyModel';
import PublicKeyPurpose from '../../lib/core/versions/latest/PublicKeyPurpose';
import RecoverOperation from '../../lib/core/versions/latest/RecoverOperation';
import ServiceModel from '../../lib/core/versions/latest/models/ServiceModel';
import TransactionModel from '../../lib/common/models/TransactionModel';
import UpdateOperation from '../../lib/core/versions/latest/UpdateOperation';
interface AnchoredCreateOperationGenerationInput {
    transactionNumber: number;
    transactionTime: number;
    operationIndex: number;
}
interface RecoverOperationGenerationInput {
    didUniqueSuffix: string;
    recoveryPrivateKey: JwkEs256k;
}
interface GeneratedRecoverOperationData {
    operationBuffer: Buffer;
    recoverOperation: RecoverOperation;
    recoveryPublicKey: JwkEs256k;
    recoveryPrivateKey: JwkEs256k;
    signingPublicKey: PublicKeyModel;
    signingPrivateKey: JwkEs256k;
    updateKey: PublicKeyModel;
    updatePrivateKey: JwkEs256k;
}
export default class OperationGenerator {
    static generateTransactionModel(): TransactionModel;
    static generateRandomHash(): string;
    static generateKeyPair(id: string, purposes?: PublicKeyPurpose[]): Promise<[PublicKeyModel, JwkEs256k]>;
    static generateAnchoredCreateOperation(input: AnchoredCreateOperationGenerationInput): Promise<{
        createOperation: CreateOperation;
        operationRequest: {
            type: OperationType;
            suffixData: {
                deltaHash: string;
                recoveryCommitment: string;
            };
            delta: {
                updateCommitment: string;
                patches: {
                    action: PatchAction;
                    document: DocumentModel;
                }[];
            };
        };
        anchoredOperationModel: {
            type: OperationType;
            didUniqueSuffix: string;
            operationBuffer: Buffer;
            transactionNumber: number;
            transactionTime: number;
            operationIndex: number;
        };
        recoveryPublicKey: JwkEs256k;
        recoveryPrivateKey: JwkEs256k;
        updatePublicKey: JwkEs256k;
        updatePrivateKey: JwkEs256k;
        signingPublicKey: PublicKeyModel;
        signingPrivateKey: JwkEs256k;
    }>;
    static generateLongFormDid(otherPublicKeys?: PublicKeyModel[], services?: ServiceModel[], network?: string): Promise<{
        longFormDid: string;
        shortFormDid: string;
        didUniqueSuffix: string;
    }>;
    static createDid(recoveryKey: JwkEs256k, updateKey: JwkEs256k, patches: any, network?: string): Promise<{
        longFormDid: string;
        shortFormDid: string;
        didUniqueSuffix: string;
    }>;
    static generateCreateOperation(): Promise<{
        createOperation: CreateOperation;
        operationRequest: {
            type: OperationType;
            suffixData: {
                deltaHash: string;
                recoveryCommitment: string;
            };
            delta: {
                updateCommitment: string;
                patches: {
                    action: PatchAction;
                    document: DocumentModel;
                }[];
            };
        };
        recoveryPublicKey: JwkEs256k;
        recoveryPrivateKey: JwkEs256k;
        updatePublicKey: JwkEs256k;
        updatePrivateKey: JwkEs256k;
        signingPublicKey: PublicKeyModel;
        signingPrivateKey: JwkEs256k;
    }>;
    static generateRecoverOperation(input: RecoverOperationGenerationInput): Promise<GeneratedRecoverOperationData>;
    static generateUpdateOperation(didUniqueSuffix: string, updatePublicKey: JwkEs256k, updatePrivateKey: JwkEs256k, multihashAlgorithmCodeToUse?: number, multihashAlgorithmForRevealValue?: number): Promise<{
        updateOperation: UpdateOperation;
        operationBuffer: Buffer;
        additionalKeyId: string;
        additionalPublicKey: PublicKeyModel;
        additionalPrivateKey: JwkEs256k;
        nextUpdateKey: any;
    }>;
    static createAnchoredOperationModelFromOperationModel(operationModel: OperationModel, transactionTime: number, transactionNumber: number, operationIndex: number): AnchoredOperationModel;
    static createAnchoredOperationModelFromRequest(didUniqueSuffix: string, operationRequest: {
        type: OperationType;
    }, transactionTime: number, transactionNumber: number, operationIndex: number): AnchoredOperationModel;
    static createCreateOperationRequest(recoveryPublicKey: JwkEs256k, updatePublicKey: JwkEs256k, otherPublicKeys: PublicKeyModel[], services?: ServiceModel[]): Promise<{
        type: OperationType;
        suffixData: {
            deltaHash: string;
            recoveryCommitment: string;
        };
        delta: {
            updateCommitment: string;
            patches: {
                action: PatchAction;
                document: DocumentModel;
            }[];
        };
    }>;
    static generateUpdateOperationRequest(didUniqueSuffix?: string): Promise<{
        request: {
            type: OperationType;
            didSuffix: string;
            revealValue: string;
            delta: {
                patches: any;
                updateCommitment: string;
            };
            signedData: string;
        };
        buffer: Buffer;
        updateOperation: UpdateOperation;
    }>;
    static createUpdateOperationRequest(didSuffix: string, updatePublicKey: JwkEs256k, updatePrivateKey: JwkEs256k, nextUpdateCommitmentHash: string, patches: any, multihashAlgorithmCodeToUse?: number, multihashAlgorithmForRevealValue?: number): Promise<{
        type: OperationType;
        didSuffix: string;
        revealValue: string;
        delta: {
            patches: any;
            updateCommitment: string;
        };
        signedData: string;
    }>;
    static generateRecoverOperationRequest(didUniqueSuffix: string, recoveryPrivateKey: JwkEs256k, newRecoveryPublicKey: JwkEs256k, newSigningPublicKey: PublicKeyModel, services?: ServiceModel[], publicKeys?: PublicKeyModel[]): Promise<{
        type: OperationType;
        didSuffix: string;
        revealValue: string;
        signedData: string;
        delta: {
            patches: {
                action: PatchAction;
                document: any;
            }[];
            updateCommitment: string;
        };
    }>;
    static createRecoverOperationRequest(didSuffix: string, recoveryPrivateKey: JwkEs256k, newRecoveryPublicKey: JwkEs256k, nextUpdateCommitmentHash: string, document: any): Promise<{
        type: OperationType;
        didSuffix: string;
        revealValue: string;
        signedData: string;
        delta: {
            patches: {
                action: PatchAction;
                document: any;
            }[];
            updateCommitment: string;
        };
    }>;
    static createDeactivateOperationRequest(didSuffix: string, recoveryPrivateKey: JwkEs256k): Promise<{
        type: OperationType;
        didSuffix: string;
        revealValue: string;
        signedData: string;
    }>;
    static generateCreateOperationBuffer(recoveryPublicKey: JwkEs256k, signingPublicKey: PublicKeyModel, services?: ServiceModel[]): Promise<Buffer>;
    static createUpdateOperationRequestForAddingAKey(didUniqueSuffix: string, updatePublicKey: JwkEs256k, updatePrivateKey: JwkEs256k, newPublicKey: PublicKeyModel, nextUpdateCommitmentHash: string, multihashAlgorithmCodeToUse?: number, multihashAlgorithmForRevealValue?: number): Promise<{
        type: OperationType;
        didSuffix: string;
        revealValue: string;
        delta: {
            patches: any;
            updateCommitment: string;
        };
        signedData: string;
    }>;
    static generateUpdateOperationRequestForServices(didUniqueSuffix: string, updatePublicKey: any, updatePrivateKey: JwkEs256k, nextUpdateCommitmentHash: string, idOfServiceEndpointToAdd: string | undefined, idsOfServiceEndpointToRemove: string[]): Promise<{
        type: OperationType;
        didSuffix: string;
        revealValue: string;
        delta: {
            patches: any;
            updateCommitment: string;
        };
        signedData: string;
    }>;
    static signUsingEs256k(payload: any, privateKey: JwkEs256k): Promise<string>;
    static createDeactivateOperation(didUniqueSuffix: string, recoveryPrivateKey: JwkEs256k): Promise<{
        operationRequest: {
            type: OperationType;
            didSuffix: string;
            revealValue: string;
            signedData: string;
        };
        operationBuffer: Buffer;
        deactivateOperation: DeactivateOperation;
    }>;
    static generateServices(ids: string[]): ServiceModel[];
    static generateCoreIndexFile(recoveryOperationCount: number): Promise<Buffer>;
}
export {};
