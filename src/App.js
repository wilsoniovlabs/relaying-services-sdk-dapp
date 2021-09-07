/* eslint-disable import/first */
import { useState } from 'react';
import Web3 from 'web3';
import './App.css';
import Header from './components/header/Header';
//import Utils from './Utils';

import abiDecoder from 'abi-decoder';
import {RelayProvider, resolveConfiguration} from 'relaying-services-sdk';

// Zero address
//const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
// Initial transaction id
//const txId = 777

import RIFToken from './contracts/RifToken.json'
import IRelayHub from './contracts/IRelayHub.json'
import ISmartWalletFactory from './contracts/ISmartWalletFactory.json'
//import IForwarder from './contracts/IForwarder.json'
//import HeavyTask from './contracts/HeavyTask.json'
import DeployVerifier from './contracts/DeployVerifier.json'
import RelayVerifier from './contracts/RelayVerifier.json'
import TestToken from './contracts/TestToken.json'
import TestRecipient from './contracts/TestRecipient.json'

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
const ethereum = window.ethereum;


function App() {
  const [connected, setConnect] = useState(false);
  //const [accounts, setAccounts] = useState([]);
  const [balance, setBalance] = useState('');
  const [account, setAccount] = useState('');
  const [rifTokenContract, setRifTokenContract] = useState();
  const [ritTokenDecimals, setRitTokenDecimals] = useState();
  const [deployVerifierContract, setDeployVerifierContract] = useState();
  const [rxelayVerifierContract, setRelayVerifierContract] = useState();
  

  async function refreshBalances() {
    /*if (web3.utils.isAddress(account)) {
      const newBalance = web3.utils.fromWei(await this.tokenBalance(account));
      const newRBTCBalance = web3.utils.fromWei(await web3.eth.getBalance(account));

      //$('#smart-wallet-balance-' + index).text(newBalance + " tRIF")
      //$('#rbtc-smart-wallet-balance-' + index).text(newRBTCBalance + " RBTC")
    }*/

    //const workerAddress = process.env.REACT_APP_CONTRACTS_RELAY_WORKER;
    /*$('#worker-balance').text(
        parseFloat(web3.utils.fromWei(await this.tokenBalance(workerAddress))).toFixed(4)
    )*/

    const balance = web3.utils.fromWei(await web3.eth.getBalance(account));
    setBalance(balance);
  }

  async function refreshAccount() {
    const accounts = await web3.eth.getAccounts();
    //setAccounts(accounts);

    const account = accounts[0];
    setAccount(account);

    const balance = web3.utils.fromWei(await web3.eth.getBalance(account));
    setBalance(balance + ' RBTC  ');

    /*const workerAddress = process.env.REACT_APP_CONTRACTS_RELAY_WORKER
    $('#worker-balance').text(
      parseFloat(web3.utils.fromWei(await this.tokenBalance(workerAddress))).toFixed(4))*/
  }

  async function connectToMetamask() {
    let isConnected = false;
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      ethereum.on('accountsChanged', async (/*accounts*/) => {
        await refreshAccount();
        await discoverSmartWallets();
      });
      isConnected = true;
    } catch (error) {
      console.error(error);
      isConnected = false;
    }
    finally {
      setConnect(isConnected);
      return isConnected
    }
  }

  async function connect() {
    try {
      let isConnected = false;
      if (!connected) {
        isConnected = await connectToMetamask()
      }

      if (isConnected) {
        await start();
        await refreshAccount()
        await discoverSmartWallets()
        toggleControls(true);
        //await this.createBalanceRequest()
      }
      else {
        console.warn("Unable to connect to Metamask");
      }

    } catch (error) {
      console.log(error);
      console.warn('User denied account access');
    }
  }

  async function start() {
    const chainId = await web3.eth.getChainId();
    if ( chainId === Number(process.env.REACT_APP_ENVELOPING_CHAIN_ID)) {
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

  async function discoverSmartWallets() {
    /*let smartWallets = $('.smart-wallet')
    for (var s = 0; s < smartWallets.length; s++) {
      if (!$(smartWallets[s]).hasClass('hide')) {
        $(smartWallets[s]).remove()
      }
    }

    let smartWalletIndex = 0
    let attemps = 0
    let found = false
    let notDeployed = 0
    while (attemps < 5) {
      let smartWalletAddress = await this.calculateSmartWalletAddress((smartWalletIndex + 1).toString())

      if (await this.isSmartWalletDeployed(smartWalletAddress) || await this.tokenBalance(smartWalletAddress) != '0') {
        attemps = 0
        notDeployed = 0
        found = true
      } else {
        attemps++
        notDeployed++
      }

      smartWalletIndex++
    }

    if (found) {
      $('#no-wallets-message').addClass('hide');

      for (var i = 0; i < smartWalletIndex - notDeployed; i++) {
        await this.createSmartWalletAddress()
      }
    } else {
      $('#no-wallets-message').removeClass('hide');
    }*/
  }

  function toggleControls(toggle) {

    /*if (toggle) {
      $('#no-connection').addClass('hide')
      $('#create-smartwallet-button').removeClass('disabled')
      $('#connect-button').addClass('disabled')
      $('#connect-button').addClass('hide')
      $('#status-button').removeClass('disabled')
    } else {
      $('#no-connection').removeClass('hide')
      $('#create-smartwallet-button').addClass('disabled')
      $('#status-button').addClass('disabled')

    }*/
  }

  return (
    <div className="App">
      <Header refreshBalances={refreshBalances} connect={connect} balance={balance} account={account} />
    </div>
  );
}

export default App;
