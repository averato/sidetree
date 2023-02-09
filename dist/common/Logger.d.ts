import ILogger from './interfaces/ILogger';
export default class Logger {
    private static singleton;
    static initialize(customLogger?: ILogger): void;
    static info(data: any): void;
    static warn(data: any): void;
    static error(data: any): void;
}
