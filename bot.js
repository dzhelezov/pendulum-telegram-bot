const Bot = require('telegram-bot-api');
const { token }  = require('./conf-env.js')
const { send, getBalance, nodeInfo, getConfimationStatus } = require('./helix.js')
const { getRows, updateSheet, getStats } = require('./gsheets.js')

const bot = new Bot({
    token: token
});


function UserException(userText, error) {
    this.userText = userText;
    this.error = error;
    this.name = 'UserException';
}

const FAUCET_REGEX = /\/giveMeMoney\s*([A-Fa-f0-9]+)/g
const TX_INFO_REGEX = /\/getTxInfo\s*([A-Fa-f0-9]+)/g
const NODE_INFO_REGEX = /\/getNodeInfo\s*([\/\.:A-Za-z0-9]+)/g
const BALANCE_REGEX = /\/checkBalance\s*([A-Fa-f0-9]+)/g



async function handleBotMessage(message) {
    console.log(`Handling message ${JSON.stringify(message)}`);

    let context = message;
    let command = message.text.toString();

    /**
    *
    * TODO: refactor with a command map
    */
    try {
        if (command === '/start') {
            return await startDialog(context)
        } else  if (command.indexOf('/checkBalance') !==  -1) {
            return await checkBalance(context)
        } else  if (command.indexOf('/giveMeMoney') !==  -1) {
            return await giveMeMoney(context)
        } else if (command.indexOf('/getTxInfo') !== -1) {
            return await getTxInfo(context)
        } else if (command.indexOf('/getNodeInfo') !== -1) {
            return await getNodeInfo(context)
        } else if (command.indexOf('/pleaseHelpMe') !== -1) {
            return await getHelpInfo(context)
        }
    } catch (err) {
      console.error(err);
      if (err instanceof UserException) {
          console.error(err.error);
          return botMessage(context, err.userText);
      } else {
          return botMessage(context, `Oooops, something went wrong`);
      }
    }

 }

async function botMessage(context, text) {
    let chatId = context.chat.id;
    return bot.sendMessage({
        chat_id: chatId,
        parse_mode: "Markdown",
        text: text.replace("\n", "")
    })
}



async function getHelpInfo(context) {
    return botMessage(context, `We are really sorry to hear something went astray.\ ` +
          `Please tell us about your issue [here](https://discord.gg/MN6e6Je)\ ` +
          `and we will do our best. Yours truly, Helix \u{1F916}.`);
}

async function startDialog(context) {
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

        let sendRes = await send(seed, address, rcv, 1000);
        console.log(sendRes);
        let tx = sendRes.txs[0];
        // update the sheet with the address of the looter
        await updateSheet(updateCell, rcv);

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
    let nodeUrl = (parse !== null) ? parse[1] : provider;
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
/giveMeMoney <address>: request 1000 HLX to the specified address
/pleaseHelpMe: in case you think something is broken or you feel lonely`
}

function toCodeSnippet(str, cmd) {
  return "``` " + str + "\n ```"
}

module.exports = {
  handleBotMessage
}
