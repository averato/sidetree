import CoreIndexFile from '../../lib/core/versions/latest/CoreIndexFile';
import CoreProofFile from '../../lib/core/versions/latest/CoreProofFile';
import DeactivateOperation from '../../lib/core/versions/latest/DeactivateOperation';
import ProvisionalIndexFile from '../../lib/core/versions/latest/ProvisionalIndexFile';
import ProvisionalProofFile from '../../lib/core/versions/latest/ProvisionalProofFile';
import RecoverOperation from '../../lib/core/versions/latest/RecoverOperation';
import UpdateOperation from '../../lib/core/versions/latest/UpdateOperation';
export default class FileGenerator {
    static generateCoreIndexFile(): Promise<CoreIndexFile>;
    static generateProvisionalIndexFile(): Promise<ProvisionalIndexFile>;
    static createCoreProofFile(recoverOperations: RecoverOperation[], deactivateOperations: DeactivateOperation[]): Promise<CoreProofFile | undefined>;
    static createProvisionalProofFile(updateOperations: UpdateOperation[]): Promise<ProvisionalProofFile | undefined>;
}
