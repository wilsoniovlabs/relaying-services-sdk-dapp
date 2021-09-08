import { useEffect, useState } from 'react';
import Utils from '../Utils';
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
            const utils = new Utils();

            let smartWalletIndex = 0;
            let found = true;
            const smartWalletList = [];
            while (found === true) {
                let smartWalletAddress = await utils.calculateSmartWalletAddress((smartWalletIndex + 1).toString());
                const deployed = await utils.isSmartWalletDeployed(smartWalletAddress);
                const balance = await utils.tokenBalance(smartWalletAddress);
                if (balance === '0' || !deployed) {
                    found = false;
                } else {
                    const smartWallet = await createSmartWalletAddress(smartWalletAddress);
                    smartWalletList.push(smartWallet);
                    smartWalletIndex += 1;
                }
            }
            setSmartWallets([...smartWallets, ...smartWalletList]);
        })();
    }, [account, setSmartWallets]);

    useEffect(() =>{
        (async () =>{
            const utils = new Utils();
            const workerAddress = process.env.REACT_APP_CONTRACTS_RELAY_WORKER;
            const workerBalance = parseFloat(utils.fromWei(await utils.tokenBalance(workerAddress))).toFixed(4);
            setWorkerBalance(workerBalance);
        })();
    }, [setWorkerBalance]);

    async function createSmartWalletAddress(smartWalletAddress) {
        let smartWallet = {};
        const index = smartWallets.length + 0;
        const utils = new Utils();

        if (!smartWalletAddress) {
            smartWallet.smartWalletAddress = await utils.calculateSmartWalletAddress(index);
        } else {
            smartWallet.smartWalletAddress = smartWalletAddress;
        }

        const balance = await utils.tokenBalance(smartWallet.smartWalletAddress);
        const rbtcBalance = await utils.getBalance(smartWallet.smartWalletAddress);

        smartWallet.balance = utils.fromWei(balance) + ' tRIF';
        smartWallet.rbtcBalance = utils.fromWei(rbtcBalance) + ' RBTC';
        smartWallet.isDeployed = await utils.isSmartWalletDeployed(smartWallet.smartWalletAddress);
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
                    className={`waves-effect waves-light btn indigo accent-2 ${!connected ? 'disabled' : ''}create`}
                    onClick={() => { create() }}>
                    <i className="material-icons right">add_circle_outline</i>New Smart Wallet
                </a>
            </div>
            <div className="col s6">
                <h6 className="right-align">
                    tRIF price:
                    <span id='trif-price'>0.000005739</span>
                    RBTC - Worker balance:
                    <span id='worker-balance'>{workerBalance}</span> tRIF
                </h6>
            </div>
        </div>
    );
}

export default Footer;
