import CreateOperation from './CreateOperation';
import SuffixDataModel from './models/SuffixDataModel';
export default class Did {
    isShortForm: boolean;
    didMethodName: string;
    uniqueSuffix: string;
    createOperation?: CreateOperation;
    shortForm: string;
    longForm: string | undefined;
    private constructor();
    static create(didString: string, didMethodName: string): Promise<Did>;
    static computeUniqueSuffix(suffixDataModel: SuffixDataModel): string;
    private static getInitialStateFromDidStringWithExtraColon;
    private static constructCreateOperationFromEncodedJcs;
    private static validateInitialStateJcs;
}
