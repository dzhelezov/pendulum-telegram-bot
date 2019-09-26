const bot = require('./bot.js')

exports.handler = function (event, context, callback) {
    console.log(event);
    let data = JSON.parse(event.body);
    let res ={
        "statusCode": 200,
        "headers": {
            "Content-Type": "*/*",
        }
    };
    console.log(data);
    console.log(data.message);
    bot.handleBotMessage(data.message)
        .then(() => {
          res.body = "OK";
          callback(null, res)
        })
        .catch((err) => {
          // we still send 200
          // to prevent repeated webhook calls
          res.body = `Error: ${err}`;
          callback(null, res)
        });

};
