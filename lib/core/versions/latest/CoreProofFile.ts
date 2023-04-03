import Compressor from './util/Compressor.ts';
import CoreProofFileModel from './models/CoreProofFileModel.ts';
import DeactivateOperation from './DeactivateOperation.ts';
import DeactivateSignedDataModel from './models/DeactivateSignedDataModel.ts';
import ErrorCode from './ErrorCode.ts';
import InputValidator from './InputValidator.ts';
import JsonAsync from './util/JsonAsync.ts';
import Jws from './util/Jws.ts';
import ProtocolParameters from './ProtocolParameters.ts';
import RecoverOperation from './RecoverOperation.ts';
import RecoverSignedDataModel from './models/RecoverSignedDataModel.ts';
import SidetreeError from '../../../common/SidetreeError.ts';

/**
 * Defines operations related to a Core Proof File.
 */
export default class CoreProofFile {

  /**
   * Class that represents a core proof file.
   * NOTE: this class is introduced as an internal structure that keeps useful states in replacement to `CoreProofFileModel`
   * so that repeated computation can be avoided.
   */
  private constructor (
    public readonly coreProofFileModel: CoreProofFileModel,
    public readonly recoverProofs: { signedDataJws: Jws, signedDataModel: RecoverSignedDataModel }[],
    public readonly deactivateProofs: { signedDataJws: Jws, signedDataModel: DeactivateSignedDataModel }[]
  ) { }

  /**
   * Creates the buffer of a Core Proof File.
   *
   * @returns `Buffer` if at least one operation is given, `undefined` otherwise.
   */
  public static async createBuffer (recoverOperations: RecoverOperation[], deactivateOperations: DeactivateOperation[]): Promise<Buffer | undefined> {
    if (recoverOperations.length === 0 && deactivateOperations.length === 0) {
      return undefined;
    }

    const recoverProofs = recoverOperations.map(operation => { return { signedData: operation.signedDataJws.toCompactJws() }; });
    const deactivateProofs = deactivateOperations.map(operation => { return { signedData: operation.signedDataJws.toCompactJws() }; });

    const coreProofFileModel = {
      operations: {
        recover: recoverProofs,
        deactivate: deactivateProofs
      }
    };

    const rawData = Buffer.from(JSON.stringify(coreProofFileModel));
    const compressedRawData = await Compressor.compress(Buffer.from(rawData));

    return compressedRawData;
  }

  /**
   * Parses and validates the given core proof file buffer.
   * @param coreProofFileBuffer Compressed core proof file.
   * @throws `SidetreeError` if failed parsing or validation.
   */
  public static async parse (coreProofFileBuffer: Buffer, expectedDeactivatedDidUniqueSuffixes: string[]): Promise<CoreProofFile> {
    let coreProofFileDecompressedBuffer;
    try {
      const maxAllowedDecompressedSizeInBytes = ProtocolParameters.maxProofFileSizeInBytes * Compressor.estimatedDecompressionMultiplier;
      coreProofFileDecompressedBuffer = await Compressor.decompress(coreProofFileBuffer, maxAllowedDecompressedSizeInBytes);
    } catch (error) {
      if (error instanceof SidetreeError) throw SidetreeError.createFromError(ErrorCode.CoreProofFileDecompressionFailure, error);

      throw error;
    }

    let coreProofFileModel;
    try {
      coreProofFileModel = await JsonAsync.parse(coreProofFileDecompressedBuffer);
    } catch (error) {
      if (error instanceof SidetreeError) throw SidetreeError.createFromError(ErrorCode.CoreProofFileNotJson, error);

      throw error;
    }

    if (coreProofFileModel.operations === undefined) {
      throw new SidetreeError(ErrorCode.CoreProofFileOperationsNotFound, `Core proof file does not have any operation proofs.`);
    }

    const operations = coreProofFileModel.operations;
    InputValidator.validateObjectContainsOnlyAllowedProperties(operations, ['recover', 'deactivate'], 'core proof file');

    const recoverProofs = [];
    const deactivateProofs = [];
    let numberOfProofs = 0;

    // Validate `recover` array if it is defined.
    const recoverProofModels = operations.recover;
    if (recoverProofModels !== undefined) {
      if (!Array.isArray(recoverProofModels)) {
        throw new SidetreeError(ErrorCode.CoreProofFileRecoverPropertyNotAnArray, `'recover' property in core proof file is not an array.`);
      }

      // Parse and validate each compact JWS.
      for (const proof of recoverProofModels) {
        InputValidator.validateObjectContainsOnlyAllowedProperties(proof, ['signedData'], 'recover proof');

        const signedDataJws = Jws.parseCompactJws(proof.signedData);
        const signedDataModel = await RecoverOperation.parseSignedDataPayload(signedDataJws.payload);

        recoverProofs.push({
          signedDataJws,
          signedDataModel
        });
      }

      numberOfProofs += recoverProofs.length;
    }

    // Validate `deactivate` array if it is defined.
    const deactivateProofModels = operations.deactivate;
    if (deactivateProofModels !== undefined) {
      if (!Array.isArray(deactivateProofModels)) {
        throw new SidetreeError(ErrorCode.CoreProofFileDeactivatePropertyNotAnArray, `'deactivate' property in core proof file is not an array.`);
      }

      // Parse and validate each compact JWS.
      let deactivateProofIndex = 0;
      for (const proof of deactivateProofModels) {
        InputValidator.validateObjectContainsOnlyAllowedProperties(proof, ['signedData'], 'deactivate proof');

        const signedDataJws = Jws.parseCompactJws(proof.signedData);
        const signedDataModel = await DeactivateOperation.parseSignedDataPayload(
          signedDataJws.payload,
          expectedDeactivatedDidUniqueSuffixes[deactivateProofIndex]
        );

        deactivateProofs.push({
          signedDataJws,
          signedDataModel
        });

        deactivateProofIndex++;
      }

      numberOfProofs += deactivateProofModels.length;
    }

    if (numberOfProofs === 0) {
      throw new SidetreeError(ErrorCode.CoreProofFileHasNoProofs, `Core proof file has no proofs.`);
    }

    return new CoreProofFile(coreProofFileModel, recoverProofs, deactivateProofs);
  }
}
