// use an existing account, or make an account

const contractBin = '0x7f600035f660115760006000526001601ff35b60016000526001601ff300000000600052630000001c6000f3';

require("log-timestamp");
const ethers = require("ethers");

const privateKey = ("8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63").toString('hex');
const wallet = new ethers.Wallet(privateKey);

const address = wallet.address;
console.log("Public Address:", address);

const httpsUrl = "http://localhost:8545";
console.log("HTTP Target", httpsUrl);

const init = async function () {
  const httpsProvider = new ethers.providers.JsonRpcProvider(httpsUrl);

  let nonce = await httpsProvider.getTransactionCount(address);
  console.log("Nonce:", nonce);

  let feeData = await httpsProvider.getFeeData();
  console.log("Fee Data:", feeData);

  const tx = {
    type: 2,
    nonce: nonce,
    to: null, // Address to send to
    maxPriorityFeePerGas: feeData['maxPriorityFeePerGas'], // Recommended maxPriorityFeePerGas
    maxFeePerGas: feeData['maxFeePerGas'], // Recommended maxFeePerGas
    data: contractBin,
    gasLimit: "0x24A22", // basic transaction costs exactly 21000
    chainId: 1337, // Ethereum network id
  };
  console.log("Transaction Data:", tx);

  const signedTx = await wallet.signTransaction(tx);
  console.log("Signed Transaction:", signedTx);

  const txHash = ethers.utils.keccak256(signedTx);
  console.log("Precomputed txHash:", txHash);
};

init().catch(console.log).then(() => process.exit(0));
