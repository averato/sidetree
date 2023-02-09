export default class SidetreeError extends Error {
    code: string;
    constructor(code: string, message?: string);
    static createFromError(code: string, err: Error): SidetreeError;
    static stringify(error: Error): string;
}
