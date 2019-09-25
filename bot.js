const Helix = require("@helixnetwork/core");
const Bot = require('telegram-bot-api');
const conf = require('./conf.json');
const { token, provider }  = require('./conf-env.js')

//edit .env file or provide from cli
//const provider = process.env.HELIX_PROVIDER;
//const token = process.env.BOT_TOKEN;

let helix = Helix.composeAPI({
    provider: provider
});

const bot = new Bot({
        token: token
});

const txInfoRegex = '/getTxInfo (.*)$/'

module.exports = {
    handleBotMessage: function (message) {
      const chatId = message.chat.id;
      const command = message.text.toString();

      console.log(command);

      bot.sendMessage(
      {
          chat_id: chatId,
          text: message.text + ' request received.'
      })

      /**
      *
      * help Commands
      */

      if (command === '/start') {
          bot.sendMessage({
              chat_id: chatId,
              parse_mode: "Markdown",
              text: "*HLXtestBot* started" + "\u{1F916}"
          })
      }

      /**
      *
      * API Commands
      */
      if (command.indexOf("getTxInfo") !== -1) {
          let parse = command.match('/getTxInfo\s*([A-Fa-f0-9]+)/$')
          helix.getTransactionObjects([parse[0]])
            .then(txs => {
              bot.sendMessage({
                 chat_id: chatId,
                 parse_mode: "Markdown",
                 text: toCodeSnippet(JSON.stringify(txs, null, 2))
              })
            })
            .catch(err => {
                console.log(err)
                bot.sentMessage({
                  chat_id: chatId,
                  text: "Failed to get Tx info by the hash. \
                         Please check the syntax and try again"
                })
            })
      }

      if (command === '/getNodeInfo') {
          helix.getNodeInfo()
          .then(info => {
              bot.sendMessage({
                chat_id: chatId,
                parse_mode: "Markdown",
                text: toCodeSnippet(JSON.stringify(info, null, 2), command)
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

function toCodeSnippet(str, cmd) {
  return "``` " + str + "\n ```"
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
