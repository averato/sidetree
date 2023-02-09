/// <reference types="node" />
import FetchResultCode from '../enums/FetchResultCode';
export default interface FetchResult {
    code: FetchResultCode;
    content?: Buffer;
}
