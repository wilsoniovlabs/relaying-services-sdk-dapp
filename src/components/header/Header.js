import './Header.css';
//import { useState } from 'react';

function Header(props) {
  //const [status, setStatus] = useState('red');

  async function getStatusCode(){
    /*const status = await this.heavyTaskContract.methods.greenCode().call()
    if(status){
      setStatus('green');
    }
    else{
      setStatus('red');
    }*/
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
            <li><span id="eoa-address">{props.account || 'Address'} </span></li>
            <li><span>&nbsp;|&nbsp;</span></li>
            <li><span id="eoa-balance" className="eoa-balance" >{ props.balance || 'Balance'} </span></li>
            <li>
              <a className="waves-effect waves-light btn indigo accent-2" href="#!" onClick={props.connect}>
                Connect wallet
                <i className="material-icons right">account_balance_wallet</i>
              </a>
            </li>
            <a className="btn-floating btn-small waves-effect waves-light accent-2 tooltipped disabled" data-position="bottom" href="#!" onClick={getStatusCode}>
              <i className="material-icons">lens</i>
            </a>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
