import { useState } from 'react';
import Utils from '../Utils';
import './Transfer.css';

//import { useState } from 'react';
const M = window.M;
const $ = window.$;

function Transfer(props) {
    const {
        currentSmartWallet
        , provider
    } = props;

    const [transfer, setTransfer] = useState({});
    
    async function pasteRecipientAddress() {
        const address = await navigator.clipboard.readText();
        if (Utils.checkAddress(address.toLowerCase())) {
            changeValue({ currentTarget: { value: address } }, 'address');
        }
    }

    function changeValue(event, prop) {
        let obj = Object.assign({}, transfer);
        obj[prop] = event.currentTarget.value;
        setTransfer(obj)
    }

    async function handleTransferSmartWalletButtonClick() {
        const amount = transfer.amount;
        const fees = transfer.fees === "" ? "0" : transfer.fees;

        const encodedAbi = (await Utils.getTokenContract()).methods
            .transfer(transfer.address, await Utils.toWei(amount)).encodeABI();
        
        const txDetials = await provider.relayTransaction(
            {
                to: transfer.address
                , data: encodedAbi
            }
            , {
                tokenAddress: process.env.REACT_APP_CONTRACTS_RIF_TOKEN
                , ...currentSmartWallet
            }
            , fees
        );
        console.log(txDetials);
        var instance = M.Modal.getInstance($('#transfer-modal'));
        instance.close();
    }

    return (
        <div id="transfer-modal" className="modal">
            <div className="modal-content">
                <div className="row">
                    <form className="col s12 offset-s1">
                        <div className="row">
                            <div className="input-field col s9">
                                <input placeholder="Address" type="text" className="validate" onChange={(event) => {
                                    changeValue(event, 'address')
                                }} value={transfer.address} />
                                <label htmlFor="transfer-to">Transfer to</label>
                            </div>
                            <div className="input-field paste-container col s1">
                                <a href="#!" className="btn waves-effect waves-light indigo accent-2"><i className="material-icons center" onClick={pasteRecipientAddress}>content_paste</i></a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s10">
                                <input placeholder="0 tRIF" type="number" min="0" className="validate" onChange={(event) => {
                                    changeValue(event, 'amount')
                                }} value={transfer.amount} />
                                <label htmlFor="transfer-amount">Amount</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="0 tRIF" type="number" min="0" className="validate" onChange={(event) => {
                                    changeValue(event, 'fees')
                                }} value={transfer.fees} />
                                <label htmlFor="transfer-fees">Fees</label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" onClick={handleTransferSmartWalletButtonClick} className="waves-effect waves-green btn-flat">Transfer</a>
                <a href="#!" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
        </div>
    );
}

export default Transfer;
