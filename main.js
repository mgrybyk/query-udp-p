const { sleep } = require('./sleep')
const { runner } = require('./runner')

const urlList = require(process.env.URL_LIST || './list.json')

const main = async () => {
  for (let i = 0; i < urlList.length; i++) {
    await sleep(300)
    runner(...urlList[i])
  }
}

module.exports = { main }
