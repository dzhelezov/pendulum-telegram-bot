const Helix = require("@helixnetwork/core");
const Bot = require('telegram-bot-api');
const { token, provider, seed }  = require('./conf-env.js')

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
const NODE_INFO_REGEX = /\/getNodeInfo\s*([\/\.:A-Za-z0-9]+)/g


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
      * TODO: refactor with a command map
      */

      if (command === '/start') {
          startDialog(message)
      } else  if (command.indexOf("/giveMeMoney") !==  -1) {
          sendMoney(message)
      } else if (command.indexOf("/getTxInfo") !== -1) {
          getTxInfo(message)
      } else if (command.indexOf('/getNodeInfo') !== -1) {
          getNodeInfo(message)
      } else if (command.indexOf('/pleaseHelpMe') !== -1) {
          getHelpInfo(message)
      }

   }
}

function sendMoney(context) {
  context.error = {
    log: "Not implemented",
    text: 'Sorry, the free lunch option is not implemented yet, but we are on it.\n' +
          'Meanwhile, you may ask for some HLX in our [discord channel](https://discord.gg/MN6e6Je)'
  }

  sendError(context)

}

function getHelpInfo(context) {
  let chatId = context.chat.id;
  bot.sendMessage({
    chat_id: chatId,
    parse_mode: "Markdown",
    text: 'We are really sorry to hear something went astray.\n' +
          'Please tell us about your issue [here](https://discord.gg/MN6e6Je)' +
          ' and we will do our best. Yours truly, Helix \u{1F916}.'

  })
}

function sendError(context) {
  let chatId = context.chat.id;
  let error = context.error.log;
  let errorText = context.error.text;

  console.log(error)
  bot.sendMessage({
    chat_id: chatId,
    parse_mode: "Markdown",
    text: errorText
  })

}

function startDialog(context) {
  let chatId = context.chat.id;
  bot.sendMessage({
      chat_id: chatId,
      parse_mode: "Markdown",
      text: "*HLXtestBot* started" + "\u{1F916}\n" + usageString()
  })
  return
}

function getTxInfo(context) {
  let command = context.text.toString();
  let chatId = context.chat.id;
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

function getNodeInfo(context) {
  let chatId = context.chat.id;
  let command = context.text.toString();

  let parse = NODE_INFO_REGEX.exec(command)
  console.log(parse)

  let node = helix;
  let nodeUrl = provider;
  if (parse !== null) {
    nodeUrl = parse[1]
    node = Helix.composeAPI({
        provider: provider
    });
  }

  console.log("Requesting node info: " + node)

  node.getNodeInfo()
    .then(info => {
      console.log("Info done")
      bot.sendMessage({
        chat_id: chatId,
        parse_mode: "Markdown",
        text: `*Helix Node*: ${nodeUrl}\n`
          + toCodeSnippet(JSON.stringify(info, null, 2))
      })
  }).catch(err => {
      context.error =  {
        log: err,
        text: `Failed to get node info: ${err}`
      }
      sendError(context)
  })
}

/**
*
* Helper Functions
*/

function usageString() {
  // TODO: compile from the command map
  return "/getNodeInfo <address>: request info about your favorite Helix node\n" +
         "/getTxInfo <hash>: request confirmation status of a transcation\n" +
         "/giveMeMoney <address>: request 1000 HLX to the specified address\n" +
         "/pleaseHelpMe: in case you think something is broken or you feel lonely"
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
