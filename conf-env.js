const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  token: process.env.BOT_TOKEN,
  provider: process.env.HELIX_PROVIDER,
};
