import './Deploy.css';
//import { useState } from 'react';

function Deploy(props) {
    return (
        <div id="deploy-modal" className="modal">
            <div className="modal-content">
                <input type="hidden" id="deploy-smart-wallet-address" value="" />
                <input type="hidden" id="deploy-smart-wallet-index" value="" />
                <input type="hidden" id="deploy-relay-gas-to-use" value="" />
                <div className="row">
                    <form className="col s12">
                        <div className="row">
                            <div className="input-field col s8">
                                <input placeholder="0" id="deploy-fees" type="number" min="0" className="validate tooltipped" data-tooltip="" />
                                <label htmlFor="deploy-fees" id="deploy-fees-label">Fees (tRIF)</label>
                            </div>
                            <div className="switch col s4" style={{'paddingTop': '2.5em'}}>
                                <label>
                                    tRIF
                                    <input type="checkbox" id="deploy-fees-check" />
                                    <span className="lever"></span>
                                    RBTC
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" id="deploy-smart-wallet-estimate" className="waves-effect waves-green btn-flat" onClick="App.handleEstimateDeploySmartWalletButtonClick()">Estimate</a>
                <a id="deploy-smart-wallet" href="#!" className="waves-effect waves-green btn-flat">Deploy</a>
                <a href="#!" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
        </div>
    );
}

export default Deploy;
