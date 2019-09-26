const Helix = require("@helixnetwork/core");
const Bot = require('telegram-bot-api');
const { token, provider }  = require('./conf-env.js')

//edit .env file or provide from cli
//const provider = process.env.HELIX_PROVIDER;
//const token = process.env.BOT_TOKEN;

const helix = Helix.composeAPI({
    provider: provider
});

const bot = new Bot({
    token: token
});


const TX_INFO_REGEX = /\/getTxInfo\s*([A-Fa-f0-9]+)/g

module.exports = {
    handleBotMessage: async function (message) {
      console.log("Handling message");
      console.log(message);

      //if (message.date < Math.floor(Date.now()/1000) - 5) {
      //  console.log("The message is > 5 secs old, dropping")
      //  console.log(Math.floor(Date.now()/1000))
      //  return
      //}

      let chatId = message.chat.id;
      let command = message.text.toString();

      let showError =  (err, err_text) => {
        console.log(err)
        bot.sendMessage({
          chat_id: chatId,
          parse_mode: "Markdown",
          text: err_text
        })
      }

      console.log(command);

      /**
      *
      * help Commands
      */

      if (command === '/start') {
          bot.sendMessage({
              chat_id: chatId,
              parse_mode: "Markdown",
              text: "*HLXtestBot* started" + "\u{1F916}\n" + usageString()
          })
          return
      }

      /**
      *
      * API Commands
      */
      if (command.indexOf("/getTxInfo") !== -1) {
          console.log("getTxInfo: " + command)


          let parse = TX_INFO_REGEX.exec(command)
          console.log(parse)

          if (parse === null) {
             showError("Parse error: " + command,
             `Failed to get Tx Info from:\"${command}\"\nUsage: getTxInfo <tx hash>`)
              return
          }

          let tx = parse[1]
          console.log("Transaction hash: " + tx)
          //let info = await helix.getNodeInfo();

          confirm(tx)
            .then(incl => {
              console.log(incl)
              bot.sendMessage({
                chat_id: chatId,
                    parse_mode: "Markdown",
                    text: incl[0] ? `*${tx}* is confirmed! ` : `*${tx}* is not confirmed`
              })
            })
            .catch(err => {
                showError("Error: " + err,
                  `Failed to get Tx of *${tx}* \n${err}`)
            })
      }

      if (command === '/getNodeInfo') {
          console.log("Requesting node info")
          helix.getNodeInfo()
          .then(info => {
              console.log("Info done")
              bot.sendMessage({
                chat_id: chatId,
                parse_mode: "Markdown",
                text: toCodeSnippet(`Provider: ${provider}\n`
                  + JSON.stringify(info, null, 2))
              })
          })
          .then(() => {
                console.log("'/getNodeInfo' request performed.");
          })
          .catch(err => {
              bot.sendMessage({
                chat_id: chatId,
                text: err
              })
          })
      }

   }
}

/**
*
* Helper Functions
*/

function usageString() {
  return "/getNodeInfo : request info about the current provider\n" +
         "/getTxInfo <hash> : request confirmation status of a transcation"
}

function toCodeSnippet(str, cmd) {
  return "``` " + str + "\n ```"
}

async function confirm(txs){
  let info = await helix.getNodeInfo();
  console.log(info);
  try {
    let incl = await helix.getInclusionStates([txs],[info.latestSolidRoundHash])
    console.log(incl);
    return incl;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

/*
function printUsage(command) {
  bot.sendMessage("Request: " + command + " sent to: hlxtestBot");
  bot.sendMessage("Available Commands: " + '\n' +
                  "/getNodeInfo" + '\n' +
                  "/getTips" + '\n');
}

function parseNodeInfo(lssm, lm, t, n) {
  return "Latest Solid Subtangle Milestone Index: " + lssm + '\n' +
         "Latest Milestone Index: " + lm + '\n' +
         "Tips: " + t + '\n' +
         "Neighbors: " + n + '\n';
}
*/
