import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RelayingServices, SmartWallet } from 'relaying-services-sdk';
import { SmartWalletWithBalance } from 'src/types';
import Utils, { TRIF_PRICE } from 'src/Utils';
import 'src/components/Footer.css';
import { Col, Row, Button, Icon } from 'react-materialize';

type FooterProps = {
    smartWallets: SmartWalletWithBalance[];
    setSmartWallets: Dispatch<SetStateAction<SmartWalletWithBalance[]>>;
    connected: boolean;
    account?: string;
    provider?: RelayingServices;
    setShow: Dispatch<SetStateAction<boolean>>;
    token: string;
    updateInfo: boolean;
};

function Footer(props: FooterProps) {
    const {
        smartWallets,
        setSmartWallets,
        connected,
        account,
        provider,
        setShow,
        token,
        updateInfo
    } = props;

    const [tokenSymbol, setTokenSymbol] = useState('');
    const [workerBalance, setWorkerBalance] = useState('0');

    const setBalance = async (
        smartWallet: SmartWallet,
        symbol: string
    ): Promise<SmartWalletWithBalance> => {
        const balance = await Utils.tokenBalance(smartWallet.address, token);
        const rbtcBalance = await Utils.getBalance(smartWallet.address);
        const swWithBalance = {
            ...smartWallet,
            balance: `${Utils.fromWei(balance)} ${symbol}`,
            rbtcBalance: `${Utils.fromWei(rbtcBalance)} RBTC`
        };
        return swWithBalance;
    };

    useEffect(() => {
        if (!account || !provider) {
            return;
        }
        (async () => {
            let index: number = 0;
            let found: boolean = true;
            const tempSmartWallets: SmartWalletWithBalance[] = [];
            const symbol = await Utils.tokenSymbol(token);
            setTokenSymbol(symbol);
            while (found) {
                // eslint-disable-next-line no-await-in-loop
                const smartWalletAddress = await provider.generateSmartWallet(
                    index + 1
                );
                // eslint-disable-next-line no-await-in-loop
                const deployed = await provider.isSmartWalletDeployed(
                    smartWalletAddress.address
                );
                if (deployed) {
                    // eslint-disable-next-line no-await-in-loop
                    const smartWalletWithBalance = await setBalance(
                        smartWalletAddress,
                        symbol
                    );
                    tempSmartWallets.push(smartWalletWithBalance);
                    index += 1;
                } else {
                    setSmartWallets(tempSmartWallets);
                    found = false;
                }
            }
        })();
    }, [account, token, updateInfo]);

    useEffect(() => {
        (async () => {
            const workerAddress = process.env.REACT_APP_CONTRACTS_RELAY_WORKER!;
            const currentWorkerBalance = parseFloat(
                Utils.fromWei(await Utils.tokenBalance(workerAddress, token))
            ).toFixed(4);
            setWorkerBalance(currentWorkerBalance);
        })();
    }, [setWorkerBalance, token]);

    const create = async () => {
        if (provider) {
            setShow(true);
            const smartWallet = await provider?.generateSmartWallet(
                smartWallets.length + 1
            );

            const smartWalletWithBalance = await setBalance(
                smartWallet,
                tokenSymbol
            );
            setSmartWallets([...smartWallets, smartWalletWithBalance]);
            setShow(false);
        }
    };

    return (
        <Row className='space-row'>
            <Col s={6}>
                <Button
                    waves='light'
                    className='indigo accent-2'
                    onClick={create}
                    disabled={!connected}
                >
                    New Smart Wallet
                    <Icon right>add_circle_outline</Icon>
                </Button>
            </Col>
            <Col s={6}>
                <Row>
                    <Col s={6}>
                        <h6>
                            {tokenSymbol} price: <span>{TRIF_PRICE}</span> RBTC
                        </h6>
                    </Col>
                    <Col s={6}>
                        <h6>
                            Worker balance: <span>{workerBalance}</span>{' '}
                            {tokenSymbol}
                        </h6>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}

export default Footer;
