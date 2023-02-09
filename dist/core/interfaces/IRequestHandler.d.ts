/// <reference types="node" />
import ResponseModel from '../../common/models/ResponseModel';
export default interface IRequestHandler {
    handleOperationRequest(request: Buffer): Promise<ResponseModel>;
    handleResolveRequest(didOrDidDocument: string): Promise<ResponseModel>;
}
