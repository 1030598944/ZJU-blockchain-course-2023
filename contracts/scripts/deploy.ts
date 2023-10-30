import { ethers } from "hardhat";

async function main() {
  const MyERC20 = await ethers.getContractFactory("MyERC20");
  const myERC20 = await MyERC20.deploy();await myERC20.deployed();
  console.log(`MyERC20 deployed to  ${myERC20.address}`);

  const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  const borrowYourCar = await BorrowYourCar.deploy(myERC20.address);
  await borrowYourCar.deployed();

  console.log(`BorrowYourCar deployed to ${borrowYourCar.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});