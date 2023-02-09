import IEventEmitter from './interfaces/IEventEmitter';
export default class EventEmitter {
    private static customEvenEmitter;
    static initialize(customEventEmitter?: IEventEmitter): void;
    static emit(eventCode: string, eventData?: {
        [property: string]: any;
    }): Promise<void>;
}
