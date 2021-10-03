const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
require('dotenv').config()

const provider = new HDWalletProvider(
    process.env.SEED,
    'https://rinkeby.infura.io/v3/4e400ba27c504de585c4782b1bd50931'
);
const eth = new Web3(provider).eth;


async function deploy () {
    const accounts = await eth.getAccounts();
    console.log(`Attempting deploy from account: ${accounts[0]}`)

    const result = await new eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', gasPrice: '5000000000', from: accounts[0] })

    console.log(`Contract deployed to: ${result.options.address}`);
}

deploy();