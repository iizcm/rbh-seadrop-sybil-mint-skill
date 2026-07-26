---
name: rbh-seadrop-sybil-mint
description: "Mint NFT on any EVM chain (Robinhood Chain RBH, Ethereum L1, etc.) via SeaDrop public mint using sybil wallets. Use when user wants to mint their NFT project across many wallets, or mentions RobinGeckos, HoodPunks, SeaDrop, mintPublic, or sybil mint. CRITICAL: the correct call is SeaDrop.mintPublic, NOT mintSeaDrop on the NFT contract. USER ABANDONED RBH mid-2026 — new projects target ETHEREUM L1 (different RPC + different SeaDrop address per chain; never hardcode RBH's)."
---

# RBH / EVM SeaDrop Sybil Mint

## TL;DR
Mint lewat **SeaDrop proxy**, bukan langsung ke NFT contract.
- TO = SeaDrop address — **per-chain, fetch via `getAllowedSeaDrop(nft)` or decode from a working tx**. RBH default `0x00005EA00ac477b1030ce78506496e8c2de24bf5`; **ETH L1 has a DIFFERENT address — never hardcode RBH's** (user moved HoodPunks 3D to ETH L1).
- selector `0x161ac21f` = `mintPublic(address nftContract, address feeRecipient, address minterIfNotPayer, uint256 quantity)`
- Tiap sub **self-pay** (payer == minter). Primary TIDAK bisa jadi payer (revert: payer not allowed).

## Steps
1. **Verify contract type**: `getsourcecode` di blockscout. Harus `ERC721SeaDropCloneable`.
2. **Get SeaDrop addr**: cek `allowedSeaDrop` via `getAllowedSeaDrop(nft)`, atau default RBH `0x00005EA0...24bf5`.
3. **Get feeRecipient**: decode tx working user / atau `0x0000a26b00c1f0df003000390027140000faa719` (RBH OS fee).
4. **Check public drop active**: `getPublicDrop(nft)` -> `mintable=true`, cek startTime/endTime/price.
5. **Decode user tx if given**: pakai `eth_getTransactionByHash` via RPC node (bukan blockscout API yg sering null). Cek `to` = SeaDrop.
6. **Fund + mint**: pakai script `fund_mint.js` — topup tiap sub dari primary, lalu sub self-mint qty (default 3).

## Script
Self-contained: `scripts/fund_mint.js` (copy ke VPS). Arg: `[count] [qty] [startIdx] [priceEth]`.
Env: `NFT` (contract, default RG), `RPC`, `SEADROP`, `FEE`.
- topup dr primary -> sub (mintGas + price×qty + 2 gwei buffer), lalu sub self-mint (self-pay).
- freemint: cost ~0.000009 ETH/mint. Paid: + price×qty. Multi-chain: set RPC + SEADROP.
- See `references/multi-chain.md` for per-chain SeaDrop addr + prompt template.

## Pitfalls (jangan ulang)
- `mintSeaDrop(to,qty)` di NFT contract -> revert silent, RPC balikin status=1 tapi balance 0 (bohong).
- Primary jadi payer di `mintPublic` -> revert (payer not in allowlist).
- GasPrice pas = bisa `< baseFee` (naik tiap block) -> +10% buffer wajib.
- Playwright injected `window.ethereum` + localhost HTTP server -> OpenSea CSP block + "User closed modal". Jangan pake UI utk mint massal; pakai raw call ke SeaDrop.
- Blockscout `eth_getTransactionByHash` via API sering null -> pakai RPC node langsung.
- **VERIFY DROP CONFIG BEFORE MINT (critical):** contract `ERC721SeaDropCloneable` bisa deploy tapi **SeaDrop blm di-setup** -> `getAllowedSeaDrop()` & `getPublicDrop(SD)` **revert** (bukan return false, tapi revert). Symptom: `mintSeaDrop` revert, `mintPublic` juga gagal. Artinya owner (lu) belum jalanin `updatePublicDrop`/`multiConfigure` di SeaDrop proxy. FIX: dari wallet owner, config dulu (set freemint, maxWallet, startTime=now, feeRecipient, allowedSeaDrop=[SD]) BARU gaskeun mint. Pre-mint check: `getAllowedSeaDrop()` return `[SD]`, `getPublicDrop(SD)[0]` (mintable)=true.
- SeaDrop addr RBH hrs **lowercase** pas di-pass ke ethers (`0x00005ea0...` bukan `0x00005EA0...`) -> kalau ada huruf besar = checksum error.
- **SeaDrop RBH proxy may SILENTLY REJECT owner config tx** (`updatePublicDrop`, `updateAllowedFeeRecipients`, `multiConfigure`) with empty `revert` even though `updateAllowedSeaDrop` (NFT-side) SUCCEEDS. Symptom seen on HoodPunks 3D (RBH, owner=primary): `getAllowedSeaDrop()` STILL reverts after `updateAllowedSeaDrop` confirmed, `getPublicDrop(SD)` reverts, `mintSeaDrop` reverts, `mintable=false`. Root cause: the SeaDrop address wired into `0x00005EA0...24bf5` is likely NOT the valid SeaDrop for RBH (wrong chain / clone mismatch) — owner-side config calls hit the proxy but it rejects. **Fix path: do NOT burn gas retrying config.** Either (a) find the CORRECT SeaDrop RBH address from OpenSea docs / deploy metadata, or (b) configure the drop via the **OpenSea creator dashboard UI** (it sets the real drop correctly), or (c) redeploy the contract wired to the correct SeaDrop. Until `getAllowedSeaDrop()` returns `[SD]` and `getPublicDrop(SD).mintable==true`, minting is impossible on that contract.

## Verify
- `balanceOf(sub)` per wallet == qty.
- Receipt logs: `Transfer` ke sub (tokenId naik).
- Cek totalSupply naik.

## What to ask user for a NEW project
1. NFT contract address
2. Network (RBH / Eth L1 / lain) — tentukan RPC + SeaDrop addr
3. Working tx hash (paling cepat) ATAU bilang "pake cara SeaDrop spt RobinGeckos"
4. feeRecipient (default RBH OS fee, atau 0x... kalau deploy sendiri)
5. Mint price: freemint atau `0.0X ETH` (paid -> topup = (price×qty+gas)×count)
6. Pastiin public drop masih aktif (belum end time)
7. Primary funded cukup (freemint: count×qty×~0.00001 ETH; paid: (price×qty+gas)×count)

## PROMPT TEMPLATE (user-built — use verbatim for new projects)
```
Mint project baru. Contract 0x... . Pake cara SeaDrop spt RobinGeckos.
[Network: RBH|Eth L1|dst]. feeRecipient default/0x...
[Mint price 0.0X ETH / kosong=freemint]. Primary topup X ETH.
Gaskeun [100] sub qty[3].
```
Kata "cara SeaDrop spt RobinGeckos" = agent langsung pakai `mintPublic` ke SeaDrop (gak investigasi ulang). Kasih tx working atau feeRecipient kalau beda dari default.

## WL HOLDER SCAN (pre-mint / gated drop)
For building an allowlist from holders of another NFT: use `holder_scan.py` (from nft-bulk-generation skill). For large scans, route through proxies from `proxy_scraper.py` output (`results/<ts>/`) to avoid IP bans. User confirmed proxy use "untuk ngumpulin holder NFT buat WL list".
