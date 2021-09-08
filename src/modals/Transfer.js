import './Transfer.css';
//import { useState } from 'react';

function Transfer(props) {
    return (
        <div id="transfer-modal" className="modal">
            <div className="modal-content" style={{'paddingBottom': '0em'}}>
                <input type="hidden" id="transfer-smart-wallet-address" value="" />
                <div className="row">
                    <form className="col s12 offset-s1">
                        <div className="row">
                            <div className="input-field col s9">
                                <input placeholder="Address" id="transfer-to" type="text" className="validate" />
                                <label htmlFor="transfer-to">Transfer to</label>
                            </div>
                            <div className="input-field col s1" style={{'paddingTop': '0.5em', 'paddingLeft': '0em'}}>
                                <a href="#!" id="paste-recipient-address-button" className="btn waves-effect waves-light indigo accent-2"><i className="material-icons center">content_paste</i></a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s10">
                                <input placeholder="0 tRIF" id="transfer-amount" type="number" min="0" className="validate" />
                                <label htmlFor="transfer-amount">Amount</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s7">
                                <input placeholder="0 tRIF" id="transfer-fees" type="number" min="0" className="validate" />
                                <label htmlFor="transfer-fees">Fees</label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" id="transfer-smart-wallet" className="waves-effect waves-green btn-flat">Transfer</a>
                <a href="#!" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
        </div>
    );
}

export default Transfer;
