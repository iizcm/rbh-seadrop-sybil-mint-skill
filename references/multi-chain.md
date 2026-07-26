# Multi-chain & paid mint reference

## Network differences (CRITICAL)
SeaDrop address is DIFFERENT per chain. Never hardcode the RBH one.
- RBH:    SeaDrop = 0x00005EA00ac477b1030ce78506496e8c2de24bf5, RPC = https://rpc.mainnet.chain.robinhood.com/
- Eth L1: fetch via `getAllowedSeaDrop(nft)` atau decode tx working user (`to` = SeaDrop). Pakai Alchemy/Infura RPC.
- Base/Polygon/Arb/dst: sama — fetch per chain, jangan asumsi.

Explorer:
- RBH -> robinhoodchain.blockscout.com
- L1  -> etherscan.io

## Cost scaling
| | RBH | Eth L1 |
| gas/mint (freemint) | ~0.000009 ETH (~$0.002) | ~$1-5 (100-1000x) |
| 100 sub qty3 freemint | ~0.0009 ETH | jarang ada freemint di L1 |
| 100 sub qty3 @ 0.001 ETH | 0.3 ETH + gas | 0.3 ETH + gas (gas dominate di L1) |

Paid mint: topup = (price × qty + gas) × count. Di L1 gas dominate.

## Prompt template (user -> agent)
"Mint project baru. Contract 0x.... Network [RBH|Eth L1|...]. Pake cara SeaDrop spt RobinGeckos.
feeRecipient [default/tx 0x...]. [Mint price 0.0X ETH / freemint]. Primary topup X ETH. Gaskeun [100] sub qty[3]."

## feeRecipient
= alamat yg terima fee platform (OpenSea). Di tx working RG = 0x0000a26b00c1f0df003000390027140000faa719 (RBH OS fee).
Default: decode dr tx working user. Kalau deploy sendiri, lu set sendiri.

## Running the script
```
# freemint RBH (default)
node scripts/fund_mint.js 10 3 0
# paid mint, batch ke-2
NFT=0x... RPC=https://... SEADROP=0x... node scripts/fund_mint.js 10 3 10 0.001
# multi-chain L1
NFT=0x... RPC=https://eth-mainnet.alchemyapi.io/v2/KEY SEADROP=0x... FEE=0x... node scripts/fund_mint.js 100 3 0 0.001
```
