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
    // set timeout for 5 seconds
    let handleMessage = promiseTimeout(5000, bot.handleBotMessage(data.message));

    handleMessage.then(response => {
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

function promiseTimeout(ms, promise) {
  let id;
  let timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      reject('Timed out in ' + ms + 'ms.')
    }, ms)
  })

  return Promise.race([
    promise,
    timeout
  ]).then((result) => {
    clearTimeout(id)
    return result
  })
}
