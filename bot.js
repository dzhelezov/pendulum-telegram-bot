const Bot = require('node-telegram-bot-api');
const IOTA = require('iota.lib.js');
const config = require('./config.json');

const provider = 'http://hlxbox.net:14700';
const token = config.token;
const trigger = 'getNodeInfo';

var iota = new IOTA({
    'provider': provider,
});
// Create a bot that uses 'polling' to fetch new updates
const bot = new Bot(token, {polling: true});



bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  var cmd = msg.text.toString();
  bot.sendMessage(chatId, 'Request: ' + cmd + ' received.');

  /**
  *
  * help Commands
  */

  if (msg.text.toString() === '/help' || '/start') {
    bot.sendMessage(printUsage());
  }

  /**
  *
  * API Commands
  */

  if (msg.text.toString() === '/getNodeInfo') {
      req();
      iota.api.getNodeInfo(function(e, response) {
        var lssm = response.latestSolidSubtangleMilestoneIndex;
        var lm = response.latestMilestoneIndex;
        var tips = response.tips;
        var neighbors = response.neighbors;
        resp = parseResponse(lssm, lm, tips, neighbors);
        bot.sendMessage(chatId, resp);
        console.log("'/getNodeInfo' request performed.");
      });
  }

  if (msg.text.toString() === '/getTips') {
    req();
    iota.api.getTips(function(e, r) {
        if (!e) {
          var recentTips = r.slice(0,10);
          bot.sendMessage(chatId, "Latest Tips:" + '\n' + recentTips);
        }
        else {
          bot.sendMessage(chatId, "Error: " + '\n' + e);
        }
        console.log("'/getTips' request performed.");
    });
  }
});

/**
*
* Helper Functions
*/


function printUsage() {
  return "Available Commands: " + '\n' +
         "/getNodeInfo" + '\n' +
         "/getTips" + '\n';
}

function parseNodeInfo(lssm, lm, t, n) {
  return "Latest Solid Subtangle Milestone Index: " + lssm + '\n' +
         "Latest Milestone Index: " + lm + '\n' +
         "Tips: " + t + '\n' +
         "Neighbors: " + n + '\n';
}

function req() {
  bot.sendMessage("Request '/getNodeInfo' sent to: " + iota.provider);
}
