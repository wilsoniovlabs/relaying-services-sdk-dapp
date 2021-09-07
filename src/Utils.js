
import Web3 from 'web3';
import IRelayHub from './contracts/IRelayHub.json';


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

function Utils() {
    async function gasOverhead() {
        let relayHub = new web3.eth.Contract(IRelayHub.abi, process.env.REACT_APP_CONTRACTS_RELAY_HUB)
        relayHub.setProvider(web3.currentProvider)
        return await relayHub.methods.gasOverhead().call()
    }

    async function mint(tokenAmount, tokenRecipient) {
        await this.rifTokenContract.methods.mint(web3.utils.toWei(tokenAmount), tokenRecipient).send({ from: this.accounts[0], useEnveloping: false })
    }

    async function tokenBalance(address) {
        const balance = await this.rifTokenContract.methods.balanceOf(address).call();
        return balance;
    }

    async function getReceipt(transactionHash) {
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
}

export default Utils;