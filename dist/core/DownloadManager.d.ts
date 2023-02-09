import FetchResult from '../common/models/FetchResult';
import ICas from './interfaces/ICas';
export default class DownloadManager {
    maxConcurrentDownloads: number;
    private cas;
    private pendingDownloads;
    private activeDownloads;
    private completedDownloads;
    constructor(maxConcurrentDownloads: number, cas: ICas);
    start(): void;
    download(contentHash: string, maxSizeInBytes: number): Promise<FetchResult>;
    private downloadAsync;
}
