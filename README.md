# hlx-bot
Telegram bot

# Local testing
- Create `.env` file with the following entries:
```
BOT_TOKEN=<YOUR BOT TOKEN ID>
HELIX_PROVIDER=<YOUR HELIX PROVIDER>
```
- Put your AWS API credentials to `~/.aws/credentials`
- Deploy AWS lambda function and connect to Gateway API as explained [here](https://dev.to/nqcm/-building-a-telegram-bot-with-aws-api-gateway-and-aws-lambda-27fg)
- For local testing put your test response for the Telegram API to `test-tg-message.json` and run `lambda-local-test.js`
- The messages will appear in your bot chat

## Testing your bot webhook
- set the environment variable `BOT_WEBHOOK` to bot's webhook (that is, your AWS Gateway endpoint, registered
  as described in Telegram [docs](https://core.telegram.org/bots/api#setwebhook))

- run `test_curl.sh`

# AWS deployment
- Obtain `BOT_TOKEN` from the Bot Father as explained in [API](https://core.telegram.org/bots/api)
- Create AWS Gateway endpoint and integrate with AWS Lambda function as explained [here](https://dev.to/nqcm/-building-a-telegram-bot-with-aws-api-gateway-and-aws-lambda-27fg)
- Package the sources into a zip archive
```
zip -FSr deploy.zip *.js package-lock.json node_modules
```
- Update your AWS lambda function
```
aws lambda update-function-code --function-name <lambda-func-name> --zip-file fileb://deploy.zip
```

# TODO
A more robust way to develop and deploy is by using [serverless](https://serverless.com/) framework.
