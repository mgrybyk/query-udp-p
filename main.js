const cluster = require('cluster')

const { sleep } = require('./sleep')

const urlList = require(process.env.URL_LIST || './list.json')

const main = async () => {
  if (cluster.isPrimary) {
    for (let i = 0; i < urlList.length; i++) {
      await sleep(300)
      cluster.fork({ URL_LIST_IDX: i })
    }
  }
}

module.exports = { main }
