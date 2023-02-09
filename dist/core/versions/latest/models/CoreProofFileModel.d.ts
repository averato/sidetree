export default interface CoreProofFileModel {
    operations: {
        recover?: {
            signedData: string;
        }[];
        deactivate?: {
            signedData: string;
        }[];
    };
}
