/// <reference types="node" />
import IOperationQueue from './interfaces/IOperationQueue';
import IRequestHandler from '../../interfaces/IRequestHandler';
import Resolver from '../../Resolver';
import ResponseModel from '../../../common/models/ResponseModel';
export default class RequestHandler implements IRequestHandler {
    private resolver;
    private operationQueue;
    private didMethodName;
    private operationProcessor;
    constructor(resolver: Resolver, operationQueue: IOperationQueue, didMethodName: string);
    handleOperationRequest(request: Buffer): Promise<ResponseModel>;
    private handleCreateRequest;
    handleResolveRequest(shortOrLongFormDid: string): Promise<ResponseModel>;
    private resolveLongFormDid;
    private applyCreateOperation;
}
