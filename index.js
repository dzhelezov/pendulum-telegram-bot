const bot = require('./bot.js')

exports.handler = async (event) => {
    const operation = event.queryStringParameters ? event.queryStringParameters.operation : null;
    console.log(event);
    let data = JSON.parse(event.body);
    console.log(data.result[0].message);
    bot.handleBotMessage(data.result[0].message);
};
