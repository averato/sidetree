export default class JasmineSidetreeErrorValidator {
    static expectSidetreeErrorToBeThrown(functionToExecute: () => any, expectedErrorCode: string, expectedContainedStringInMessage?: string): void;
    static expectSidetreeErrorToBeThrownAsync(functionToExecute: () => Promise<any>, expectedErrorCode: string, expectedContainedStringInMessage?: string): Promise<void>;
}
