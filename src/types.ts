import { SmartWallet } from 'relaying-services-sdk/dist/interfaces';

export interface SmartWalletWithBalance extends SmartWallet {
    balance: string;
    rbtcBalance: string;
}
