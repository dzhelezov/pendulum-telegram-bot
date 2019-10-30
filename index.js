const { handleBotMessage, handleWithTimeout } = require('./bot.js')
const { promiseTimeout } = require('./utils.js')

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
    //console.log(data.message);
    // set timeout for 5 seconds
    let handle = promiseTimeout(5500, handleWithTimeout(data.message, 5000));


    handle.then(response => {
        res.body = JSON.stringify(response);
        callback(null, res);
      }).catch(err => {
        // we still return 200 to prevent
        // telegram from resubmitting
        // the message. But we log the error
        console.error(err);
        res.body = `Error: ${err}`;
        callback(null, res);
    })
};
