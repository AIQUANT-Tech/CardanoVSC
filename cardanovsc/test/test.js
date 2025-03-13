const { Lucid, Blockfrost } = require("lucid-cardano");

const API_KEY = "preprod8Z6zi3DPfkbN32xpZPmzBUGaMLobSEU0"; // Replace with your actual Blockfrost API key
const NETWORK = "Preprod"; // Use "Mainnet", "Preprod", or "Preview"

async function initializeLucid() {
  const lucid = await Lucid.new(
    new Blockfrost(`https://cardano-${NETWORK}.blockfrost.io/api/v0`, API_KEY),
    NETWORK
  );

  console.log("Lucid initialized!");
  return lucid;
}

initializeLucid().then((lucid) => {
  // Now you can use `lucid` to interact with the Cardano blockchain
  console.log(lucid); 
});
