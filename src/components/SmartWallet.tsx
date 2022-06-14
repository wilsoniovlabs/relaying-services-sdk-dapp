import { Dispatch, SetStateAction } from 'react';
import { Modals, SmartWalletWithBalance } from 'src/types';
import 'src/components/SmartWallet.css';
import { Col, Row, Button, Icon } from 'react-materialize';

// TODO: Replace it with react-materialize

type SmartWalletProps = {
    connected: boolean;
    smartWallets: SmartWalletWithBalance[];
    setCurrentSmartWallet: Dispatch<SetStateAction<SmartWalletWithBalance | undefined>>;
    setShow: Dispatch<SetStateAction<boolean>>;
    setModal: Dispatch<SetStateAction<Modals>>;
};

type ModalsKey = keyof Modals;

function SmartWallet(props: SmartWalletProps) {
    const { connected, smartWallets, setCurrentSmartWallet, setShow, setModal } = props;
    async function copySmartWalletAddress(address: string) {
        setShow(true);
        await navigator.clipboard.writeText(address);
        setShow(false);
    }

    function openModal(smartWallet: SmartWalletWithBalance, modal: ModalsKey) {
        setCurrentSmartWallet(smartWallet);
        setModal(prev => ({ ...prev, [modal]: true }));
    }

    return (
        <div className='smart-wallets'>
            <Row className={`grey ${smartWallets.length <= 0 && connected ? '' : 'hide'}`}>
                <Col
                    s={12}
                >
                    <h6 className='center-align'>
                        No Smart Wallets detected for selected account. Create a
                        new Smart Wallet by clicking the New Smart Wallet
                        button.
                    </h6>
                </Col>
                <Col
                    s={12}
                    className={`${connected ? 'hide' : ''}`}
                >
                    <h6 className='center-align'>
                        Wallet not connected, please connect.
                    </h6>
                </Col>
            </Row>
            {smartWallets.map((smartWallet: SmartWalletWithBalance) => (
                <Row
                    key={smartWallet.index}
                    className="space-row"
                >
                    <Row className="teal lighten-4">
                        <Col s={1}>
                            <Button
                                waves='light'
                                className='indigo accent-2'
                                tooltip='Deploy'
                                floating
                                disabled={smartWallet.deployed}
                                onClick={() => {
                                    openModal(smartWallet, 'deploy');
                                }}
                            >
                                <Icon center >
                                    file_upload
                                </Icon>
                            </Button>
                        </Col>
                        <Col s={3}>
                            <h6 className='summary-smart-wallet-address'>
                                {smartWallet.address}
                            </h6>
                        </Col>
                        <Col s={1}>
                            <Button
                                waves='light'
                                className='indigo accent-2'
                                tooltip='Copy address'
                                floating
                                onClick={() => {
                                    copySmartWalletAddress(smartWallet.address);
                                }}

                            >
                                <Icon center >
                                    content_copy
                                </Icon>
                            </Button>
                        </Col>
                        <Col s={2}>
                            <h6>{smartWallet.balance}</h6>
                        </Col>
                        <Col s={2}>
                            <h6>{smartWallet.rbtcBalance}</h6>
                        </Col>
                        <Col s={1}>
                            <Button
                                waves='light'
                                className='indigo accent-2'
                                tooltip='Transfer'
                                floating
                                disabled={!smartWallet.deployed}
                                onClick={() => {
                                    openModal(smartWallet, 'transfer');
                                }}

                            >
                                <Icon center >
                                    call_made
                                </Icon>
                            </Button>
                        </Col>
                        <Col s={1}>
                            <Button
                                waves='light'
                                className='indigo accent-2'
                                tooltip='Receive'
                                floating
                                onClick={() => {
                                    openModal(smartWallet, 'receive');
                                }}

                            >
                                <Icon center >
                                    arrow_downward
                                </Icon>
                            </Button>
                        </Col>
                        <Col s={1}>
                            <Button
                                waves='light'
                                className='indigo accent-2'
                                tooltip='Execute'
                                floating
                                disabled={!smartWallet.deployed}
                                onClick={() => {
                                    openModal(smartWallet, 'execute');
                                }}

                            >
                                <Icon center >
                                    play_circle_outline
                                </Icon>
                            </Button>
                        </Col>
                    </Row>
                </Row>
            ))}
        </div>
    );
}

export default SmartWallet;
