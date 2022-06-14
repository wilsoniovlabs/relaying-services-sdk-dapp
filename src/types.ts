import { SmartWallet } from 'relaying-services-sdk';

export interface SmartWalletWithBalance extends SmartWallet {
    balance: string;
    rbtcBalance: string;
    deployed: boolean;
}

export interface Modals {
    deploy: boolean;
    execute: boolean;
    receive: boolean;
    transfer: boolean;
}
