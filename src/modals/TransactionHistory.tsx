import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SmartWallet } from '@rsksmart/rif-relay-sdk';
import { Modal, Col, Row, Table, Button, Icon } from 'react-materialize';
import { Modals } from '../types';
import Utils from '../Utils';

type TransactionHistoryProps = {
    currentSmartWallet?: SmartWallet;
    modal: Modals;
    setModal: Dispatch<SetStateAction<Modals>>;
};

type Transaction = {
    date: Date;
    id: string;
};

function TransactionHistory(props: TransactionHistoryProps) {
    const { currentSmartWallet, modal, setModal } = props;

    const columns: string[] = ['No', 'Date', 'Transaction', 'Action'];

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (currentSmartWallet?.address! in localStorage) {
            const localTransactions: Transaction[] = JSON.parse(
                localStorage.getItem(currentSmartWallet?.address!)!
            );
            setTransactions(localTransactions);
        }
    }, []);

    const openExplorer = (transaction: Transaction) => {
        Utils.openExplorer(transaction.id);
    };

    const tableRows = () => {
        transactions.map((transaction: Transaction, index: number) => (
            <tr key={transaction.id}>
                <td>{index}</td>
                <td>{transaction.date.toISOString()}</td>
                <td>{transaction.id}</td>
                <td>
                    <Button
                        waves='light'
                        className='indigo accent-2'
                        onClick={() => openExplorer(transaction)}
                        tooltip='Explore'
                        floating
                    >
                        <Icon center>language</Icon>
                    </Button>
                </td>
            </tr>
        ));
    };

    return (
        <Modal
            open={modal.transactions}
            options={{
                onCloseEnd: () =>
                    setModal((prev) => ({ ...prev, transactions: false }))
            }}
        >
            <Row>
                <Col s={12}>
                    <Table responsive striped>
                        <thead>
                            <tr>
                                {columns.map((column: string) => (
                                    <th key={column}>{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                tableRows
                            ) : (
                                <tr>
                                    <td colSpan={4}>There are no records</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Modal>
    );
}

export default TransactionHistory;
