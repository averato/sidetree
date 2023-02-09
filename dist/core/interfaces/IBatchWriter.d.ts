export default interface IBatchWriter {
    write(): Promise<number>;
}
