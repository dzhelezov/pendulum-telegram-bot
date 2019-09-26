#!/bin/sh
#you need BOT_WEBHOOK env variable set, e.g. like that
# export $(cat .env) 
curl -v -k -X POST -H "Content-Type: application/json" \
   -H "Cache-Control: no-cache"  --data-binary "@test-tg-message.json" "${BOT_WEBHOOK}"
