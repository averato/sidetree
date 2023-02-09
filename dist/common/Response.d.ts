import ResponseStatus from './enums/ResponseStatus';
export default class Response {
    static toHttpStatus(status: ResponseStatus): number;
}
