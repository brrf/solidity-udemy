const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

const eth = new Web3(ganache.provider()).eth;

let defaultSender;
let inbox;
beforeEach(async () => {
    const accounts = await eth.getAccounts();
    defaultSender = { from: accounts[0], gas: '1000000' };
    
    inbox = await new eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Hi there!'] })
        .send(defaultSender)

})

describe('Inbox', () => {
    it('reads the message', async () =>{
        assert.equal(await inbox.methods.message().call(), 'Hi there!')
    })

    it('can update its message', async () => {
        const newmessage = 'wayho'
        await inbox.methods.setMessage(newmessage).send(defaultSender)
        assert.equal(await inbox.methods.message().call(), newmessage)
    })
})