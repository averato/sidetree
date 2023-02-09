export default interface IEventEmitter {
    emit(eventCode: string, eventData?: {
        [property: string]: any;
    }): Promise<void>;
}
