import AnchoredData from './models/AnchoredData';
export default class AnchoredDataSerializer {
    static readonly delimiter = ".";
    static serialize(dataToBeAnchored: AnchoredData): string;
    static deserialize(serializedData: string): AnchoredData;
    private static parsePositiveInteger;
}
