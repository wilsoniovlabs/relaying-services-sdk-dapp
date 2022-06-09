import { useEffect } from 'react';
import { SmartWallet } from 'relaying-services-sdk';
import { QRCodeSVG } from 'qrcode.react';
import './Receive.css';

type ReceiveProps = {
    currentSmartWallet?: SmartWallet;
};

function Receive(props: ReceiveProps) {
    const { currentSmartWallet } = props;
    useEffect(() => {
        if (currentSmartWallet) {
            <QRCodeSVG value={currentSmartWallet.address} size={256} />
        }
    }, [currentSmartWallet]);

    return (
        <div id='receive-modal' className='modal'>
            <div className='modal-content'>
                <div className='row'>
                    <div className='col s2' />
                    <div id='qr-code' className='col s8 center-align' />
                    <div className='col s2' />
                </div>
                <div className='row'>
                    <div className='col s12'>
                        <h6 className='col s12 center-align'>
                            {currentSmartWallet
                                ? currentSmartWallet.address
                                : ''}
                        </h6>
                    </div>
                </div>
            </div>
            <div className='modal-footer'>
                <a
                    href='#!'
                    className='modal-close waves-effect waves-green btn-flat'
                >
                    Close
                </a>
            </div>
        </div>
    );
}

export default Receive;
