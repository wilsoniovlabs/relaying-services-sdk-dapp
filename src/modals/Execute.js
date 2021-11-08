import './Execute.css';
import { useState } from 'react';
import Utils from '../Utils'
import abiDecoder from 'abi-decoder'
import Web3 from 'web3';
import IForwarder from '../contracts/IForwarder.json'

const M = window.M;
const $ = window.$;
if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
} else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
} else {
    throw new Error('Error: MetaMask or web3 not detected');
}
const web3 = window.web3;

// Initial transaction id
var txId = 777

function Execute(props) {
    const {
        setShow
    } = props;
    const [execute, setExecute] = useState({});

    async function handleExecuteSmartWalletButtonClick() {
        const swAddress = execute.address;

        const funcData = calculateAbiEncodedFunction();

        const tokenFees = execute.feed
        const destinationContract = execute.toAddress
        const isUnitRBTC = execute.check;

        if (isUnitRBTC) {
            await relayTransactionDirectExecution(destinationContract, swAddress, funcData);
        }
        else {
            await relayTransactionExecution(destinationContract, swAddress, funcData, tokenFees === "" ? "0" : tokenFees, async (error, data) => {
                if (error !== null) {
                    console.error('Error during execute contract: ' + error)
                }
                console.log('data: ', data)
                const txHash = data.result
                console.log(`Your TxHash is ${txHash}`)

                // checks to verify that the contract was executed properly
                let receipt = await Utils.getReceipt(txHash)

                console.log(`Your receipt is`)
                console.log(receipt)

                const trxData = await Utils.getTransaction(txHash)
                console.log("Your tx data is")
                console.log(trxData)

                const logs = abiDecoder.decodeLogs(receipt.logs)

                console.log("Your logs are: ", logs)

                const sampleRecipientEmitted = logs.find((e) => e != null && e.name === 'TransactionRelayed')
                console.log(sampleRecipientEmitted)

                const returnedResult = sampleRecipientEmitted.events.find((e) => e != null && e.name === 'relayedCallReturnValue')
                console.log("Returned value is: ", returnedResult.value);
                await this.refreshBalances()
                if (execute.show) {
                    $('#execute-smart-wallet').addClass("hide")
                    $('#execute-smart-wallet-cancel').addClass("hide");
                    $('#execute-result-row').removeClass("hide")
                    $('#execute-result').text(returnedResult.value)
                }
                else {
                    var instance = M.Modal.getInstance($('#transfer-modal'));
                    instance.close();
                }
            })
        }

    }
    async function relayTransactionDirectExecution(toAddress, swAddress, abiEncodedTx) {

        const swContract = new web3.eth.Contract(IForwarder.abi, swAddress)
         swContract.setProvider(web3.currentProvider)
     
         await swContract.methods.directExecute(toAddress,abiEncodedTx).send({
           from:this.accounts[0],
           useEnveloping:false
         }, async (error, data)=>{
             if(error !== undefined && error !== null){
               console.log(error)
             }
             else{
             const txHash = data
             console.log(`Your TxHash is ${txHash}`)
       
             // checks to verify that the contract was executed properly
             let receipt = await this.getReceipt(txHash)
       
             console.log(`Your receipt is`)
             console.log(receipt)
       
             const trxData = await web3.eth.getTransaction(txHash)
             console.log("Your tx data is")
             console.log(trxData)
     
             await this.refreshBalances()
     
               var instance = M.Modal.getInstance($('#execute-modal'));
               instance.close();
             }
     
         })
       }
     
     
       async function relayTransactionExecution(toAddress, swAddress, abiEncodedTx, tokenFees, callbackFunction) {
         if (callbackFunction === undefined || callbackFunction === null) {
           console.error('No callback function specified for relayTransactionExecution')
           return
         }
     
         const jsonRpcPayload = {
           jsonrpc: '2.0',
           id: ++txId,
           method: 'eth_sendTransaction',
           params: [
             {
               from: this.accounts[0],
               to: toAddress,
               value: "0",
               relayHub: process.env.REACT_APP_CONTRACTS_RELAY_HUB,
               callVerifier: process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER,
               callForwarder: swAddress,
               data: abiEncodedTx,
               tokenContract: process.env.REACT_APP_CONTRACTS_RIF_TOKEN,
               tokenAmount: web3.utils.toWei(tokenFees),
               onlyPreferredRelays: true
             }
           ]
         }
     
         this.provider.send(jsonRpcPayload, callbackFunction)
       }

    async function handleEstimateSmartWalletButtonClick() {

        const isUnitRBTC = $('#execute-fees-check').prop('checked')

        const funcData = this.calculateAbiEncodedFunction()
        const destinationContract = $('#execute-contract-address').val()
        const swAddress = $('#execute-smart-wallet-address').val()

        //for estimation we will use an eight of the user's token balance, it's just to estimate the gas cost
        const userTokenBalance = Utils.toBN(await this.tokenBalance(swAddress))

        if (userTokenBalance.gt(Utils.toBN("0"))) {

            const eightOfBalance = Utils.fromWei(userTokenBalance.divRound(Utils.toBN("8")))
            console.log("Your Balance: ", Utils.fromWei(userTokenBalance.toString()))
            console.log("Estimating with: ", eightOfBalance.toString())

            let result = 0
            if (isUnitRBTC) {
                result = await this.estimateDirectExecution(swAddress, destinationContract, funcData)
                console.log("Estimated direct SWCall cost: ", result)
                $('#execute-fees').val(result)
                $('#execute-fees').attr('data-tooltip', result.toString() + " gas")
                $('#execute-fees').tooltip()
            }
            else {
                result = await this.estimateRelayTransactionExecution(destinationContract, swAddress, funcData, eightOfBalance.toString())

                const gasPrice = Utils.toBN(await this.provider.relayClient._calculateGasPrice())
                console.log("GasPrice: ", gasPrice.toString())

                const costInWei = Utils.toBN(result).mul(gasPrice)
                const costInRBTC = Utils.fromWei(costInWei.toString())
                const tRifPriceInRBTC = parseFloat($('#trif-price').text()) // 1 tRIF = tRifPriceInRBTC RBTC
                const tRifPriceInWei = Utils.toBN(Utils.utils.toWei(tRifPriceInRBTC.toString())) // 1 tRIF = tRifPriceInWei wei

                console.log("Cost in RBTC (wei): ", costInWei.toString())
                console.log("Cost in RBTC:", costInRBTC)
                console.log("TRIf price in RBTC:", tRifPriceInRBTC.toString())
                console.log("TRIf price in Wei:", tRifPriceInWei.toString())
                console.log("TRIF Decimals: ", this.ritTokenDecimals)

                const costInTrif = costInRBTC / tRifPriceInRBTC
                console.log("Cost in TRIF (rbtc): ", costInTrif.toString())

                const costInTrifFixed = costInTrif.toFixed(this.ritTokenDecimals)
                console.log("Cost in TRIF Fixed (rbtc): ", costInTrifFixed.toString())

                const costInTrifAsWei = Utils.toWei(costInTrifFixed.toString(), 'ether')
                console.log("Cost in TRIF (wei): ", costInTrifAsWei.toString())


                console.log("RIF Token Decimals: ", this.ritTokenDecimals)


                $('#execute-fees').val(costInTrifFixed)
                $('#execute-fees').attr('data-tooltip', costInTrifAsWei)
                $('#execute-fees').tooltip()

                console.log("Cost in TRif: ", costInTrifFixed)
            }
        }
        else {
            throw new Error("You dont have any token balance")
        }

    }

    function calculateAbiEncodedFunction() {
        const contractFunction = execute.function.trim();
        const functionSig = web3.eth.abi.encodeFunctionSignature(contractFunction);

        const paramsStart = contractFunction.indexOf("(", 0)
        const paramsEnd = contractFunction.indexOf(")", paramsStart)

        let funcData = functionSig

        if (paramsEnd > (paramsStart + 1)) {//There are params
            const paramsStr = contractFunction.substring(paramsStart + 1, paramsEnd);

            const paramsTypes = paramsStr.split(",");
            const paramsValues = execute.value.split(",");

            const encodedParamVals = web3.eth.abi.encodeParameters(paramsTypes, paramsValues);
            funcData = funcData.concat(encodedParamVals.slice(2, encodedParamVals.length));
        }
        return funcData
    }

    function changeValue(event, prop) {
        let obj = Object.assign({}, execute);
        obj[prop] = event.currentTarget.value;
        setExecute(obj)
    }

    async function pasteRecipientAddress() {
        setShow(true);
        const address = await navigator.clipboard.readText();
        if (Utils.checkAddress(address.toLowerCase())) {
            changeValue({ currentTarget: { value: address } }, 'address');
        }
        setShow(false);
    }

    return (
        <div id="execute-modal" className="modal large-modal" style={{ 'max-height': '75%' }} >
            <div className="modal-content" style={{ 'paddingBottom': '0em' }}>
                <div className="row">
                    <form className="col s12">
                        <div className="row">
                            <div className="input-field col s10">
                                <input placeholder="Contract address" id="execute-contract-address" type="text" className="validate" onChange={(event) => {
                                    changeValue(event, 'address')
                                }} value={execute.address} />
                                <label htmlFor="execute-contract-address">Contract</label>
                            </div>
                            <div className="input-field col s1" style={{ 'paddingTop': '0.5em' }}>
                                <a href="#!" id="paste-contract-address-button" className="btn waves-effect waves-light indigo accent-2" onClick={pasteRecipientAddress}><i className="material-icons center">content_paste</i></a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="e.g.  transfer(address,uint256)" id="contract-function" type="text" className="validate" onChange={(event) => {
                                    changeValue(event, 'function')
                                }} value={execute.function} />
                                <label htmlFor="contract-function">Contract Function</label>
                            </div>
                            <div className="switch col s4" style={{ 'paddingTop': '2.0em' }}>
                                <label>
                                    Show return data
                                    <input type="checkbox" id="show-return-execute" onChange={(event) => {
                                        changeValue(event, 'check')
                                    }} value={execute.show} />
                                    <span className="lever"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="e.g. recipientAddr,amount" id="execute-param-values" type="text" className="validate" onChange={(event) => {
                                    changeValue(event, 'value')
                                }} value={execute.value} />
                                <label htmlFor="execute-param-values">Contract Function Values</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="0" id="execute-fees" type="number" min="0" className="validate tooltipped" data-tooltip="" onChange={(event) => {
                                    changeValue(event, 'fees')
                                }} value={execute.fees} />
                                <label htmlFor="execute-fees" id="execute-fees-label">Fees (tRIF)</label>
                            </div>
                            <div className="switch col s4" style={{ 'paddingTop': '2.5em' }}>
                                <label>
                                    tRIF
                                    <input type="checkbox" onChange={(event) => {
                                        changeValue(event, 'check')
                                    }} value={execute.check} />
                                    <span className="lever"></span>
                                    RBTC
                                </label>
                            </div>
                        </div>
                        <div className="row hide" id="execute-result-row">
                            <div className="input-field col s12">
                                <span id="execute-result" style={{ 'wordBreak': 'break-all', 'width': 'inherit' }}></span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" id="execute-smart-wallet" className="waves-effect waves-green btn-flat" onClick={() => {
                    handleExecuteSmartWalletButtonClick()
                }}>Execute</a>
                <a href="#!" id="execute-smart-wallet-estimate" className="waves-effect waves-green btn-flat" onClick={() => {
                    handleEstimateSmartWalletButtonClick()
                }}>Estimate</a>
                <a href="#!" id="execute-smart-wallet-cancel" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
        </div>
    );
}

export default Execute;
