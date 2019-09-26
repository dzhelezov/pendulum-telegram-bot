const bot = require('./bot.js')

exports.handler = function (event, context, callback) {
    console.log(event);
    let data = JSON.parse(event.body);
    let res ={
        "statusCode": 200,
        "headers": {
            "Content-Type": "*/*",
        },
        "body": "OK"
    };
    console.log(data);
    console.log(data.message);
    bot.handleBotMessage(data.message)
        .then(() => callback(null, res));

};
