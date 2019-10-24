#!/bin/sh
export timestamp=$( date +%s )
export filename=build-$timestamp.zip
zip -r $filename index.js bot.js conf-env.js gsheets.js helix.js .jwt node_modules
aws lambda update-function-code --function-name helix_explorer_test_bot --zip-file fileb:\/\/$filename
sleep 5
rm $filename
