# RIF Relaying Services SDK sample dApp

This a basic sample dApp to showcase how users can submit transactions to the RSK blockchain paying a RelayServer for the transaction fees with tokens. You will need to connect to the dApp with Metamask but only for signing transactions with the account that controls your Smart Wallets.

See https://github.com/rsksmart/enveloping for the RIF Enveloping project.

## Using the dApp

## Pre-Requisites

* RSKj Node Running
* [Enveloping Contracts](https://github.com/anarancio/rif-relay-contracts) deployed.
* [Enveloping Server](https://github.com/infuy/rif-relay-server) running.

## Running the sample dApp

To setup the dApp do this:

* Clone this repo 
* Run `npm i`

To run the sample dApp follow these steps:

1. Edit the sample dApp config file located in `.env` and add the contract addresses from the deployment executed in step 2 from Running a RelayServer. By default the project imports `.env` on the `npm start`. Look for these lines and modify them accordingly:


2. Open a terminal in the sample dApp project root and execute

```
npm start
```

3. Ensure that MetaMask is configured to use the same network that you used to deploy the contracts (e.g. Regtest or Testnet).

4. Open a browser and navigate to http://localhost:3000

5. If you are running an RSKj node in Regtest you will need to register the Token used in the demo with the Relay and Deploy verifiers. To achieve this select in Metamask an account with funds, connect Metamask to the dApp, open the developer console in the browser and execute the following command:

```javascript
await App.acceptNewToken()
```

## Troubleshooting
### Error On Transaction Nonce
It may happen to you when using the RSK Regtest enviroment that an alert pop up may show indicating that the Transaction nonce is wrong. This is due to a MetaMask problem in which it saves the nonce locally and when you reset the chain the nonce is changed.

Solution:
1. Choose the account in which you have the problem
2. Enter Metamask `Advanced Settings`
3. Click on `Reset Account`. This will deleted all data from the account saved in metamask, and it will look it up again on the chain. Please note that it does not delete the account, only the info gathered from the current connected blockchain.

Read more about this on [this medium post](https://medium.com/singapore-blockchain-dapps/reset-metamask-nonce-766dd4c27ca8)
