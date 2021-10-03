const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

const web3 = new Web3(ganache.provider());

let accounts;
let lottery;
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' })

})

describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    });

    it('allows one account to enter', async() => {
        await lottery.methods.buyTicket().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getContestants().call({ from: accounts[0] })
        assert.equal(players[0], accounts[0])
    });

    it('allows multiple accounts to enter', async() => {
        const promise1 = lottery.methods.buyTicket().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const promise2 = lottery.methods.buyTicket().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const promise3 = lottery.methods.buyTicket().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        })
        await Promise.all([promise1, promise2, promise3]);

        const players = await lottery.methods.getContestants().call({ from: accounts[0] })
        assert.equal(players[0], accounts[0])
        assert.equal(players[1], accounts[1])
        assert.equal(players[2], accounts[2])
        assert.equal(players.length, 3)
    });

    it('enforces the minimum deposit requirement', async() => {
        try {
            await lottery.methods.buyTicket().send({
            from: accounts[0],
            value: 200
             });
             assert(false);
        } catch (err) {
            assert(err)
        }
    })

    it('only manager can call selectWinner', async() => {
        try {
            await lottery.methods.selectWinner().send({
                from: accounts[1]
            })
            assert(false);
        } catch (err) {
            assert(err)
        }
    });

    it('sends money to the winner and resets the players array', async() => {
        await lottery.methods.buyTicket().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether')
        })

        const account1BalanceBefore = await web3.eth.getBalance(accounts[1])
        await lottery.methods.selectWinner().send({
            from: accounts[0]
        });

        const account1BalanceAfter = await web3.eth.getBalance(accounts[1])
        const diff = account1BalanceAfter - account1BalanceBefore
        assert.equal(diff, web3.utils.toWei('2', 'ether'));

        const remainingContestants = await lottery.methods.getContestants().call({ from: accounts[0] })
        assert.equal(remainingContestants.length, 0)
    });
})