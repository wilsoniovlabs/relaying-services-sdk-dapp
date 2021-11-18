/* eslint-disable import/first */
import { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';

import { DefaultRelayingServices } from 'relaying-services-sdk';

import Header from './components/Header';
import SmartWallet from './components/SmartWallet';
import Footer from './components/Footer';

import Deploy from './modals/Deploy';
//import Execute from './modals/Execute';
import Receive from './modals/Receive';
import Transfer from './modals/Transfer';
import Loading from './modals/Loading';
import Execute from './modals/Execute';
import Utils from './Utils';

if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
} else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
} else {
    throw new Error('Error: MetaMask or web3 not detected');
}

const web3 = window.web3;
const ethereum = window.ethereum;


function App() {
    const [connected, setConnect] = useState(false);
    const [account, setAccount] = useState('');
    const [currentSmartWallet, setCurrentSmartWallet] = useState(null);
    const [provider, setProvider] = useState(null);
    const [show, setShow] = useState(false);

    const [smartWallets, setSmartWallets] = useState([]);
    const [updateInfo, setUpdateInfo] = useState(false);

    async function initProvider() {
        try {
            const config = {
                verbose: window.location.href.includes('verbose')
                , chainId: process.env.REACT_APP_RIF_RELAY_CHAIN_ID
                , gasPriceFactorPercent: process.env.REACT_APP_RIF_RELAY_GAS_PRICE_FACTOR_PERCENT
                , relayLookupWindowBlocks: process.env.REACT_APP_RIF_RELAY_RELAY_LOOKUP_WINDOW_BLOCKS
                , preferredRelays: [process.env.REACT_APP_RIF_RELAY_PREFERRED_RELAYS]
                , relayHubAddress: process.env.REACT_APP_CONTRACTS_RELAY_HUB
                , relayVerifierAddress: process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER
                , deployVerifierAddress: process.env.REACT_APP_CONTRACTS_DEPLOY_VERIFIER
                , smartWalletFactoryAddress: process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY
            };
            const contractAddresses = {
                relayHub: process.env.REACT_APP_CONTRACTS_RELAY_HUB
                , smartWallet: process.env.REACT_APP_CONTRACTS_SMART_WALLET
                , smartWalletFactory: process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY
                , smartWalletDeployVerifier: process.env.REACT_APP_CONTRACTS_DEPLOY_VERIFIER
                , smartWalletRelayVerifier: process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER
                , testToken: process.env.REACT_APP_CONTRACTS_RIF_TOKEN
            };

            // Get an RIF Relay RelayProvider instance and assign it to Web3 to use RIF Relay transparently
            const relayingServices = new DefaultRelayingServices({
                web3Instance: web3,
                account: account
            });
            await relayingServices.initialize(config, contractAddresses);
            setProvider(relayingServices);
        } catch (error) {
            console.error(error)
        }
    };

    useEffect(() => {
        if(!updateInfo){
          return;
        }
        (async () => {
            setConnect(false);
            setSmartWallets([]);
            setTimeout(() =>{
                setConnect(true)
                setUpdateInfo(false)
            },100)
        })();
      }, [updateInfo]);

    async function start() {
        const chainId = await web3.eth.getChainId();
        if (chainId === Number(process.env.REACT_APP_RIF_RELAY_CHAIN_ID)) {
            await initProvider();
        } else {
            console.error(`Wrong network ID ${chainId}, it must be ${process.env.REACT_APP_RIF_RELAY_CHAIN_ID}`)
        }
    };

    async function connectToMetamask() {
        let isConnected = false;
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            ethereum.on('accountsChanged', async (/*accounts*/) => {
                await refreshAccount();
            });
            isConnected = true;
        } catch (error) {
            console.error(error);
        }
        finally {
            setConnect(isConnected);
            return isConnected
        }
    }

    async function refreshAccount() {
        const accounts = await Utils.getAccounts();
        const account = accounts[0];
        setAccount(account);
    }

    async function connect() {
        try {
            setShow(true);
            let isConnected = false;
            if (!connected) {
                isConnected = await connectToMetamask()
            }

            if (isConnected) {
                await refreshAccount();
                await start();
            }
            else {
                console.warn("Unable to connect to Metamask");
                setConnect(isConnected);
            }

            setShow(false);
        } catch (error) {
            console.log(error);
            console.warn('User denied account access');
            setShow(false);
        }
    }

    return (
        <div className="App">
            <Loading show={show}/>
            <Header
                setAccount={setAccount}
                account={account}
                connect={connect}
                connected={connected}
                setUpdateInfo={setUpdateInfo}

            />

            <SmartWallet
                connected={connected}
                smartWallets={smartWallets}
                setCurrentSmartWallet={setCurrentSmartWallet}
                setShow={setShow}
            />

            {connected && (<Footer
                provider={provider}
                smartWallets={smartWallets}
                setSmartWallets={setSmartWallets}
                connected={connected}
                account={account}
                setShow={setShow}
            />)}

            <Deploy
                currentSmartWallet={currentSmartWallet}
                provider={provider}
                setShow={setShow}
                setUpdateInfo={setUpdateInfo}
            />
            <Receive
                currentSmartWallet={currentSmartWallet}
            />
            <Transfer
                provider={provider}
                currentSmartWallet={currentSmartWallet}
                setShow={setShow}
                setUpdateInfo={setUpdateInfo}
                account={account}
            />
            {/*<Execute />*/}
            <Execute
                provider={provider}
                currentSmartWallet={currentSmartWallet}
                setShow={setShow}
                account={account}
                setUpdateInfo={setUpdateInfo}
            />
        </div>
    );
}

export default App;
