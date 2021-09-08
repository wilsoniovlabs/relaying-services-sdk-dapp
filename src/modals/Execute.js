import './Execute.css';
//import { useState } from 'react';

function Execute(props) {
    return (
        <div id="execute-modal" className="modal large-modal">
            <div className="modal-content" style={{'paddingBottom': '0em'}}>
                <input type="hidden" id="execute-smart-wallet-address" value="" />
                <input type="hidden" id="execute-smart-wallet-index" value="" />
                <div className="row">
                    <form className="col s12">
                        <div className="row">
                            <div className="input-field col s10">
                                <input placeholder="Contract address" id="execute-contract-address" type="text" className="validate" />
                                <label htmlFor="execute-contract-address">Contract</label>
                            </div>
                            <div className="input-field col s1" style={{'paddingTop': '0.5em'}}>
                                <a href="#!" id="paste-contract-address-button" className="btn waves-effect waves-light indigo accent-2"><i className="material-icons center">content_paste</i></a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="e.g.  transfer(address,uint256)" id="contract-function" type="text" className="validate" />
                                <label htmlFor="contract-function">Contract Function</label>
                            </div>
                            <div className="switch col s4" style={{'paddingTop': '2.0em'}}>
                                <label>
                                    Show return data
                                    <input type="checkbox" id="show-return-execute" />
                                    <span className="lever"></span>
                                </label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="e.g. recipientAddr,amount" id="execute-param-values" type="text" className="validate" />
                                <label htmlFor="execute-param-values">Contract Function Values</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="0" id="execute-fees" type="number" min="0" className="validate tooltipped" data-tooltip="" />
                                <label htmlFor="execute-fees" id="execute-fees-label">Fees (tRIF)</label>
                            </div>
                            <div className="switch col s4" style={{'paddingTop': '2.5em'}}>
                                <label>
                                    tRIF
                                    <input type="checkbox" id="execute-fees-check" onchange="App.updateExecuteFeeCheck()" />
                                    <span className="lever"></span>
                                    RBTC
                                </label>
                            </div>
                        </div>
                        <div className="row hide" id="execute-result-row">
                            <div className="input-field col s12">
                                <span id="execute-result" style={{'wordBreak': 'break-all', 'width': 'inherit'}}></span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" id="execute-smart-wallet" className="waves-effect waves-green btn-flat">Execute</a>
                <a href="#!" id="execute-smart-wallet-estimate" className="waves-effect waves-green btn-flat" onClick="App.handleEstimateSmartWalletButtonClick()">Estimate</a>
                <a href="#!" id="execute-smart-wallet-close" className="modal-close waves-effect waves-green btn-flat hide">Close</a>
                <a href="#!" id="execute-smart-wallet-cancel" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
        </div>
    );
}

export default Execute;
