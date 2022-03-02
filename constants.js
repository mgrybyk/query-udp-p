module.exports = {
  // interval between requests. 1000 / 1 means 1000 max requests per second (per worker) is allowed
  REQ_DELAY: 1,
  // concurrent requests adopts based on error rate, but won't exceed the max value
  MAX_CONCURRENT_REQUESTS: 49152,
  // interval between printing stats and calculating error rate
  INTERVAL: 60 * 1000,
}
