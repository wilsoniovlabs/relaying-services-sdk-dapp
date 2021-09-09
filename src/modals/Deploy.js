import Utils, { TRIF_PRICE } from '../Utils';
import './Deploy.css';
import { useState } from 'react';
import abiDecoder from 'abi-decoder';
//import { useState } from 'react';

const $ = window.$;
const M = window.M;
setTimeout(() => {
    M.AutoInit();
}, 0);
function Deploy(props) {
    const {
        currentSmartWallet
        , provider
        , ritTokenDecimals
        , deployVerifierContract
        , relayVerifierContract
        , setSmartWallets
        , smartWallets
    } = props;

    const [deploy, setDeploy] = useState({
        fees: 0,
        check: false,
        tokenGas: 0,
        relayGas: 0
    });

    async function handleEstimateDeploySmartWalletButtonClick() {
        const estimate = await provider.estimateMaxPossibleRelayGas(
            currentSmartWallet
            , process.env.REACT_APP_CONTRACTS_RELAY_WORKER
        );

        changeValue({currentTarget: {value: estimate}})

        const costInRBTC = await Utils.fromWei(estimate.toString());
        console.log("Cost in RBTC:", costInRBTC);

        const costInTrif = parseFloat(costInRBTC) / TRIF_PRICE;

        const costInTrifFixed = costInTrif.toFixed(ritTokenDecimals);
        console.log("Cost in TRif: ", costInTrifFixed)


        if (deploy.check === true) {
            changeValue({ currentTarget: { value: costInRBTC } }, 'fees');
        }
        else {
            changeValue({ currentTarget: { value: costInTrifFixed } }, 'fees');
        }

    }

    async function deploySmartWallet(index, tokenAmount, tokenGas, relayGas) {
        const smartWallet = await provider.deploySmartWallet(
            currentSmartWallet
            , process.env.REACT_APP_CONTRACTS_RIF_TOKEN
            , await Utils.toWei(tokenAmount + '')
        );

        return smartWallet;
    }

    async function getReceipt(transactionHash) {
        let receipt = await Utils.getTransactionReceipt(transactionHash)
        let times = 0

        while (receipt === null && times < 40) {
            times++
            const sleep = new Promise(resolve => setTimeout(resolve, 30000))
            await sleep
            receipt = await Utils.getTransactionReceipt(transactionHash)
        }

        return receipt
    }

    async function checkSmartWalletDeployment(txHash) {
        let receipt = await getReceipt(txHash)

        if (receipt === null) {
            return false
        }

        console.log(`Your receipt is`)
        console.log(receipt)

        const logs = abiDecoder.decodeLogs(receipt.logs)
        const smartWalletCreationEvents = logs.find((e) => e != null && e.name === 'Deployed')

        return !(smartWalletCreationEvents === null || smartWalletCreationEvents === undefined)
    }

    async function acceptsToken(tokenAddress) {
        let forDeploy = await deployVerifierContract.methods.tokens(tokenAddress).call()
        let forRelay = await relayVerifierContract.methods.tokens(tokenAddress).call()
        return forDeploy && forRelay
    }

    async function relaySmartWalletDeployment(index, tokenAmount, tokenGas, relayGas) {
        if (acceptsToken(process.env.REACT_APP_CONTRACTS_RIF_TOKEN)) {
            const smartWallet = await deploySmartWallet(index, tokenAmount, tokenGas, relayGas)
            if (!await checkSmartWalletDeployment(smartWallet.deployTransaction)) {
                throw new Error('SmartWallet deployment failed');
            }
            return smartWallet;
        } else {
            throw new Error('SmartWallet was not created because Verifier does not accept the specified token for payment');
        }
    }

    async function handleDeploySmartWalletButtonClick() {
        deploy.fees = deploy.fees === "" ? "0" : deploy.fees;
        deploy.tokenGas = deploy.tokenGas === "" ? "0" : deploy.tokenGas;

        let smartWallet = await relaySmartWalletDeployment(
            currentSmartWallet.index,
            deploy.fees,
            deploy.tokenGas,
            deploy.relayGas
        );
        if (smartWallet.deployed) {
            //await this.refreshBalances()
            const smartWalletList = smartWallets.filter((sw) =>{
                return sw.index !== smartWallet.index;
            });
            setSmartWallets([smartWallet, ...smartWalletList]);

            var instance = M.Modal.getInstance($('#deploy-modal'));
            instance.close();
        }
    }

    function changeValue(event, prop) {
        let obj = Object.assign({}, deploy);
        obj[prop] = event.currentTarget.value;
        setDeploy(obj)
    }

    return (
        <div id="deploy-modal" className="modal">
            <div className="modal-content">
                <div className="row">
                    <form className="col s12">
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="0" value={deploy.fees} type="number" min="0" className="validate tooltipped" onChange={(event) => {
                                    changeValue(event, 'fees')
                                }} data-tooltip="" />
                                <label htmlFor="deploy-fees" id="deploy-fees-label">Fees (tRIF)</label>
                            </div>
                            <div className="switch col s4" style={{ 'paddingTop': '2.5em' }}>
                                <label>
                                    tRIF
                                    <input type="checkbox" onChange={(event) => {
                                        changeValue(event, 'check')
                                    }} value={deploy.check} />
                                    <span className="lever"></span>
                                    RBTC
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" id="deploy-smart-wallet-estimate" className="waves-effect waves-green btn-flat" onClick={handleEstimateDeploySmartWalletButtonClick} >Estimate</a>
                <a onClick={handleDeploySmartWalletButtonClick} href="#!" className="waves-effect waves-green btn-flat">Deploy</a>
                <a href="#!" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
        </div>
    );
}

export default Deploy;
