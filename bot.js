const Bot = require('telegram-bot-api');
const { token, provider }  = require('./conf-env.js')
const { send, getBalance, nodeInfo, getConfimationStatus } = require('./helix.js')
const { getRows, updateSheet, getStats } = require('./gsheets.js')
const { promiseTimeout, TimeoutException } = require('./utils.js')

const bot = new Bot({
    token: token
});


function UserException(userText, error) {
    this.userText = userText;
    this.error = error;
    this.name = 'UserException';
}

const FAUCET_REGEX = /.*\/givememoney[\n\r\s]+([A-Fa-f0-9]+).*/g
const TX_INFO_REGEX = /.*\/gettxinfo[\n\r\s]+([A-Fa-f0-9]+).*/g
const NODE_INFO_REGEX = /.*\/getnodeinfo[\n\r\s]+([\/\.:A-Za-z0-9]+).*/g
const BALANCE_REGEX = /.*\/checkbalance[\n\r\s]+([A-Fa-f0-9]+).*/g

async function handleWithTimeout(context, ts) {
      let waitMsg = await botMessage(context, `Processing`);
      console.log(`Wait msg: ${JSON.stringify(waitMsg)}`);
      try {
          context.replyTo = context.message_id;
          context.editMessage = waitMsg.message_id;
          await promiseTimeout(2000, handleBotMessage(context))
      } catch (err) {
          if (err instanceof TimeoutException) {
            return await botMessage(context, `Sorry, I had to abort the request as\ ` +
                `as it was taking too long to complete. Please, try again.`);
          }

          if (err instanceof UserException) {
              console.error(err.error);
              return await botMessage(context, err.userText);
          }
          console.log(err);
          return await botMessage(context, `Oooops, an unexpected error occured`);
      }
}

async function handleBotMessage(message) {
    console.log(`Handling message ${JSON.stringify(message)}`);

    let context = message;
    let command = message.text.toString().toLowerCase();

    /**
    *
    * TODO: refactor with a command map
    */

    if (command === '/start') {
        return await startDialog(context)
    } else  if (command.indexOf('/checkbalance') !==  -1) {
        return await checkBalance(context)
    } else  if (command.indexOf('/givememoney') !==  -1) {
        return await giveMeMoney(context)
    } else if (command.indexOf('/gettxinfo') !== -1) {
        return await getTxInfo(context)
    } else if (command.indexOf('/getnodeinfo') !== -1) {
        return await getNodeInfo(context)
    } else if (command.indexOf('/pleasehelpme') !== -1) {
        return await getHelpInfo(context)
    }

    return await botMessage(context, "Sorry, I can't recognize this command");
 }

async function botMessage(context, text) {
    let chatId = context.chat.id;
    if (context.editMessage) {
      return bot.editMessageText({
          chat_id: context.chat.id,
          message_id: context.editMessage,
          parse_mode: "Markdown",
          text: text
      });
    }
    let msg = {
        chat_id: chatId,
        parse_mode: "Markdown",
        text: text.replace("\n", "")
    }
    if (context.replyTo || context.message_id) {
      msg.reply_to_message_id = (context.replyTo) ?
            context.replyTo : context.message_id;
    }

    //if (context.replyMarkup) {
    //  msg.reply_markup:  {
    //     resize_keyboard: true,
    //     one_time_keyboard: true,
    //     keyboard: context.replyMarkup.map(s => [{ text: s }])
    //  }
    //}

    return bot.sendMessage(msg);
}



async function getHelpInfo(context) {
    return botMessage(context, `Usage: ${usageString()}\n\ ` +
          `If you believe something doesn't work or you are simply up up\ ` +
          `for a chat, please join us [here](https://discord.gg/MN6e6Je)\ ` +
          `and we will do our best. Yours truly, Helix \u{1F916}.`);
}

async function startDialog(context) {
    //context.replyMarkup = ["Check Balance", "Give me HLX!",
    //      "Check transaction", "Node info", "Help"];
    //return botMessage(context, "*HLXtestBot* started" + "\u{1F916}\n");

    return botMessage(context, "*HLXtestBot* started" + "\u{1F916}\n" + usageString());
}

