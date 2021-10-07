const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send( { from: accounts[0], gas: '1000000' });

    await factory.methods.createCampaign('100')
        .send({ from: accounts[0], gas: '1000000' });

    [campaignAddress] = await factory.methods.getCampaigns().call();
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    )
});

describe('Campaigns', () => {
    it('should have deployed the contracts', () => {
        assert.ok(factory.options.address)
        assert.ok(campaign.options.address)
    });

    it('the owner of a campaign is the address that called createCampaign on the factory', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('accepts contributions and record the contributor in the campaign', async() => {
        await campaign.methods.contribute()
            .send( { from: accounts[1], value: '200', gas: '1000000'})
        
        const contributorCount = await campaign.methods.contributorCount().call();
        const isContributor = await campaign.methods.contributors(accounts[1]).call();

        assert.equal(contributorCount, 1);
        assert(isContributor);
    });
    it('should enforce the minimum contribution', async() => {
        try {
            await campaign.methods.contribute()
                .send( { from: accounts[1], value: '1', gas: '1000000'})
            assert(false)
        } catch {
            assert(true)
        }
    });
    it('allows a manager to create a payment request', async() => {
        await campaign.methods.createRequest('the description', 1000, accounts[9])
            .send( { from: accounts[0], gas: '1000000'})
        const request = await campaign.methods.requests(0).call();
        
        assert.equal(request.description, 'the description');
        assert.equal(request.recipient, accounts[9])

    })
})