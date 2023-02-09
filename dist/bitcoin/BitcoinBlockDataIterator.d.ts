import BitcoinBlockModel from './models/BitcoinBlockModel';
export default class BitcoinBlockDataIterator {
    private fileReader;
    private fileNames;
    private currentIndex;
    constructor(path: string);
    hasPrevious(): boolean;
    previous(): BitcoinBlockModel[] | undefined;
}
