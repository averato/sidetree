import ResponseStatus from '../enums/ResponseStatus';
export default interface ResponseModel {
    status: ResponseStatus;
    body?: any;
}
