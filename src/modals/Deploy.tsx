import { Dispatch, SetStateAction, useState } from 'react';
import {
    RelayGasEstimationOptions,
    RelayingServices,
    SmartWallet
} from '@rsksmart/rif-relay-sdk';
import { Modal, Col, Row, TextInput, Button } from 'react-materialize';
import Utils, { TRIF_PRICE, ZERO_ADDRESS } from 'src/Utils';
import { Modals } from 'src/types';
import 'src/modals/Deploy.css';

type DeployProps = {
    currentSmartWallet?: SmartWallet;
    provider?: RelayingServices;
    setUpdateInfo: Dispatch<SetStateAction<boolean>>;
    modal: Modals;
    setModal: Dispatch<SetStateAction<Modals>>;
    token: string;
};

type DeployInfo = {
    fees: string;
    check: boolean;
    tokenGas: number | string;
    relayGas: number;
};

type DeployInfoKey = keyof DeployInfo;

function Deploy(props: DeployProps) {
    const {
        currentSmartWallet,
        provider,
        setUpdateInfo,
        modal,
        setModal,
        token
    } = props;

    const [deploy, setDeploy] = useState<DeployInfo>({
        fees: '0',
        check: false,
        tokenGas: 0,
        relayGas: 0
    });

    const [deployLoading, setDeployLoading] = useState(false);
    const [estimateLoading, setEstimateLoading] = useState(false);

    /*
     * It receives the value and the property to change and
     * it updates the status of the `deploy` object with a copy
     * of the current status but with the property specified updated
     * with the new value
     */
    const changeValue = <T,>(value: T, prop: DeployInfoKey) => {
        if (prop === 'fees' && Number(value) < 0) {
            return;
        }
        setDeploy((prev) => ({ ...prev, [prop]: value }));
    };

    const handleEstimateDeploySmartWalletButtonClick = async () => {
        setEstimateLoading(true);
        try {
            const opts: RelayGasEstimationOptions = {
                abiEncodedTx: '0x',
                destinationContract: ZERO_ADDRESS,
                relayWorker: process.env.REACT_APP_CONTRACTS_RELAY_WORKER!,
                smartWalletAddress: currentSmartWallet?.address!,
                tokenFees: '1',
                isSmartWalletDeploy: true,
                index: currentSmartWallet?.index.toString(),
                tokenAddress: token
            };

            const estimate = await provider?.estimateMaxPossibleRelayGas(opts);
            console.log(estimate);

            if (estimate) {
                const costInRBTC = await Utils.fromWei(estimate.toString());
                console.log('Cost in RBTC:', costInRBTC);

                const costInTrif = parseFloat(costInRBTC) / TRIF_PRICE;
                const tokenContract = await Utils.getTokenContract(token);
                const ritTokenDecimals = await tokenContract.methods
                    .decimals()
                    .call();
                const costInTrifFixed = costInTrif.toFixed(ritTokenDecimals);
                console.log('Cost in TRif: ', costInTrifFixed);

                if (deploy.check === true) {
                    changeValue(costInRBTC, 'fees');
                } else {
                    changeValue(costInTrifFixed, 'fees');
                }
            }
        } catch (error) {
            const errorObj = error as Error;
            if (errorObj.message) {
                alert(errorObj.message);
            }
            console.error(error);
        }
        setEstimateLoading(false);
    };

    const getReceipt = async (transactionHash: string) => {
        let receipt = await Utils.getTransactionReceipt(transactionHash);
        let times = 0;

        while (receipt === null && times < 40) {
            times += 1;
            // eslint-disable-next-line no-promise-executor-return
            const sleep = new Promise((resolve) => setTimeout(resolve, 1000));
            // eslint-disable-next-line no-await-in-loop
            await sleep;
            // eslint-disable-next-line no-await-in-loop
            receipt = await Utils.getTransactionReceipt(transactionHash);
        }

        return receipt;
    };

    const checkSmartWalletDeployment = async (txHash: string) => {
        const receipt = await getReceipt(txHash);

        if (receipt === null) {
            return false;
        }

        console.log(`Your receipt is`);
        console.log(receipt);
        return receipt.status;
    };

    const relaySmartWalletDeployment = async (tokenAmount: string | number) => {
        try {
            if (provider) {
                const isTokenAllowed = await provider.isAllowedToken(token);
                if (isTokenAllowed) {
                    const fees = await Utils.toWei(`${tokenAmount}`);
                    const smartWallet = await provider.deploySmartWallet(
                        currentSmartWallet!,
                        {
                            tokenAddress: token,
                            tokenAmount: Number(fees)
                        }
                    );
                    const smartWalledIsDeployed =
                        await checkSmartWalletDeployment(
                            smartWallet.deployment?.deployTransaction!
                        );
                    if (!smartWalledIsDeployed) {
                        throw new Error('SmartWallet: deployment failed');
                    }
                    return smartWallet;
                }
                throw new Error(
                    'SmartWallet: was not created because Verifier does not accept the specified token for payment'
                );
            }
        } catch (error) {
            const errorObj = error as Error;
            if (errorObj.message) {
                alert(errorObj.message);
            }
            console.error(error);
        }
        return undefined;
    };

    const close = () => {
        setModal((prev) => ({ ...prev, deploy: false }));
        setDeploy({
            fees: '0',
            check: false,
            tokenGas: 0,
            relayGas: 0
        });
    };

    const handleDeploySmartWalletButtonClick = async () => {
        deploy.fees = deploy.fees === '' ? '0' : deploy.fees;
        deploy.tokenGas = deploy.tokenGas === '' ? '0' : deploy.tokenGas;

        setDeployLoading(true);
        const smartWallet = await relaySmartWalletDeployment(deploy.fees);
        if (smartWallet?.deployment) {
            setUpdateInfo(true);
            close();
        }

        setDeployLoading(false);
    };

    const returnLoading = (loading: boolean) => (
        <img
            alt='loading'
            className={`loading ${!loading ? 'hide' : ''}`}
            src='images/loading.gif'
        />
    );

    function returnActions() {
        return [
            <Button
                flat
                node='button'
                waves='green'
                onClick={handleDeploySmartWalletButtonClick}
                disabled={deployLoading}
            >
                Deploy
                {returnLoading(deployLoading)}
            </Button>,
            <Button
                flat
                node='button'
                waves='green'
                onClick={handleEstimateDeploySmartWalletButtonClick}
                disabled={estimateLoading}
            >
                Estimate
                {returnLoading(estimateLoading)}
            </Button>,
            <Button flat modal='close' node='button' waves='green'>
                Cancel
            </Button>
        ];
    }

    return (
        <Modal
            open={modal.deploy}
            options={{
                onCloseEnd: () => close()
            }}
            actions={returnActions()}
        >
            <Row>
                <form>
                    <Col s={8}>
                        <TextInput
                            label='Fees (tRIF)'
                            placeholder='0'
                            value={deploy.fees}
                            type='number'
                            validate
                            onChange={(event) => {
                                changeValue(event.target.value, 'fees');
                            }}
                        />
                    </Col>
                </form>
            </Row>
        </Modal>
    );
}

export default Deploy;
