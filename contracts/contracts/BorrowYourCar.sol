// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./MyERC20.sol";

contract BorrowYourCar is ERC721{

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint32 carTokenId, address borrower, uint256 startTime, uint256 duration);

    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information
    // ...
    // TODO add any variables if you want
    mapping(address => uint256[]) public owners;
    uint256[] public unborrowcars;
    uint256[] public borrowcars;
    MyERC20 public myERC20; // 彩票相关的代币合约

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    constructor(address tokenAddress)ERC721("BorrowYourCar", "BYC"){
        myERC20 = MyERC20(tokenAddress);
    }

    // ...
    // TODO add any logic if you want

    function newcar() external{
        bytes32 hash = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender));
        cars[uint256(hash)]=Car(msg.sender,address(0),0);
        owners[msg.sender].push(uint256(hash));
        unborrowcars.push(uint256(hash));
    }
    function getowner(uint256 id) external view returns(address) {
        return cars[id].owner;
    }
    function getownercar() external view returns(uint256[] memory) {
        return owners[msg.sender];
    }
    function getunborrowcar() external view returns(uint256[] memory) {
        return unborrowcars;
    }
    function getwhoborrowcar(uint256 id) external view returns(address) {
        return cars[id].borrower;
    }
    function getborrowtime(uint256 id) external view returns(uint256) {
        return cars[id].borrowUntil;
    }
    function getnowtime()external view returns(uint256){
        return block.timestamp;
    }
    function updatecar() external {
        for(uint256 i=0;i<borrowcars.length;i++){
            uint256 ca=borrowcars[i];
            if(cars[ca].borrowUntil<=block.timestamp&&i!=borrowcars.length-1){
                cars[ca].borrower=address(0);
                cars[ca].borrowUntil=0;
                borrowcars[i]=borrowcars[borrowcars.length-1];
                borrowcars.pop();
                unborrowcars.push(ca);

            }
            else if(cars[ca].borrowUntil<=block.timestamp&&i==borrowcars.length-1){
                cars[ca].borrower=address(0);
                cars[ca].borrowUntil=0;
                borrowcars.pop();
                unborrowcars.push(ca);
            }
        }
    }
    function borrowcar(uint256 id,uint256 time) external returns(bool) {
        require(cars[id].borrowUntil==0,"this car has been borrowed");
        require(cars[id].owner != msg.sender,"you can't borrow your own car");
        uint256 money=time;
        require(myERC20.balanceOf(msg.sender) >= money, "you don't have enough money");
        myERC20.transferFrom(msg.sender,cars[id].owner,money);
        cars[id].borrowUntil=block.timestamp+time;
        cars[id].borrower=msg.sender;
        borrowcars.push(id);
        for(uint256 i=0;i<unborrowcars.length;i++){
            if(unborrowcars[i]==id&&i!=unborrowcars.length-1){
                unborrowcars[i]=unborrowcars[unborrowcars.length-1];
                unborrowcars.pop();
                break;
            }
            else{
                if(unborrowcars[i]==id&&i==unborrowcars.length-1){
                    unborrowcars.pop();
                    break;
                }
            }
        }
        return true;
    }
}