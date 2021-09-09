
import Web3 from 'web3';
import IRelayHub from './contracts/IRelayHub.json';
import ISmartWalletFactory from './contracts/ISmartWalletFactory.json';
import TestToken from './contracts/TestToken.json';

// Zero address
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
export const TRIF_PRICE = 0.000005739;
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
//const ethereum = window.ethereum;

class Utils {
    static async gasOverhead() {
        let relayHub = new web3.eth.Contract(IRelayHub.abi, process.env.REACT_APP_CONTRACTS_RELAY_HUB)
        relayHub.setProvider(web3.currentProvider)
        return await relayHub.methods.gasOverhead().call()
    }
    async mint(tokenAmount, tokenRecipient) {
        let rifTokenContract = new web3.eth.Contract(TestToken.abi, process.env.REACT_APP_CONTRACTS_RIF_TOKEN);
        rifTokenContract.setProvider(web3.currentProvider);
        await rifTokenContract.methods.mint(web3.utils.toWei(tokenAmount), tokenRecipient).send({ from: this.accounts[0], useEnveloping: false })
    }

    static async tokenBalance(address) {
        let rifTokenContract = new web3.eth.Contract(TestToken.abi, process.env.REACT_APP_CONTRACTS_RIF_TOKEN);
        rifTokenContract.setProvider(web3.currentProvider);
        const balance = await rifTokenContract.methods.balanceOf(address).call();
        return balance;
    }

    static async getBalance(address) {
        const balance = await web3.eth.getBalance(address);
        return balance;
    }
    static fromWei(balance){
        return web3.utils.fromWei(balance);
    }
    
    static async getReceipt(transactionHash) {
        let receipt = await web3.eth.getTransactionReceipt(transactionHash)
        let times = 0

        while (receipt === null && times < 40) {
            times++
            const sleep = new Promise(resolve => setTimeout(resolve, 30000))
            await sleep
            receipt = await web3.eth.getTransactionReceipt(transactionHash)
        }

        return receipt
    }

    static async calculateSmartWalletAddress(index) {
        const accounts = await Utils.getAccounts();
        return await new web3.eth.Contract(ISmartWalletFactory.abi, process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY)
            .methods.getSmartWalletAddress(accounts[0], ZERO_ADDR, index).call()
    }

    static async getAccounts() {
        const accounts = await web3.eth.getAccounts()
        if (accounts.length === 0) {
            console.error("Couldn't get any accounts! Make sure your Client is configured correctly.")
            return
        }
        return accounts;
    }

    static async isSmartWalletDeployed(smartWalletAddress) {
        let result = await web3.eth.getCode(smartWalletAddress, "pending");
        return (result !== '0x' && result !== '0x00');
    }

    static async toWei(tRifPriceInRBTC){
        return web3.utils.toWei(tRifPriceInRBTC);
    }

    static async SmartWalletFactoryContract(account, index){
        const computedAddress = new web3.eth.Contract(
                ISmartWalletFactory.abi,
                process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY
            ).methods.getSmartWalletAddress(account, ZERO_ADDR, index).call();
        return computedAddress;
    }

    static async getTransactionReceipt(transactionHash){
        return await web3.eth.getTransactionReceipt(transactionHash);
    }
}

export default Utils;