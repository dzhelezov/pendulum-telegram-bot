const composeAPI = require( '@helixnetwork/core').composeAPI;
const prepareForTangleWithLocalPow = require('@helixnetwork/pow').prepareForTangleWithLocalPow
let m = require('@helixnetwork/converter').asciiToTxHex
const { provider }  = require('./conf-env.js')

const helix = composeAPI({
    provider
})

// Depth or how far to go for tip selection entry point
const depth = 2

// Difficulty of Proof-of-Work required to attach transaction to tangle
// Minimum value on testnet is currently 2.
const minWeightMagnitude = 2

const getBalance = async (addrs) => {
    let balances = await helix.getBalances([addrs], 100)
    console.log(balances);

    return balances;
}

const send = async function(seed, snd, rcv, val) {

    let transfers = [{
        address: rcv,
        value: val, // 1Kh
        tag: m('loot'), // optional tag in hexString
        message: m("Enjoy free lunch")}
    ]

    let inputs = [
      {
        address: snd,
        security: 2,
      }
    ];
    try {
      const txs = await helix.prepareTransfers(seed, transfers, {"security":2})
      //console.log(`Tranasactinos: ${txs}`);
      const bundle = await helix.sendTransactionStrings(txs, depth, minWeightMagnitude)
      console.log(`Sent bundle: ${JSON.stringify(bundle)}`);

      return bundle[0].bundle;
    } catch (err) {
      console.error(`Failed to send: ${err}`);
      throw err;
    }
}

const nodeInfo = async (url) => {
    let provider = composeAPI({
        provider: url
    })

    let info = await provider.getNodeInfo();
    console.log(info);

    return {
      url,
      latestSolidRoundIndex: info.latestSolidRoundIndex,
      currentRoundIndex: info.currentRoundIndex,
      time: info.time,
      features: info.features
    }
}


module.exports = {
  send, getBalance, nodeInfo
}
