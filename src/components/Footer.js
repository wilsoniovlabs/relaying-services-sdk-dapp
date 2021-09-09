import { useEffect, useState } from 'react';
import Utils, { TRIF_PRICE } from '../Utils';
import './Footer.css';
//import { useState } from 'react';

function Footer(props) {
    const {
        smartWallets
        , setSmartWallets
        , connected
        , account
    } = props;

    const [workerBalance, setWorkerBalance] = useState('0');
    
    useEffect(() => {
        if(!account){
            return;
        }
        (async () => {
            let smartWalletIndex = 0;
            let found = true;
            const smartWalletList = [];
            while (found === true) {
                let smartWalletAddress = await Utils.calculateSmartWalletAddress((smartWalletIndex + 1).toString());
                const deployed = await Utils.isSmartWalletDeployed(smartWalletAddress);
                const balance = await Utils.tokenBalance(smartWalletAddress);
                if (balance > '0' || deployed) {
                    const smartWallet = await createSmartWalletAddress(smartWalletAddress);
                    smartWalletList.push(smartWallet);
                    smartWalletIndex += 1;
                } else {
                    found = false;
                }
            }
            setSmartWallets([...smartWallets, ...smartWalletList]);
        })();
    }, [account, setSmartWallets]);

    useEffect(() =>{
        (async () =>{
            const workerAddress = process.env.REACT_APP_CONTRACTS_RELAY_WORKER;
            const workerBalance = parseFloat(Utils.fromWei(await Utils.tokenBalance(workerAddress))).toFixed(4);
            setWorkerBalance(workerBalance);
        })();
    }, [setWorkerBalance]);

    async function createSmartWalletAddress(address) {
        let smartWallet = {};
        const index = smartWallets.length + 1;

        if (!address) {
            smartWallet.address = await Utils.calculateSmartWalletAddress(index );
        } else {
            smartWallet.address = address;
        }
        smartWallet.index = index;
        const balance = await Utils.tokenBalance(smartWallet.address);
        const rbtcBalance = await Utils.getBalance(smartWallet.address);

        smartWallet.balance = Utils.fromWei(balance) + ' tRIF';
        smartWallet.rbtcBalance = Utils.fromWei(rbtcBalance) + ' RBTC';
        smartWallet.deployed = await Utils.isSmartWalletDeployed(smartWallet.address);
        return smartWallet;
    }
    async function create() {
        const smartWallet = await createSmartWalletAddress();
        setSmartWallets([...smartWallets, smartWallet]);
    }

    return (
        <div className="row footer-controls">
            <div className="col s6">
                <a href="#!"
                    className={`waves-effect waves-light btn indigo accent-2 ${!connected ? 'disabled' : ''} create`}
                    onClick={create}>
                    <i className="material-icons right">add_circle_outline</i>New Smart Wallet
                </a>
            </div>
            <div className="col s6">
                <h6 className="right-align">
                    tRIF price:
                    <span id='trif-price'>{TRIF_PRICE}</span>
                    RBTC - Worker balance:
                    <span id='worker-balance'>{workerBalance}</span> tRIF
                </h6>
            </div>
        </div>
    );
}

export default Footer;
