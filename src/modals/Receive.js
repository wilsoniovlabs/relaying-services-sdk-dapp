import { useEffect } from 'react';
import './Receive.css';
//import { useState } from 'react';

const $ = window.$;
function Receive(props) {   
    const {
        currentSmartWallet
    } = props;
    useEffect(()=>{
        if(currentSmartWallet){
            $('#qr-code').empty();
            $('#qr-code').qrcode({ width: '256', height: '256', text: currentSmartWallet.address });
        }
    },[currentSmartWallet])

    return (
        <div id="receive-modal" className="modal">
            <div className="modal-content">
                <div className="row">
                    <div className="col s2"></div>
                    <div id="qr-code" className="col s8 center-align"></div>
                    <div className="col s2"></div>
                </div>
                <div className="row">
                    <div className="col s12">
                        <h6 className="col s12 center-align">{currentSmartWallet? currentSmartWallet.address : ''}</h6>
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
