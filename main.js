const { Worker } = require('worker_threads')

const { sleep } = require('./sleep')

const urlList = require(process.env.URL_LIST || './list.json')

const main = async () => {
  for (let i = 0; i < urlList.length; i++) {
    await sleep(300)
    const worker = new Worker('./runner.js', {
      workerData: urlList[i],
    })
    worker.on('exit', console.log)
  }
}

module.exports = { main }
