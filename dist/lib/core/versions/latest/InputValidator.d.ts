export default class InputValidator {
    static validateNonArrayObject(input: any, inputContextForErrorLogging: string): void;
    static validateObjectContainsOnlyAllowedProperties(input: object, allowedProperties: string[], inputContextForErrorLogging: string): void;
    static validateCasFileUri(casFileUri: any, inputContextForErrorLogging: string): void;
    static validateOperationReferences(operationReferences: any[], inputContextForErrorLogging: string): void;
    static validateSuffixData(suffixData: any): void;
    static validateEncodedMultihash(input: any, inputContextForErrorLogging: string): void;
    private static validateDidType;
}
