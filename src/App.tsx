import { useState, useEffect } from 'react';
import 'src/App.css';
import Web3 from 'web3';

import {
    DefaultRelayingServices,
    RelayingServices
} from 'relaying-services-sdk';

import { RelayingServicesAddresses } from 'relaying-services-sdk/dist/interfaces';
import { EnvelopingConfig } from '@rsksmart/rif-relay-common';
import Header from 'src/components/Header';
import SmartWallet from 'src/components/SmartWallet';
import Footer from 'src/components/Footer';
import Deploy from 'src/modals/Deploy';
import Receive from 'src/modals/Receive';
import Transfer from 'src/modals/Transfer';
import Loading from 'src/modals/Loading';
import Execute from 'src/modals/Execute';
import Utils from 'src/Utils';
import { Modals, SmartWalletWithBalance } from 'src/types';

if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
} else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
} else {
    throw new Error('Error: MetaMask or web3 not detected');
}

function getEnvParamAsInt(value: string | undefined): number | undefined {
    return value ? parseInt(value, 10) : undefined;
}

const { web3 } = window;
const { ethereum } = window;

function App() {
    const [modal, setModal] = useState<Modals>({
        deploy: false,
        execute: false,
        receive: false,
        transfer: false
    });
    const [connected, setConnect] = useState(false);
    const [chainId, setChainId] = useState(0);
    const [account, setAccount] = useState<string | undefined>(undefined);
    const [currentSmartWallet, setCurrentSmartWallet] = useState<
        SmartWalletWithBalance | undefined
    >(undefined);
    const [provider, setProvider] = useState<RelayingServices | undefined>(
        undefined
    );
    const [show, setShow] = useState(false);

    const [smartWallets, setSmartWallets] = useState<SmartWalletWithBalance[]>(
        []
    );
    const [updateInfo, setUpdateInfo] = useState(false);

    async function initProvider() {
        try {
            const config: Partial<EnvelopingConfig> = {
                chainId: getEnvParamAsInt(
                    process.env.REACT_APP_RIF_RELAY_CHAIN_ID
                ),
                gasPriceFactorPercent: getEnvParamAsInt(
                    process.env.REACT_APP_RIF_RELAY_GAS_PRICE_FACTOR_PERCENT
                ),
                relayLookupWindowBlocks: getEnvParamAsInt(
                    process.env.REACT_APP_RIF_RELAY_LOOKUP_WINDOW_BLOCKS
                ),
                preferredRelays: process.env
                    .REACT_APP_RIF_RELAY_PREFERRED_RELAYS
                    ? process.env.REACT_APP_RIF_RELAY_PREFERRED_RELAYS.split(
                          ','
                      )
                    : undefined,
                relayHubAddress: process.env.REACT_APP_CONTRACTS_RELAY_HUB,
                relayVerifierAddress:
                    process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER,
                deployVerifierAddress:
                    process.env.REACT_APP_CONTRACTS_DEPLOY_VERIFIER,
                smartWalletFactoryAddress:
                    process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY,
                logLevel: 0
            };
            const contractAddresses: RelayingServicesAddresses = {
                relayHub: process.env.REACT_APP_CONTRACTS_RELAY_HUB!,
                smartWallet: process.env.REACT_APP_CONTRACTS_SMART_WALLET!,
                smartWalletFactory:
                    process.env.REACT_APP_CONTRACTS_SMART_WALLET_FACTORY!,
                smartWalletDeployVerifier:
                    process.env.REACT_APP_CONTRACTS_DEPLOY_VERIFIER!,
                smartWalletRelayVerifier:
                    process.env.REACT_APP_CONTRACTS_RELAY_VERIFIER!,
                testToken: process.env.REACT_APP_CONTRACTS_RIF_TOKEN!,
                // TODO: Why aren't these addresses required? we may set them as optional
                penalizer: '',
                customSmartWallet: '',
                customSmartWalletFactory: '',
                customSmartWalletDeployVerifier: '',
                customSmartWalletRelayVerifier: '',
                sampleRecipient: ''
            };

            // Get an RIF Relay RelayProvider instance and assign it to Web3 to use RIF Relay transparently
            console.log(process.env);
            const relayingServices = new DefaultRelayingServices(web3);
            await relayingServices.initialize(config, contractAddresses);
            setProvider(relayingServices);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!updateInfo) {
            return;
        }
        (async () => {
            setConnect(false);
            setSmartWallets([]);
            setTimeout(() => {
                setConnect(true);
                setUpdateInfo(false);
            }, 100);
        })();
    }, [updateInfo]);

    async function refreshAccount() {
        setSmartWallets([]);
        const accounts = await Utils.getAccounts();
        const currentAccount = accounts[0];
        setAccount(currentAccount);
    }

    async function connectToMetamask() {
        let isConnected = false;
        try {
            const chain: number = await web3.eth.getChainId();
            if (chain.toString() === process.env.REACT_APP_RIF_RELAY_CHAIN_ID) {
                await ethereum.request({ method: 'eth_requestAccounts' });
                ethereum.on('accountsChanged', async (/* accounts */) => {
                    await refreshAccount();
                });

                ethereum.on('networkChanged', async (newChain: number) => {
                    setChainId(newChain);
                });
                setChainId(chain);
                isConnected = true;
            } else {
                alert(
                    `Wrong network ID ${chain}, it must be ${process.env.REACT_APP_RIF_RELAY_CHAIN_ID}`
                );
            }
        } catch (error) {
            console.error(error);
        }
        setConnect(isConnected);
        return isConnected;
    }

    async function connect() {
        try {
            setShow(true);
            let isConnected = false;
            if (!connected) {
                isConnected = await connectToMetamask();
            }

            if (isConnected) {
                await initProvider();
                await refreshAccount();
            } else {
                console.warn('Unable to connect to Metamask');
                setConnect(isConnected);
            }

            setShow(false);
        } catch (error) {
            console.log(error);
            console.warn('User denied account access');
            setShow(false);
        }
    }

    return (
        <div className='App'>
            <Loading show={show} />
            <Header
                account={account}
                // eslint-disable-next-line react/jsx-no-bind
                connect={connect}
                connected={connected}
                chainId={chainId}
                setUpdateInfo={setUpdateInfo}
            />

            <SmartWallet
                connected={connected}
                smartWallets={smartWallets}
                setCurrentSmartWallet={setCurrentSmartWallet}
                setShow={setShow}
                setModal={setModal}
            />

            {connected && (
                <Footer
                    provider={provider}
                    smartWallets={smartWallets}
                    setSmartWallets={setSmartWallets}
                    connected={connected}
                    account={account}
                    setShow={setShow}
                />
            )}

            <Deploy
                currentSmartWallet={currentSmartWallet}
                provider={provider}
                setUpdateInfo={setUpdateInfo}
                modal={modal}
                setModal={setModal}
            />
            <Receive
                currentSmartWallet={currentSmartWallet}
                modal={modal}
                setModal={setModal}
            />
            <Transfer
                provider={provider!}
                currentSmartWallet={currentSmartWallet!}
                setUpdateInfo={setUpdateInfo}
                account={account}
                modal={modal}
                setModal={setModal}
            />
            <Execute
                provider={provider!}
                currentSmartWallet={currentSmartWallet}
                account={account}
                setUpdateInfo={setUpdateInfo}
                modal={modal}
                setModal={setModal}
            />
        </div>
    );
}

export default App;
