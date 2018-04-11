const Bot = require('node-telegram-bot-api');
const IOTA = require('iota.lib.js');

const provider = 'http://hlxbox.net:14700';
const token = '594517291:AAFU0UV0GfLMFpAYGDr6-VNeCK4eFDu6q1k';
const trigger = 'getNodeInfo';

var iota = new IOTA({
    'provider': provider,
});



// Create a bot that uses 'polling' to fetch new updates
const bot = new Bot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});