async function checkBalance(context) {
    let command = context.text.toString();

    console.log(`checkBalance: ${command}`);
    let parse = BALANCE_REGEX.exec(command);
    if (parse === null) {
       throw new UserException(`Hmm, the string _${command}_ you provided\ ` +
          `does not look like an address. \nUsage: /checkBalance <address>`, 'PARSE_ERROR');
    }

    let addr = parse[1];

    try {
      let balance = await getBalance(addr);
      return botMessage(context, `Current balance of _${addr}_ is *${balance.balances[0]}* HLX`);
    } catch (err) {
        throw new UserException(`Oooops, something nasty happened while\ ` +
          `checking the balance. Please, try again later and contact us on\ ` +
          `our [discord channel](https://discord.gg/MN6e6Je)`, err);
    }
}

async function giveMeMoney(context) {
    let command = context.text.toString();

    console.log(`giveMeMoney: ${command}`);
    let parse = FAUCET_REGEX.exec(command);

    if (parse === null) {
       throw new UserException(`Hmm, the string _${command}_ you provided\ ` +
            `does not look like an address. \nUsage: /giveMeMoney <address>`, 'PARSE_ERROR');
    }

    let rcv = parse[1];

    let stats = await getStats();
    if (stats.available < 0.2 * stats.total) {
        throw new UserException(`Sorry, the faucet is running out of funds.\ `+
            `Please notify us on [discord channel](https://discord.gg/MN6e6Je)\ ` +
            `and we'll top it up`);
    }

    let indices = Array.from({length: 10},
      () => Math.floor(Math.random() * stats.total));


    try {
        let rows = await getRows(indices);
        console.log(rows);
        // take the first available, there will be one with overwhelming probability
        let { seed, address, updateCell } = rows.filter(r => r.available)[0];

        let sendRes = await send(seed, address, rcv, 10000);
        console.log(sendRes);
        let tx = sendRes.txs[0];
        // update the sheet with the address of the looter
        await updateSheet(updateCell, `User: ${context.chat.username}, addr: ${rcv}`);

        return botMessage(context, `All done, your HLX is on it's way. You can check the\ ` +
            `transaction status by the hash: *${tx}*`)
    } catch (err) {
        throw new UserException(`Oooops, something nasty happened while transferring\ ` +
            `HLX to your address. Please, try again later and contact us on\ ` +
            `our [discord channel](https://discord.gg/MN6e6Je)`, err);
    }
}

async function getTxInfo(context) {
    let command = context.text.toString();

    console.log("getTxInfo: " + command)
    let parse = TX_INFO_REGEX.exec(command)
    console.log(parse)

    if (parse === null) {
       throw new UserException(`Hmm, the string _${command}_ you provided\ ` +
          `does not look like a transaction hash. \nUsage: /getTxInfo <tx hash>`, 'PARSE_ERROR');
    }

    let tx = parse[1]
    console.log(`Transaction hash: ${tx}`);

    try {
        let status = await getConfimationStatus(tx);
        let text = status ? `*${tx}* is confirmed! ` : `*${tx}* is not confirmed`;
        return botMessage(context, text);
    } catch (err) {
      throw new UserException(`Ooops, something went wrong try again later and\ `+
          `ping us on our [discord channel](https://discord.gg/MN6e6Je)`, err);
    }
}



async function getNodeInfo(context) {
    //let chatId = context.chat.id;
    console.log(context);
    let command = context.text.toString();

    let parse = NODE_INFO_REGEX.exec(command)
    console.log(parse)
    if (parse === null) {
      throw new UserException(`Hmm, the string _${command}_ you provided\ ` +
         `does not look like a valid URL. \nUsage: /getNodeInfo <url>`, 'PARSE_ERROR');
    }
    let nodeUrl = parse[1];

    try {
      console.log(`Requesting node info: ${nodeUrl}`);
      let info = await nodeInfo(nodeUrl);
      return botMessage(context, toCodeSnippet(JSON.stringify(info, null, 2)));
    } catch (err) {
      throw new UserException(`Oooops, failed to connect to ${nodeUrl}, check if\ `+
          `the URL is correct (should look like https://my.node.com:8065) and\ `+
          `ping us on our [discord channel](https://discord.gg/MN6e6Je)`, err);
    }
}

/**
*
* Helper Functions
*/

function usageString() {
  // TODO: compile from the command map
  return `
/getNodeInfo <url>: request info about your favorite Helix node
/getTxInfo <hash>: request confirmation status of a transcation
/checkBalance <address>: check the current balance of an address
/giveMeMoney <address>: request 10000 HLX to the specified address
/pleaseHelpMe: in case you think something is broken or you feel lonely`
}

function toCodeSnippet(str, cmd) {
  return "``` " + str + "\n ```"
}

module.exports = {
  handleBotMessage, handleWithTimeout
}
