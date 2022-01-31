import { useEffect, useState } from "react";
import Utils from "../Utils";

const getTokenBalance = async (address) => {
    try {
        const balance = parseFloat(Utils.fromWei(await Utils.tokenBalance(address))).toFixed(4);
        return balance;
    } catch (error) {
        console.error(error);
        return '0';
    }
}

const getPartnerBalances = async () => {
    const addresses = {
        worker: process.env.REACT_APP_CONTRACTS_RELAY_WORKER,
        collector: process.env.REACT_APP_CONTRACTS_COLLECTOR,
        relayOperator: process.env.REACT_APP_CONTRACTS_RELAY_OPERATOR,
        walletProvider: process.env.REACT_APP_CONTRACTS_WALLET_PROVIDER,
        liquidityProvider: process.env.REACT_APP_CONTRACTS_LIQUIDITY_PROVIDER,
        iovLabsRecipient: process.env.REACT_APP_CONTRACTS_IOVLABS_RECIPIENT,
    }
    const addressesArray = [
        addresses.worker,
        addresses.collector,
        addresses.relayOperator,
        addresses.walletProvider,
        addresses.liquidityProvider,
        addresses.iovLabsRecipient
    ];
    const newBalances = await Promise.all(addressesArray.map(address => getTokenBalance(address)))
    const newPartnerBalances = {
        worker: newBalances[0],
        collector: newBalances[1],
        relayOperator: newBalances[2],
        walletProvider: newBalances[3],
        liquidityProvider: newBalances[4],
        iovLabsRecipient: newBalances[5]
    }
    return newPartnerBalances;
}

function PartnerBalances() {
    const [balances, setBalances] = useState({
        worker: '0',
        relayOperator: '0',
        walletProvider: '0',
        liquidityProvider: '0',
        iovLabsRecipient: '0'
    });


    useEffect(() => {
        let isMounted = true;
        getPartnerBalances().then((balances) => {
            if (isMounted) {
                setBalances(balances);
            }
        })
        return () => {isMounted = false}
    }, [setBalances]);

    return (
        <ul className="collection with-header" style={{textAlign:'left'}}>
            <li className="collection-header"><h4>Balances</h4></li>
            <PartnerBalance label={'Worker'} balance={balances.worker}/>
            <PartnerBalance label={'Collector'} balance={balances.collector}/>
            <PartnerBalance label={'Relay Operator'} balance={balances.relayOperator}/>
            <PartnerBalance label={'Wallet Provider'} balance={balances.walletProvider}/>
            <PartnerBalance label={'Liquidity Provider'} balance={balances.liquidityProvider}/>
            <PartnerBalance label={'IOV Labs Recipient'} balance={balances.iovLabsRecipient}/>
        </ul>
    )
}

const PartnerBalance = ({ label, balance }) => (
    <li className="collection-item">
      <div>
        {label}
        <span className="secondary-content">
          <span id="worker-balance">{balance}</span> tRIF
        </span>
      </div>
    </li>
  );

export default PartnerBalances