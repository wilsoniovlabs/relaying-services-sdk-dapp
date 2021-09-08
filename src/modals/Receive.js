import './Receive.css';
//import { useState } from 'react';

function Receive(props) {
    return (
        <div id="receive-modal" className="modal">
            <div className="modal-content" style={{'paddingBottom': '0em'}}>
                <div className="row">
                    <div className="col s2"></div>
                    <div id="qr-code" className="col s8 center-align"></div>
                    <div className="col s2"></div>
                </div>
                <div className="row">
                    <div className="col s12">
                        <h6 id="receive-smart-wallet-address" className="col s12 center-align">o</h6>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <a href="#!" className="modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
    );
}

export default Receive;
