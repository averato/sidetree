import BitcoinClient from './BitcoinClient';
export default class Monitor {
    private bitcoinClient;
    constructor(bitcoinClient: BitcoinClient);
    getWalletBalance(): Promise<any>;
}
