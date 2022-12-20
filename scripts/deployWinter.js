const hre = require("hardhat")

async function main() {
    const wnt = await hre.ethers.getContractFactory("Winter");
    const winter = await smr.deploy();

    await winter.deployed();

    console.log(
        `WinterToken deployed to ${winter.address}`
    )
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
