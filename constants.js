module.exports = {
  // interval between requests. 1000 / 2 means 500 max requests per second (per worker) is allowed
  REQ_DELAY: 2,
  // concurrent requests adopts based on error rate, but won't exceed the max value
  MAX_CONCURRENT_REQUESTS: 20000,
  // interval between printing stats and calculating error rate
  INTERVAL: 60 * 1000,
}
