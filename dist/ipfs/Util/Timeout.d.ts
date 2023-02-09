export default class Timeout {
    static timeout<T>(task: Promise<T>, timeoutInMilliseconds: number): Promise<T>;
}
