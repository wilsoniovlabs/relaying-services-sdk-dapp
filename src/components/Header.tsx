import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Utils from 'src/Utils';
import 'src/components/Header.css';
import { Row, Col, Button, Icon } from 'react-materialize';
import { RelayingServices } from 'relaying-services-sdk';
import AllowedTokens from './AllowedTokens';

type HeaderProps = {
    account?: string;
    connect: () => Promise<void>;
    setUpdateInfo: Dispatch<SetStateAction<boolean>>;
    connected: boolean;
    chainId: number;
    provider: RelayingServices;
    token: string;
    setToken: Dispatch<SetStateAction<string>>
};

function Header(props: HeaderProps) {
    const { account, connect, setUpdateInfo, connected, chainId, provider, token, setToken } = props;

    const [balance, setBalance] = useState<string>();

    console.log(provider);

    useEffect(() => {
        if (!account) {
            return;
        }
        (async () => {
            console.log(account);
            const currentBalance = await Utils.getBalance(account);
            const balanceConverted = Utils.fromWei(currentBalance);
            setBalance(`${balanceConverted} RBTC  `);
        })();
    }, [account]);


    const reload = async () => {
        setUpdateInfo(true);
    };

    return (
        <header>
            <nav
                className={
                    chainId.toString() ===
                        process.env.REACT_APP_RIF_RELAY_CHAIN_ID
                        ? 'connected-network'
                        : ''
                }
            >
                <Row>
                    <Col s={6}>
                        <Row>
                            <Col s={4}>
                                <div className='brand-logo'>
                                    <img
                                        alt='logo'
                                        src='images/rif_logo_2.png'
                                    />
                                    <span>
                                        <b>RIF Relay</b>
                                    </span>
                                </div>
                            </Col>
                            <Col s={8}>
                                {provider &&
                                    <AllowedTokens
                                        provider={provider!}
                                        setUpdateInfo={setUpdateInfo}
                                        token={token}
                                        setToken={setToken}
                                    />
                                }
                            </Col>
                        </Row>
                    </Col>

                    <Col s={6}>
                        <Row className='right'>
                            <Col>
                                <span id='eoa-address'>
                                    {account || 'Address'}{' '}
                                </span>
                                <span>&nbsp;|&nbsp;</span>
                                <span id='eoa-balance' className='eoa-balance'>
                                    {balance || 'Balance'}{' '}
                                </span>
                            </Col>
                            <Col>
                                <Button
                                    waves='light'
                                    className='indigo accent-2'
                                    onClick={connect}
                                    disabled={connected}
                                >
                                    Connect Wallet
                                    <Icon right className='material-icons'>
                                        account_balance_wallet
                                    </Icon>
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    waves='light'
                                    onClick={reload}
                                    floating
                                >
                                    <Icon className='material-icons'>
                                        update
                                    </Icon>
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </nav>
        </header>
    );
}

export default Header;
