const { handleBotMessage, handleWithTimeout } = require('./bot.js')

function testBalance() {
    let context = {
      text: '/checkBalance a3267bd425bc4495084da6f31496cb726de8974175ce09b4ad3c8a5d34b92a11',
      chat: {
        id: 370798623
      }
    }
    handleWithTimeout(context, 2000)
        .then(r => console.log(r))
        .catch(e => console.error(e));
}

function testInfo() {
  let context = {
    text: '/getNodeInfo https://hlxtest33.net:8085',
    chat: {
      id: 370798623
    }
  }
  handleWithTimeout(context, 2000)
      .then(r => console.log(r))
      .catch(e => console.error(e));
}

function testFaucet() {
  let context = {
    text: '/giveMeMoney a3267bd425bc4495084da6f31496cb726de8974175ce09b4ad3c8a5d34b92a11',
    chat: {
      id: 370798623
    }
  }
  handleWithTimeout(context, 2000)
      .then(r => console.log(r))
      .catch(e => console.error(e));
}

function testTx() {
  let context = {
    text: '/getTxInfo 00007a9e9b3f6fef265c12e06ad7433017fcd0485ad826d817149f689214adfb',
    chat: {
      id: 370798623
    }
  }
  handleWithTimeout(context, 2000)
      .then(r => console.log(r))
      .catch(e => console.error(e));
}

function testHelp() {
  let context = {
    text: '/pleaseHelpMe',
    chat: {
      id: 370798623
    }
  }
  handleWithTimeout(context, 2000)
      .then(r => console.log(r))
      .catch(e => console.error(e));
}

function testStart() {
  let context = {
    text: '/start',
    chat: {
      id: 370798623
    }
  }
  handleWithTimeout(context, 2000)
      .then(r => console.log(r))
      .catch(e => console.error(e));

}

if (module === require.main) {
    setTimeout(() => testHelp(), 1000);
    setTimeout(() => testTx(), 1000);
    setTimeout(() => testFaucet(), 1000);
    setTimeout(() => testStart(), 1000);
    setTimeout(() => testInfo(), 1000);
    setTimeout(() => testBalance(), 1000);

    //testTx();
    //testFaucet();
    //testInfo();
    //testBalance();
}
