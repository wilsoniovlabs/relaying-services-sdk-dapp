import { useCallback, useEffect, useState } from 'react';
import Utils, { TRIF_PRICE } from '../Utils';
import './Footer.css';
//import { useState } from 'react';

function Footer(props) {
    const {
        smartWallets
        , setSmartWallets
        , connected
        , account
        , provider
        , setShow
    } = props;

    const [workerBalance, setWorkerBalance] = useState('0');

    const setBalance = useCallback(async (smartWallet) => {
        const balance = await Utils.tokenBalance(smartWallet.address);
        const rbtcBalance = await Utils.getBalance(smartWallet.address);

        smartWallet.balance = Utils.fromWei(balance) + ' tRIF';
        smartWallet.rbtcBalance = Utils.fromWei(rbtcBalance) + ' RBTC';
        smartWallet.deployed = await provider.isSmartWalletDeployed(smartWallet.address);
        return smartWallet;
    }, [provider]);

    useEffect(() => {
        if (!account || !provider) {
            return;
        }
        (async () => {
            let smartWalletIndex = 0;
            let found = true;
            setShow(true);
            while (found === true) {
                let smartWallet = await provider.generateSmartWallet(smartWalletIndex + 1);
                const balance = await Utils.tokenBalance(smartWallet.address);
                if (balance > '0' || smartWallet.deployed) {
                    smartWallet = await setBalance(smartWallet);
                    setSmartWallets((currentSmartWallet) => [...currentSmartWallet, smartWallet]);
                    smartWalletIndex += 1;
                } else {
                    found = false;
                }
            }
            setShow(false);
        })();
    }, [account, provider, setSmartWallets, setBalance, setShow]);

    useEffect(() => {
        (async () => {
            const workerAddress = process.env.REACT_APP_CONTRACTS_RELAY_WORKER;
            const workerBalance = parseFloat(Utils.fromWei(await Utils.tokenBalance(workerAddress))).toFixed(4);
            setWorkerBalance(workerBalance);
        })();
    }, [setWorkerBalance]);

    async function create() {
        setShow(true);
        let smartWallet = await provider.generateSmartWallet(smartWallets.length + 1);
        smartWallet = await setBalance(smartWallet);
        setSmartWallets([...smartWallets, smartWallet]);
        
        setShow(false);
    }

    return (
        <div className="row footer-controls">
            <div className="col s12">
                <div className="row">
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
            </div>
        </div>
    );
}

export default Footer;
