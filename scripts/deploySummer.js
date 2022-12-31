const hre = require("hardhat")

async function main() {
    const smr = await hre.ethers.getContractFactory("SummerToken");
    const summer = await smr.deploy();

    await summer.deployed();

    console.log(
        `SummerToken deployed to ${summer.address}`
    )
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
