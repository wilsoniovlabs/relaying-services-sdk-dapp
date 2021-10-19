/* eslint-disable import/first */
import { useState } from 'react';
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
import Utils from './Utils';

if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
} else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
} else {
    throw new Error('No web3 detected');
}

const web3 = window.web3;
const ethereum = window.ethereum;


function App() {
    const [connected, setConnect] = useState(false);
    const [account, setAccount] = useState('');
    const [currentSmartWallet, setCurrentSmartWallet] = useState(null);
    const [provider, setProvider] = useState(null);

    const [smartWallets, setSmartWallets] = useState([]);

    async function initProvider() {
        const config = {
            verbose: window.location.href.includes('verbose')
            , chainId: process.env.ENVELOPING_CHAIN_ID
            , gasPriceFactorPercent: process.env.ENVELOPING_GAS_PRICE_FACTOR_PERCENT
            , relayLookupWindowBlocks: process.env.ENVELOPING_RELAY_LOOKUP_WINDOW_BLOCKS
            , preferredRelays: [process.env.ENVELOPING_PREFERRED_RELAYS]
            , relayHubAddress: process.env.CONTRACTS_RELAY_HUB
            , relayVerifierAddress: process.env.CONTRACTS_RELAY_VERIFIER
            , deployVerifierAddress: process.env.CONTRACTS_DEPLOY_VERIFIER
            , smartWalletFactoryAddress: process.env.CONTRACTS_SMART_WALLET_FACTORY
        };
        const contractAddresses = {
            relayHub: process.env.CONTRACTS_RELAY_HUB
            , smartWallet: process.env.CONTRACTS_SMART_WALLET
            , smartWalletFactory: process.env.CONTRACTS_SMART_WALLET_FACTORY
            , smartWalletDeployVerifier: process.env.CONTRACTS_DEPLOY_VERIFIER
            , smartWalletRelayVerifier: process.env.CONTRACTS_RELAY_VERIFIER
            , sampleRecipient: process.env.CONTRACTS_TEST_RECIPIENT
            , testToken: process.env.CONTRACTS_RIF_TOKEN
        };
        
        // Get an Enveloping RelayProvider instance and assign it to Web3 to use Enveloping transparently
        const relayingServices = new DefaultRelayingServices({
            web3Instance: web3,
            account: account
        });
        await relayingServices.initialize(config, contractAddresses);
        setProvider(relayingServices);
    };

    async function start() {
        const chainId = await web3.eth.getChainId();
        if (chainId === Number(process.env.ENVELOPING_CHAIN_ID)) {
            await initProvider();
        } else {
            console.error(`Wrong network ID ${chainId}, it must be ${process.env.ENVELOPING_CHAIN_ID}`)
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

        } catch (error) {
            console.log(error);
            console.warn('User denied account access');
        }
    }

    return (
        <div className="App">
            <Header
                setAccount={setAccount}
                account={account}
                connect={connect}
                connected={connected}

            />

            <SmartWallet
                connected={connected}
                smartWallets={smartWallets}
                setCurrentSmartWallet={setCurrentSmartWallet}
            />

            {connected && (<Footer
                provider={provider}
                smartWallets={smartWallets}
                setSmartWallets={setSmartWallets}
                connected={connected}
                account={account}
            />)}

            <Deploy
                currentSmartWallet={currentSmartWallet}
                provider={provider}
                setSmartWallets={setSmartWallets}
                smartWallets={smartWallets}
            />
            <Receive
                currentSmartWallet={currentSmartWallet}
            />
            <Transfer
                provider={provider}
                currentSmartWallet={currentSmartWallet}
            />
            {/*<Execute />*/}
        </div>
    );
}

export default App;
