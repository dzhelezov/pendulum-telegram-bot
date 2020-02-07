const lambdaLocal = require('lambda-local');
const path = require('path')
const message = require('./test-tg-message.json')


const jsonPayload = {
    body: JSON.stringify(message)
}

lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: path.join(__dirname, 'index.js'),
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    timeoutMs: 3000
}).then(function(done) {
    console.log(done);
}).catch(function(err) {
    console.log(err);
});
