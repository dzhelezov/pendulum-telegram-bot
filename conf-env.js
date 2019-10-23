const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  token: process.env.BOT_TOKEN,
  provider: process.env.HELIX_PROVIDER,
  seed: process.env.SEED,
  spreadsheetId: process.env.SPREADSHEET,
  sheet: process.env.SHEET,
  keyFile: process.env.KEY_FILE
};
