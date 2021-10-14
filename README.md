# RIF Relaying Services SDK sample dApp

This a basic sample dApp to showcase how users can submit transactions to the RSK blockchain paying a Relay Server for the transaction fees with tokens using RIF Relay SDK. You will need to connect to the dApp with Metamask but only for signing transactions with the account that controls your Smart Wallets.

See https://github.com/rsksmart/rif-relay for the RIF Relay project.


## Pre-Requisites

* RSKj Node Running
* [Enveloping Contracts](https://github.com/anarancio/rif-relay-contracts) deployed.
* Current Token Allowed
* [Enveloping Server](https://github.com/infuy/rif-relay-server) running.

## Running the sample dApp

To setup the dApp do this:

* Clone this repo 
* Run `npm i`

To run the sample dApp follow these steps:

1. Edit the sample dApp config file located in `.env` and add the contract addresses from the deployment executed in step 2 from Running a RelayServer. By default the project imports `.env` on the `npm start`. Look for these lines and modify them accordingly:
```
REACT_APP_CONTRACTS_RELAY_HUB=0xE0825f57Dd05Ef62FF731c27222A86E104CC4Cad
REACT_APP_CONTRACTS_DEPLOY_VERIFIER=0x1eD614cd3443EFd9c70F04b6d777aed947A4b0c4
REACT_APP_CONTRACTS_RELAY_VERIFIER=0x5159345aaB821172e795d56274D0f5FDFdC6aBD9
REACT_APP_CONTRACTS_SMART_WALLET_FACTORY=0x03F23ae1917722d5A27a2Ea0Bcc98725a2a2a49a
REACT_APP_CONTRACTS_SMART_WALLET=0x73ec81da0C72DD112e06c09A6ec03B5544d26F05
REACT_APP_CONTRACTS_RIF_TOKEN=0x726ECC75d5D51356AA4d0a5B648790cC345985ED
REACT_APP_CONTRACTS_TEST_RECIPIENT=0xCd5805d60Bbf9Afe69a394c2BDa10F6Dae2c39AF
REACT_APP_CONTRACTS_RELAY_WORKER=0x3d67f029f778a088904f12d030933967d220faa3

REACT_APP_ENVELOPING_CHAIN_ID=33
REACT_APP_ENVELOPING_GAS_PRICE_FACTOR_PERCENT=0
REACT_APP_ENVELOPING_RELAY_LOOKUP_WINDOW_BLOCKS=1e5
REACT_APP_ENVELOPING_PREFERRED_RELAYS=http://localhost:8090
```

2. Open a terminal in the sample dApp project root and execute

```
npm start
```

3. Ensure that MetaMask is configured to use the same network that you used to deploy the contracts (e.g. Regtest or Testnet).

4. Open a browser and navigate to http://localhost:3000

## Troubleshooting
### Error On Transaction Nonce
It may happen to you when using the RSK Regtest enviroment that an alert pop up may show indicating that the Transaction nonce is wrong. This is due to a MetaMask problem in which it saves the nonce locally and when you reset the chain the nonce is changed.

Solution:
1. Choose the account in which you have the problem
2. Enter Metamask `Advanced Settings`
3. Click on `Reset Account`. This will deleted all data from the account saved in metamask, and it will look it up again on the chain. Please note that it does not delete the account, only the info gathered from the current connected blockchain.

Read more about this on [this medium post](https://medium.com/singapore-blockchain-dapps/reset-metamask-nonce-766dd4c27ca8)
