// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MyERC20 is ERC20 {
    mapping(address => bool) claimedAirdropPlayerList;
    constructor() ERC20("MyERC20", "myERC20") {

    }
    function airdrop() external {
        require(claimedAirdropPlayerList[msg.sender] == false, "This user has claimed airdrop already");
        _mint(msg.sender, 10000000000 * (10 ** uint256(decimals())));
        claimedAirdropPlayerList[msg.sender] = true;
    }
}

