import { Dispatch, SetStateAction, useState } from 'react';
import {
    RelayGasEstimationOptions,
    RelayingServices,
    RelayingTransactionOptions
} from 'relaying-services-sdk';
import { toBN } from 'web3-utils';
import { Modals, SmartWalletWithBalance } from 'src/types';
import Utils, { TRIF_PRICE } from 'src/Utils';
import 'src/modals/Transfer.css';
import {
    Modal,
    Col,
    Row,
    TextInput,
    Button,
    Icon,
    Switch
} from 'react-materialize';

type TransferProps = {
    currentSmartWallet: SmartWalletWithBalance;
    provider: RelayingServices;
    setUpdateInfo: Dispatch<SetStateAction<boolean>>;
    account?: string;
    modal: Modals;
    setModal: Dispatch<SetStateAction<Modals>>;
};

type TransferInfo = {
    fees: string;
    check: boolean;
    address: string;
    amount: string;
};

type TransferInfoKey = keyof TransferInfo;

function Transfer(props: TransferProps) {
    const {
        currentSmartWallet,
        provider,
        setUpdateInfo,
        account,
        modal,
        setModal
    } = props;

    const [transferLoading, setTransferLoading] = useState(false);
    const [estimateLoading, setEstimateLoading] = useState(false);

    const [transfer, setTransfer] = useState<TransferInfo>({
        check: false,
        fees: '',
        amount: '',
        address: ''
    });

    const close = () => {
        setModal((prev) => ({ ...prev, transfer: false }));
        setTransfer({
            check: false,
            fees: '',
            amount: '',
            address: ''
        });
        setEstimateLoading(false);
        setTransferLoading(false);
    };

    const changeValue = <T,>(value: T, prop: TransferInfoKey) => {
        if ((prop === 'fees' || prop === 'amount') && Number(value) < 0) {
            return;
        }
        setTransfer((prev) => ({ ...prev, [prop]: value }));
    };

    const sendRBTC = async () => {
        if (account) {
            setTransferLoading(true);
            try {
                const amount = await Utils.toWei(transfer.amount.toString());
                await Utils.sendTransaction({
                    from: account, // currentSmartWallet.address,
                    to: transfer.address,
                    value: amount,
                    data: '0x'
                });
                close();
                setUpdateInfo(true);
            } catch (error) {
                const errorObj = error as Error;
                if (errorObj.message) {
                    alert(errorObj.message);
                }
                console.error(error);
            }
            setTransferLoading(false);
        }
    };

    const pasteRecipientAddress = async () => {
        setTransferLoading(true);
        const address = await navigator.clipboard.readText();
        if (Utils.checkAddress(address.toLowerCase())) {
            changeValue(address, 'address');
        }
        setTransferLoading(false);
    };

    const transferSmartWalletButtonClick = async () => {
        setTransferLoading(true);
        try {
            const { amount } = transfer;
            const fees = transfer.fees === '' ? '0' : transfer.fees;

            const encodedAbi = (await Utils.getTokenContract()).methods
                .transfer(
                    transfer.address,
                    await Utils.toWei(amount.toString())
                )
                .encodeABI();

            const relayTrxOpts: RelayingTransactionOptions = {
                smartWallet: currentSmartWallet,
                unsignedTx: {
                    to: transfer.address,
                    data: encodedAbi
                },
                tokenAmount: Number(fees),
                transactionDetails: {
                    retries: 7
                }
            };

            const txDetails = await provider.relayTransaction(relayTrxOpts);
            console.log(txDetails);
            setUpdateInfo(true);
            close();
        } catch (error) {
            const errorObj = error as Error;
            if (errorObj.message) {
                alert(errorObj.message);
            }
            console.error(error);
        }
        setTransferLoading(false);
    };

    const handleEstimateTransferButtonClick = async () => {
        if (account) {
            setEstimateLoading(true);
            try {
                const encodedTransferFunction = (
                    await Utils.getTokenContract()
                ).methods
                    .transfer(
                        transfer.address,
                        await Utils.toWei(transfer.amount.toString() || '0')
                    )
                    .encodeABI();

                const opts: RelayGasEstimationOptions = {
                    abiEncodedTx: encodedTransferFunction,
                    smartWalletAddress: currentSmartWallet.address,
                    tokenFees: '1',
                    destinationContract:
                        process.env.REACT_APP_CONTRACTS_RIF_TOKEN!,
                    relayWorker: process.env.REACT_APP_CONTRACTS_RELAY_WORKER!
                };

                const maxPossibleGasValue =
                    await provider.estimateMaxPossibleRelayGas(opts);
                const gasPrice = toBN(
                    // @ts-ignore TODO: we shouldn't access to the relayProvider
                    // eslint-disable-next-line no-underscore-dangle
                    await provider.relayProvider.relayClient._calculateGasPrice()
                );
                console.log(
                    'maxPossibleGas, gasPrice',
                    maxPossibleGasValue.toString(),
                    gasPrice.toString()
                );
                const maxPossibleGas = toBN(maxPossibleGasValue);
                const estimate = maxPossibleGas.mul(gasPrice);

                const costInRBTC = await Utils.fromWei(estimate.toString());
                console.log('Cost in RBTC:', costInRBTC);

                const costInTrif = parseFloat(costInRBTC) / TRIF_PRICE;
                const tokenContract = await Utils.getTokenContract();
                const ritTokenDecimals = await tokenContract.methods
                    .decimals()
                    .call();
                const costInTrifFixed = costInTrif.toFixed(ritTokenDecimals);
                console.log('Cost in TRif: ', costInTrifFixed);

                if (transfer.check === true) {
                    changeValue(costInRBTC, 'fees');
                } else {
                    changeValue(costInTrifFixed, 'fees');
                }
            } catch (error) {
                const errorObj = error as Error;
                if (errorObj.message) {
                    alert(errorObj.message);
                }
                console.error(error);
            }
            setEstimateLoading(false);
        }
    };

    const handleTransferSmartWalletButtonClick = async () => {
        if (transfer.check) {
            await sendRBTC();
        } else {
            await transferSmartWalletButtonClick();
        }
    };

    const returnLoading = (loading: boolean) => (
        <img
            alt='loading'
            className={`loading ${!loading ? 'hide' : ''}`}
            src='images/loading.gif'
        />
    );

    const returnActions = () => [
        <Button
            flat
            node='button'
            waves='green'
            onClick={handleTransferSmartWalletButtonClick}
            disabled={transferLoading}
        >
            Transfer
            {returnLoading(transferLoading)}
        </Button>,
        <Button
            flat
            node='button'
            waves='green'
            onClick={handleEstimateTransferButtonClick}
            disabled={estimateLoading}
        >
            Estimate
            {returnLoading(estimateLoading)}
        </Button>,
        <Button flat modal='close' node='button' waves='green'>
            Cancel
        </Button>
    ];

    return (
        <Modal
            open={modal.transfer}
            options={{
                onCloseEnd: () => close()
            }}
            actions={returnActions()}
        >
            <Row>
                <form>
                    <Col s={8} className='transfer-input'>
                        <TextInput
                            label='Transfer to'
                            placeholder='Address'
                            value={transfer.address}
                            validate
                            onChange={(event) => {
                                changeValue(
                                    event.currentTarget.value,
                                    'address'
                                );
                            }}
                        />
                    </Col>
                    <Col s={1}>
                        <Button
                            onClick={pasteRecipientAddress}
                            waves='light'
                            className='indigo accent-2'
                            tooltip='Paste'
                        >
                            <Icon center>content_paste</Icon>
                        </Button>
                    </Col>
                    <Col s={8} className='transfer-input'>
                        <TextInput
                            label='Amount'
                            placeholder='0 tRif'
                            value={transfer.amount}
                            type='number'
                            validate
                            onChange={(event) => {
                                changeValue(
                                    event.currentTarget.value,
                                    'amount'
                                );
                            }}
                        />
                    </Col>
                    <Col s={4}>
                        <Switch
                            offLabel='tRif'
                            onLabel='RBTC'
                            checked={transfer.check}
                            onChange={(event) => {
                                changeValue(
                                    event.currentTarget.checked,
                                    'check'
                                );
                            }}
                        />
                    </Col>
                    <Col s={10} className='transfer-input'>
                        <TextInput
                            label='Fees'
                            placeholder='0 tRif'
                            value={transfer.fees}
                            type='number'
                            validate
                            onChange={(event) => {
                                changeValue(event.currentTarget.value, 'fees');
                            }}
                        />
                    </Col>
                </form>
            </Row>
        </Modal>
    );
}

export default Transfer;
