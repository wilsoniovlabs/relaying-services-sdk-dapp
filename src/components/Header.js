import { useEffect, useState } from 'react';
import Utils from '../Utils';
import './Header.css';
//import { useState } from 'react';

const ethereum = window.ethereum;

function Header(props) {
  const {
    account
    , setAccount
    , setConnect
    , connected
  } = props;

  //const [status, setStatus] = useState('red');
  const [balance, setBalance] = useState();

  useEffect(() => {
    if(!account){
      return;
    }
    (async () => {
      const balance = await Utils.getBalance(account);
      const balanceConverted = Utils.fromWei(balance);
      setBalance(balanceConverted + ' RBTC  ');
    })();
  }, [account])

  async function connectToMetamask() {
    let isConnected = false;
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      ethereum.on('accountsChanged', async (/*accounts*/) => {
        await refreshAccount();
      });
      isConnected = true;
    } catch (error) {
      console.error(error);
    }
    finally {
      setConnect(isConnected);
      return isConnected
    }
  }

  async function refreshAccount() {
    const accounts = await Utils.getAccounts();

    const account = accounts[0];
    setAccount(account);
  }

  async function connect() {
    try {
      let isConnected = false;
      if (!connected) {
        isConnected = await connectToMetamask()
      }

      if (isConnected) {
        await refreshAccount();
      }
      else {
        console.warn("Unable to connect to Metamask");
        setConnect(isConnected);
      }

    } catch (error) {
      console.log(error);
      console.warn('User denied account access');
    }
  }
  return (
    <header>
      <nav>
        <div className="nav-wrapper gradient">
          <div className="brand-logo left">
            <img className="responsive-img" alt="logo" src="images/rif_logo.png" onClick={props.refreshBalances} />
            <span ><b>rif Enveloping</b></span>
          </div>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><span id="eoa-address">{account || 'Address'} </span></li>
            <li><span>&nbsp;|&nbsp;</span></li>
            <li><span id="eoa-balance" className="eoa-balance" >{balance || 'Balance'} </span></li>
            <li>
              <a className="waves-effect waves-light btn indigo accent-2" href="#!" onClick={connect}>
                Connect wallet
                <i className="material-icons right">account_balance_wallet</i>
              </a>
            </li>
            <a className="btn-floating btn-small waves-effect waves-light accent-2 tooltipped disabled" data-position="bottom" href="#!">
              <i className="material-icons">lens</i>
            </a>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
