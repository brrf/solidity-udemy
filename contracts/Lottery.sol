pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public contestants;

    constructor() public {
        manager = msg.sender;
    }

    function buyTicket() public payable {
        require(msg.value > 0.01 ether);
        
        contestants.push(msg.sender);
    }

    function selectWinner() public managerOnly {
        uint winnerIndex = rng() % contestants.length;
        contestants[winnerIndex].transfer(this.balance);

        contestants = new address[](0);
    }
    
    function rng() private view returns (uint) {
       return uint(sha3(block.difficulty, now, contestants));
    }

    function getContestants() public view returns (address[]) {
        return contestants;
    }

    modifier managerOnly() {
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

