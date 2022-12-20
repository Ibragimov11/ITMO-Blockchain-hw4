require('dotenv').config()

const hre = require("hardhat");
const {encodePriceSqrt} = require("../util");
const {getPoolData} = require("../util");
const {ethers} = require("hardhat");
const {Contract} = require("ethers")
const {Token} = require('@uniswap/sdk-core')

const {Pool, Position, nearestUsableTick} = require('@uniswap/v3-sdk')

const {abi: IUniswapV3PoolABI} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const {abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const {abi: INonfungiblePositionManagerABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json')
const {abi: FactoryABI} = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json')

const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
const managerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"

const provider = new ethers.providers.JsonRpcProvider("YOUR_ALCHEMY_URL")

describe("Uniswap: SummerToken and WinterToken", function () {
    it("process", async function () {
        let deployer = (await hre.ethers.getSigners())[0]

        const smr = await hre.ethers.getContractFactory("SummerToken", deployer);
        let summer = await smr.deploy();

        await summer.deployed();

        console.log(
            `SummerToken deployed to ${summer.address}`
        );

        const wnt = await hre.ethers.getContractFactory("WinterToken", deployer);
        let winter = await wnt.deploy();

        await winter.deployed();

        console.log(`WinterToken deployed to ${winter.address}`);

        const factoryContract = new Contract(factoryAddress, FactoryABI, provider)
        const nonfungiblePositionManager = new Contract(managerAddress, INonfungiblePositionManagerABI, provider)

        await nonfungiblePositionManager.connect(deployer).createAndInitializePoolIfNecessary(winter.address, summer.address, 500,
            encodePriceSqrt(1, 1), {gasLimit: 5000000})

        const fsPoolAddress = await factoryContract.connect(deployer).getPool(winter.address, summer.address, 500)
        console.log("SummerToken pool deployed to", fsPoolAddress)

        let fsPoolContract = new Contract(fsPoolAddress, IUniswapV3PoolABI, deployer)

        const data = await getPoolData(fsPoolContract)

        await summer.connect(deployer).approve(managerAddress, ethers.utils.parseEther('10000000000000000'))
        await winter.connect(deployer).approve(managerAddress, ethers.utils.parseEther('10000000000000000'))

        const SummerToken = new Token(1, summer.address, 1, 'SMR', 'SummerToken')
        const WinterToken = new Token(1, winter.address, 1, 'WNT', 'WinterToken')

        const pool = new Pool(WinterToken, SummerToken, data.fee, data.sqrtPriceX96.toString(), data.liquidity.toString(), data.tick)

        const position = new Position({
            pool: pool, liquidity: '10000000',
            tickLower: nearestUsableTick(data.tick - data.tickSpacing * 2, data.tickSpacing),
            tickUpper: nearestUsableTick(data.tick + data.tickSpacing * 2, data.tickSpacing)
        })

        const {amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

        let params = {
            token0: winter.address,
            token1: summer.address,
            fee: data.fee,
            tickLower: nearestUsableTick(data.tick - data.tickSpacing * 2, data.tickSpacing),
            tickUpper: nearestUsableTick(data.tick + data.tickSpacing * 2, data.tickSpacing),
            amount0Desired: amount0Desired.toString(),
            amount1Desired: amount1Desired.toString(),
            amount0Min: 0,
            amount1Min: 0,
            recipient: deployer.address,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10)
        }

        console.log("tokens before adding liquidity - summer: ", (await summer.balanceOf(deployer.address)).toString(),
            "winter: ", (await winter.balanceOf(deployer.address)).toString())
        
        await nonfungiblePositionManager.connect(deployer).mint(params, {gasLimit: '1000000'})
                
        console.log("tokens after adding liquidity - summer: ", (await summer.balanceOf(deployer.address)).toString(),
            "winter: ", (await winter.balanceOf(deployer.address)).toString())

        const poolData = await getPoolData(fsPoolContract)
        console.log("liquidity in pool: ", poolData.liquidity.toString())

        const swapRouterContract = new Contract(routerAddress, SwapRouterABI, provider)

        await summer.connect(deployer).approve(routerAddress, (10000000).toString())

        params = {
            tokenIn: summer.address, tokenOut: winter.address, fee: poolData.fee, recipient: deployer.address,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10), amountIn: 10000,
            amountOutMinimum: 0, sqrtPriceLimitX96: 0,
        }

        console.log("amount before swap - summer: ", (await summer.balanceOf(deployer.address)).toString(),
            "winter: ", (await winter.balanceOf(deployer.address)).toString())
        console.log("swap 10000 summer tokens to second winter")
        
        await swapRouterContract.connect(deployer).exactInputSingle(params, {gasLimit: ethers.utils.hexlify(1000000)})
        
        console.log("amount after swap - summer: ", (await summer.balanceOf(deployer.address)).toString(),
            "winter: ", (await winter.balanceOf(deployer.address)).toString())
    })
})