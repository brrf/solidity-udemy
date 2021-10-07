pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint amount;
        address recipient;
        bool complete;
        uint totalApprovals;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public contributors;
    Request[] public requests;
    uint private contributorCount;

    constructor(uint min, address creator) public {
        manager = creator;
        minimumContribution = min;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);

        contributors[msg.sender] = true;
        contributorCount++;
    }

    function createRequest(string description, uint amount, address recipient) public protected {
        Request memory request = Request(description, amount, recipient, false, 0);

        requests.push(request);
    }

    function approveRequest(uint requestIndex) public {
        Request storage request = requests[requestIndex];

        require(contributors[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.totalApprovals++;
        request.approvals[msg.sender] = true;
    }

    function finalizeRequest(uint requestIndex) public protected {
        Request storage request = requests[requestIndex];

        require(!request.complete);
        require(request.totalApprovals > (contributorCount / 2));

        request.recipient.transfer(request.amount);
        request.complete = true;
    }

    modifier protected() {
        require(msg.sender == manager);
        _;
    }
}

/*
TYPES

string
bool
int - can have bit specifier (int8, int16, int32....int256)
uint - only positive int. same thing with bit specifier.
fixed/ufixed - a float
address - has methods built in (eg. transfer)
reference types:
    fixed array - cant change in length --> int[3], bool[2]
    dynamic array - can change in length --> int[], bool[] **accessing an array (getter) you must pass the index you want. if you want the whole array, write a custom function that returns the data structure**.
    mapping - key: object pair mapping eg (mapping(int => bool)). all keys same type. all values same type.
    struct - javascript object basically.

    GOTCHA: nested dynamic arrays cannot be read from solidity. they can be written in solidity but the ABI/web3 library doesn't support it??
     -> strings in solidity are dynamic arrays. so you can't read an array of strings!

msg properties

data - could be contract source code, or arguments in a function call
gas - gas available for the tx
sender - address of sender
value - #eth sent in wei

*/

