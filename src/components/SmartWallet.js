import './SmartWallet.css';
//import { useState } from 'react';

window.M.AutoInit();
function SmartWallet(props) {
    const { 
        connected
        , smartWallets
        , setCurrentSmartWallet
        , setShow
    } = props;

    async function copySmartWalletAddress(address) {
        setShow(true);
        await navigator.clipboard.writeText(address);
        setShow(false);
    }
    
    return (
        <div className="smart-wallets">
            <div id="no-smart-wallets" className="row grey">
                <div id="no-wallets-message" className={`col s12 ${smartWallets.length <= 0 && connected? '' :'hide'}`} >
                    <h6 className="center-align">No Smart Wallets detected for selected account. Create a new Smart Wallet by clicking the New Smart Wallet button.</h6>
                </div>
                <div id="no-connection" className={`col s12 ${connected ? 'hide' : ''}`}>
                    <h6 className="center-align">Wallet not connected, please connect.</h6>
                </div>
            </div>
            {smartWallets.map((smartWallet, index) => {
                return (
                    <div key={index} className={`smart-wallet row teal lighten-4`}>
                        <div className="col s1">
                            <a className={`btn-floating btn-medium waves-effect waves-light indigo accent-2 tooltipped modal-trigger ${smartWallet.deployed? 'disabled' : ''}`} data-position="bottom" data-tooltip="Deploy" href="#deploy-modal" onClick={()=>{
                                setCurrentSmartWallet(smartWallet);
                                }}><i className="material-icons">file_upload</i></a>
                        </div>
                        <div className="col s2">
                            <h6 className="tooltipped summary-smart-wallet-address" data-position="bottom" data-tooltip="0x">{smartWallet.address}</h6>
                        </div>
                        <div className="col s1 copy-container" >
                            <a href="#!" className="btn-floating btn-small waves-effect waves-light indigo accent-2 tooltipped" data-position="bottom" data-tooltip="Copy address" onClick={() => { copySmartWalletAddress(smartWallet.address) }}><i className="material-icons">content_copy</i></a>
                        </div>
                        <div className="col s2">
                            <h6 >{smartWallet.balance}</h6>
                        </div>
                        <div className="col s3">
                            <h6 >{smartWallet.rbtcBalance}</h6>
                        </div>
                        <div className="col s1 right-align">
                            <a id="transfer-button-0" className={`btn-floating btn-medium waves-effect waves-light indigo accent-2 tooltipped modal-trigger ${smartWallet.deployed? '' : 'disabled'}`} data-position="bottom" data-tooltip="Transfer" href="#transfer-modal" onClick={()=>{
                                setCurrentSmartWallet(smartWallet);
                            }}>
                                <i className="material-icons">call_made</i>
                            </a>
                        </div>
                        <div className="col s1 center-align">
                            <a id="receive-button-0" className="btn-floating btn-medium waves-effect waves-light indigo accent-2 tooltipped modal-trigger" data-position="bottom" data-tooltip="Receive" href="#receive-modal" onClick={()=>{
                                setCurrentSmartWallet(smartWallet);
                            }}>
                                <i className="material-icons">arrow_downward</i>
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SmartWallet;
