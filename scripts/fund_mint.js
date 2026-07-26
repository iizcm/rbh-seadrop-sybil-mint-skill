// fund_mint.js — RBH/EVM SeaDrop sybil mint (self-pay per sub)
// Usage: node fund_mint.js [count] [qty] [startIdx] [priceEth]
//   count    = number of subs to mint (default 10)
//   qty      = quantity per sub (default 3)
//   startIdx = starting sub index (default 0) — for batching 10-by-10
//   priceEth = mint price per NFT in ETH (default 0 = freemint)
// Env: NFT (contract, default RG), RPC, SEADROP, FEE
const { ethers } = require("ethers");
const d = require("/root/wallet/sybil_wallets.json");

const RPC = process.env.RPC || "https://rpc.mainnet.chain.robinhood.com/";
const C   = process.env.NFT || "0x3bbb4359c6147ca6881745903c439c601d47ebbd";
const SD  = process.env.SEADROP || "0x00005ea00ac477b1030ce78506496e8c2de24bf5";
const FEE = process.env.FEE || "0x0000a26b00c1f0df003000390027140000faa719";
const PROV = new ethers.JsonRpcProvider(RPC);
const I = new ethers.Interface(["function mintPublic(address nftContract, address feeRecipient, address minterIfNotPayer, uint256 quantity)"]);

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function fundAndMint(idx, qty, priceWei){
  const sub = d.subs[idx];
  const w = new ethers.Wallet(sub.pk, PROV);
  const fee = await PROV.getFeeData();
  const gp = (fee.gasPrice || 75000000n) * 110n / 100n; // +10% buffer vs baseFee
  const mintGas = 150000n * gp;
  const need = mintGas + priceWei*qty + 2000000000n; // +2 gwei buffer

  const primary = new ethers.Wallet(d.primary.pk, PROV);
  const pBal = await PROV.getBalance(primary.address);
  if (pBal < need + 21000n*gp) {
    console.log(`S${idx} SKIP: primary kurang (${ethers.formatEther(pBal)})`);
    return false;
  }
  const fTx = await primary.sendTransaction({ to: sub.address, value: need, gasPrice: gp, gasLimit: 21000 });
  await fTx.wait();
  await sleep(500);

  const sBal = await PROV.getBalance(sub.address);
  if (sBal < mintGas + priceWei*qty) { console.log(`S${idx} no fund`); return false; }
  const data = I.encodeFunctionData("mintPublic", [C, FEE, sub.address, qty]);
  try {
    const tx = await w.sendTransaction({ to: SD, data, value: priceWei*qty, gasPrice: gp, gasLimit: 150000 });
    await tx.wait();
    const bal = await new ethers.Contract(C, ["function balanceOf(address) view returns (uint256)"], PROV).balanceOf(sub.address);
    console.log(`S${idx} ${sub.address.slice(0,8)} qty${qty} NFT=${bal} tx ${tx.hash.slice(0,10)}`);
    return true;
  } catch(e){ console.log(`S${idx} FAIL ${e.shortMessage||e.message.slice(0,50)}`); return false; }
  await sleep(800);
}

(async () => {
  const count = parseInt(process.argv[2]||"10");
  const qty = parseInt(process.argv[3]||"3");
  const start = parseInt(process.argv[4]||"0");
  const price = parseFloat(process.argv[5]||"0");
  const priceWei = ethers.parseEther(price.toString());
  console.log(`FUND+MINT ${count} subs from idx ${start}, qty=${qty}, price=${price} ETH`);
  let ok=0;
  for (let i=start;i<start+count;i++){ if (await fundAndMint(i, qty, priceWei)) ok++; }
  console.log(`DONE ${ok}/${count}`);
  const pFin = await PROV.getBalance(d.primary.address);
  console.log("primary sisa:", ethers.formatEther(pFin));
})();
