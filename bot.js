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

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Request received...');
  console.log(msg.text.toString());
  if (msg.text.toString() === '.getNodeInfo') {
    console.log("test");
    iota.api.getNodeInfo(function(e, response) {
      var lssm = response.LatestSolidSubtangleMilestoneIndex;
      console.log('test lssm: ' + lssm);
      bot.sendMessage(chatId, lssm);
    });
  }
});
