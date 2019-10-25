
function promiseTimeout (ms, promise) {
  let id;
  let timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      reject(new TimeoutException(ms))
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

function TimeoutException(timeout) {
    this.error = 'Timed out in ' + timeout + 'ms.';
    this.name = 'TimeoutException';
}

module.exports = {
  promiseTimeout, TimeoutException
}
