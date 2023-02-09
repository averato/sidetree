import LockIdentifierModel from '../models/LockIdentifierModel';
export default class LockIdentifierSerializer {
    private static readonly delimiter;
    static serialize(lockIdentifier: LockIdentifierModel): string;
    static deserialize(serialized: string): LockIdentifierModel;
}
