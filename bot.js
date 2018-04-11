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

function parseResponse(lssm, lm, t, n) {
  return "Latest Solid Subtangle Milestone Index: " + lssm + '\n' +
         "Latest Milestone Index: " + lm + '\n' +
         "Tips: " + t + '\n' +
         "Neighbors: " + n + '\n';
}

bot.on('message', (msg) => {
  const prov = iota.provider;
  const chatId = msg.chat.id;
  var cmd = msg.text.toString();
  bot.sendMessage(chatId, 'Request: ' + cmd + ' received...');

  if (cmd != '/start') {
    bot.sendMessage(chatId, 'Connected to: ' + prov);
  }
  if (msg.text.toString() === '/getNodeInfo') {
      iota.api.getNodeInfo(function(e, response) {
        var lssm = response.latestSolidSubtangleMilestoneIndex;
        var lm = response.latestMilestoneIndex;
        var tips = response.tips;
        var neighbors = response.neighbors;
        resp = parseResponse(lssm, lm, tips, neighbors);
        bot.sendMessage(chatId, resp);
      });
  }
});
