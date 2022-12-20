# Uniswap 

## Run tests

1. In the file .env specify your alchemy url
```
ALCHEMY_URL=<URL>
```
2. run tests
```
npx hardhat test
```

3. Output
``` 
SummerToken deployed to 0xe044814c9eD1e6442Af956a817c161192cBaE98F
WinterToken deployed to 0xaB837301d12cDc4b97f1E910FC56C9179894d9cf
SummerToken pool deployed to 0xD615cE765658eF240b169b5c5988e0d9E8d3CbA9
tokens before adding liquidity - summer:  50000 winter:  50000
tokens after adding liquidity - summer:  40005 winter:  40005
liquidity in pool:  10000498
amount before swap - summer:  40005 winter:  40005
swap 10000 summer tokens to second winter
amount after swap - summer:  30005 winter:  49990
    ✔ process (9511ms)

  1 passing (10s)
```
