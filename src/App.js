/* eslint-disable import/first */
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import Header from './components/Header';

import abiDecoder from 'abi-decoder';
import { DefaultRelayingServices } from 'relaying-services-sdk';

import RIFToken from './contracts/RifToken.json';
import IRelayHub from './contracts/IRelayHub.json';
import ISmartWalletFactory from './contracts/ISmartWalletFactory.json';
//import IForwarder from './contracts/IForwarder.json';
//import HeavyTask from './contracts/HeavyTask.json';
import DeployVerifier from './contracts/DeployVerifier.json';
import RelayVerifier from './contracts/RelayVerifier.json';
import TestToken from './contracts/TestToken.json';
import TestRecipient from './contracts/TestRecipient.json';

import SmartWallet from './components/SmartWallet';
import Footer from './components/Footer';

import Deploy from './modals/Deploy';
//import Execute from './modals/Execute';
import Receive from './modals/Receive';
import Transfer from './modals/Transfer';

function init() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    } else {
        throw new Error('No web3 detected')
    }
}
init();

const web3 = window.web3;


function App() {
    const [connected, setConnect] = useState(false);
    const [account, setAccount] = useState('');
    const [currentSmartWallet, setCurrentSmartWallet] = useState(null);
    const [provider, setProvider] = useState(null);
    const [rifTokenContract, setRifTokenContract] = useState();
    const [ritTokenDecimals, setRitTokenDecimals] = useState();
    const [deployVerifierContract, setDeployVerifierContract] = useState();
    const [relayVerifierContract, setRelayVerifierContract] = useState();

    const [smartWallets, setSmartWallets] = useState([]);

    useEffect(() =>{
        if(connected){
            start();
        }
    }, [connected]);

    async function start() {
        const chainId = await web3.eth.getChainId();
        if (chainId === Number(process.env.REACT_APP_ENVELOPING_CHAIN_ID)) {
            initEventDecoder();
            await initProvider();
            const rifTokenContract = initContracts();
            const ritTokenDecimals = await rifTokenContract.methods.decimals().call();
            setRitTokenDecimals(ritTokenDecimals);
        } else {
            console.error(`Wrong network ID ${chainId}, it must be ${process.env.REACT_APP_ENVELOPING_CHAIN_ID}`)
        }
    }

    async function initProvider() {
        const config = {
            verbose: window.location.href.includes('verbose')
            , chainId: process.env.REACT_APP_ENVELOPING_CHAIN_ID
            ,gasPriceFactorPercent: process.env.REACT_APP_ENVELOPING_GAS_PRICE_FACTOR_PERCENT
            , relayLookupWindowBlocks: process.env.REACT_APP_ENVELOPING_RELAY_LOOKUP_WINDOW_BLOCKS
            , preferredRelays: [process.env.REACT_APP_ENVELOPING_PREFERRED_RELAYS]
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
            , sampleRecipient: process.env.REACT_APP_CONTRACTS_TEST_RECIPIENT
            , testToken: process.env.REACT_APP_CONTRACTS_RIF_TOKEN
        };

        // Get an Enveloping RelayProvider instance and assign it to Web3 to use Enveloping transparently
        const relayingServices = new DefaultRelayingServices({
            web3Instance: web3,
            account: account
        });
        await relayingServices.initialize(config, contractAddresses);
        setProvider(relayingServices);
    }

    function initContracts() {
        let rifTokenContract = new web3.eth.Contract(TestToken.abi, process.env.REACT_APP_CONTRACTS_RIF_TOKEN)
        rifTokenContract.setProvider(web3.currentProvider)
        setRifTokenContract(rifTokenContract);

        // Bootstrap the DeployVerifier contract
        // The Enveloping RelayProvider is added to each contract that we want to interact with using Enveloping.
        let deployVerifierContract = new web3.eth.Contract(DeployVerifier.abi, process.env.REACT_APP_CONTRACTS_DEPLOY_VERIFIER)
        deployVerifierContract.setProvider(web3.currentProvider)
        setDeployVerifierContract(deployVerifierContract);

        let relayVerifierContract = new web3.eth.Contract(RelayVerifier.abi, process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER);
        relayVerifierContract.setProvider(web3.currentProvider);
        setRelayVerifierContract(relayVerifierContract);
        return rifTokenContract;
    }

    function initEventDecoder() {
        abiDecoder.addABI(ISmartWalletFactory.abi)
        abiDecoder.addABI(IRelayHub.abi)
        abiDecoder.addABI(TestRecipient.abi)
        abiDecoder.addABI(RIFToken.abi)
    }

    return (
        <div className="App">
            <Header
                setAccount={setAccount}
                account={account}
                setConnect={setConnect}
                connected={connected}
            />

            <SmartWallet
                connected={connected}
                smartWallets={smartWallets}
                setCurrentSmartWallet={setCurrentSmartWallet}
            />

            <Footer
                smartWallets={smartWallets}
                setSmartWallets={setSmartWallets}
                connected={connected}
                account={account}
            />

            <Deploy 
                currentSmartWallet={currentSmartWallet}
                provider={provider}
                ritTokenDecimals={ritTokenDecimals}
                deployVerifierContract={deployVerifierContract}
                relayVerifierContract={relayVerifierContract}
                setSmartWallets={setSmartWallets}
                smartWallets={smartWallets}
            />
            <Receive 
                currentSmartWallet={currentSmartWallet}
            />
            <Transfer 
                provider={provider}
                currentSmartWallet={currentSmartWallet}
                rifTokenContract={rifTokenContract}
            />
            {/*<Execute />*/}
        </div>
    );
}

export default App;
