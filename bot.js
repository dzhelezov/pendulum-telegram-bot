const Helix = require("@helixnetwork/core");
const Bot = require('telegram-bot-api');
const conf = require('./conf.json');

const provider = conf.PROVIDER;
const token = conf.TOKEN;

let helix = Helix.composeAPI({
    provider: provider
  });

// Create a bot that uses 'polling' to fetch new updates
const bot = new Bot({
        token: token,
        updates: {
        	enabled: true
        }
});

bot.on('message', function (message) {
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
    bot.sendMessage(
      {
        chat_id: chatId,
        parse_mode: "Markdown",
        text: "*HLXtestBot* started" + "\u{1F916}"
      })
  }

  /**
  *
  * API Commands
  */

  if (command === '/getNodeInfo') {
      helix.getNodeInfo()
        .then(info => {
          bot.sendMessage(
            {
              chat_id: chatId,
              parse_mode: "Markdown",
              text: toCodeSnippet(JSON.stringify(info, null, 2), command)
            })
        })
        .then(() => {
          console.log("'/getNodeInfo' request performed.");
        })
        .catch(err => {
          bot.sendMessage(
            {
              chat_id: chatId,
              text: err
            })
        })
  }

  if (command === '/getTips') {
    helix.getTips()
        .then(tips => {
          if (tips.length > 25) {
            let tips = tips.slice(0,10);
          }
          bot.sendMessage(
            {
              chat_id: chatId,
              parse_mode: "Markdown",
              text: toCodeSnippet(tips, command)
            })
        })
        .then(() => {
          console.log("'/getTips' request performed.");
        })
        .catch(err => {
          bot.sendMessage(
            {
              chat_id: chatId,
              text: err
            })
        })
  }
  if (command === '/spam') {
    helix.prepareTransfers(conf.SEED, conf.TX_TEMPLATE)
        .then((HBytes) => {
          storedHBytes = HBytes;
          return helix.sendHBytes(storedHBytes, conf.DEPTH, conf.MWM);
        })
        .then(results => {
          bot.sendMessage(
            {
              chat_id: chatId,
              parse_mode: "Markdown",
              text: toCodeSnippet(JSON.stringify(results, null, 2), command)
            })
        })
        .then(() => {
          console.log("'/spam' request performed.");
        })
        .catch(err => {
          bot.sendMessage(
            {
              chat_id: chatId,
              text: err
            })
        })
  }
})

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
