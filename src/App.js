/* eslint-disable import/first */
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import Header from './components/Header';

import abiDecoder from 'abi-decoder';
import { RelayProvider, resolveConfiguration } from 'relaying-services-sdk';

// Initial transaction id
//const txId = 777

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
import Execute from './modals/Execute';
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
    const [rifTokenContract, setRifTokenContract] = useState();
    const [ritTokenDecimals, setRitTokenDecimals] = useState();
    const [deployVerifierContract, setDeployVerifierContract] = useState();
    const [rxelayVerifierContract, setRelayVerifierContract] = useState();

    const [smartWallets, setSmartWallets] = useState([]);

    useEffect(() =>{
        (async () =>{
            if(connected){
                await start();
            }
            //await this.createBalanceRequest()
        })();
    }, [connected]);

    async function start() {
        const chainId = await web3.eth.getChainId();
        if (chainId === Number(process.env.REACT_APP_ENVELOPING_CHAIN_ID)) {
            await initAccount();
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
        let config = await resolveConfiguration(web3.currentProvider, {
            verbose: window.location.href.includes('verbose'),
            chainId: process.env.REACT_APP_ENVELOPING_CHAIN_ID,
            relayVerifierAddress: process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER,
            deployVerifierAddress: process.env.REACT_APP_CONTRACTS_DEPLOY_VERIFIER,
            smartWalletFactoryAddress: process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY,
            gasPriceFactorPercent: process.env.REACT_APP_ENVELOPING_GAS_PRICE_FACTOR_PERCENT,
            relayLookupWindowBlocks: process.env.REACT_APP_ENVELOPING_RELAY_LOOKUP_WINDOW_BLOCKS,
            preferredRelays: process.env.REACT_APP_ENVELOPING_PREFERRED_RELAYS,
        });

        config.relayHubAddress = process.env.REACT_APP_CONTRACTS_RELAY_HUB;

        // Get an Enveloping RelayProvider instance and assign it to Web3 to use Enveloping transparently
        let provider = new RelayProvider(web3.currentProvider, config);
        await provider.relayClient._init();
        web3.setProvider(provider);
    }

    function initContracts() {
        // Bootstrap the RIF Token contract
        // The Enveloping RelayProvider is added to each contract that we want to interact with using Enveloping.

        //this.rifTokenContract = new web3.eth.Contract(RIFToken.abi, process.env.REACT_APP_CONTRACTS_RIF_TOKEN)
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

    async function initAccount() {
        const accounts = await web3.eth.getAccounts()
        if (accounts.length === 0) {
            console.error("Couldn't get any accounts! Make sure your Client is configured correctly.")
            return
        }
        //setAccounts(accounts);
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
                account={account}
                setAccount={setAccount}
                setConnect={setConnect}
                connected={connected}
            />

            <SmartWallet
                connected={connected}
                smartWallets={smartWallets}
            />

            <Footer
                smartWallets={smartWallets}
                setSmartWallets={setSmartWallets}
                connected={connected}
                account={account}
            />

            <Deploy />
            <Execute />
            <Receive />
            <Transfer />
        </div>
    );
}

export default App;
