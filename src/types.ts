import { SmartWallet } from '@rsksmart/rif-relay-sdk';

export interface SmartWalletWithBalance extends SmartWallet {
    balance: string;
    rbtcBalance: string;
}

export interface Modals {
    deploy: boolean;
    execute: boolean;
    receive: boolean;
    transfer: boolean;
    transactions: boolean;
}

export interface Transaction {
    date: Date;
    id: string;
    type: string;
}
