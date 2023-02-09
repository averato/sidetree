export default class MockAsyncIterable implements AsyncIterator<any>, AsyncIterable<any> {
    private doneValue;
    private notDoneValue;
    private indexTracker;
    constructor(doneValue?: any, notDoneValue?: any, numOfElements?: number);
    next(...args: [] | [undefined]): Promise<IteratorResult<any>>;
    [Symbol.asyncIterator](): AsyncIterator<any>;
}
