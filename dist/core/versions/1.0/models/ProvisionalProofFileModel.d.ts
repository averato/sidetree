export default interface ProvisionalProofFileModel {
    operations: {
        update: {
            signedData: string;
        }[];
    };
}
