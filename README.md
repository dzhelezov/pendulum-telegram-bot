# hlx-bot
Telegram bot

# local deployment

- Create `.env` file with the following entries:
```
BOT_TOKEN=<YOUR BOT TOKEN ID>
HELIX_PROVIDER=<YOUR HELIX PROVIDER>
```
- Put your AWS API credentials to `~/.aws/credentials`
- Deploy AWS lambda function and connect to Gateway API as explained [here](https://dev.to/nqcm/-building-a-telegram-bot-with-aws-api-gateway-and-aws-lambda-27fg)
- For local testing put your test response for the Telegram API to `test-tg-message.json` and run `lambda-local-test.js`
- The messages will appear in your bot chat
