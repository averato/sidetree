export default interface IServiceStateStore<T> {
    put(serviceState: T): Promise<void>;
    get(): Promise<T>;
}
