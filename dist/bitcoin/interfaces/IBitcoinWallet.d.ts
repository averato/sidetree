import { Address, Script, Transaction } from 'bitcore-lib';
export default interface IBitcoinWallet {
    getPublicKeyAsHex(): string;
    getAddress(): Address;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signFreezeTransaction(transaction: Transaction, outputRedeemScript: Script): Promise<Transaction>;
    signSpendFromFreezeTransaction(lockTransaction: Transaction, inputRedeemScript: Script, outputRedeemScript: Script | undefined): Promise<Transaction>;
}
