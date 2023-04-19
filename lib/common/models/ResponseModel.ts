import ResponseStatus from '../enums/ResponseStatus.ts';

/**
 * Defines a Sidetree response object.
 */
export default interface ResponseModel {
  status: ResponseStatus;
  body?: any;
}
