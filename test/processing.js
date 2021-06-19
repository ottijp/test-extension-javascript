const path = require('path')
const util = require('util')
const fs = require('fs')
const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert');
const handler = require('serve-handler');
const http = require('http');

const processingJsPath = path.join(__dirname, '..', 'src', 'processing.js')

let processingJs
let driver
let server

before(async function() {
  this.timeout(10000)

  // Webサーバの起動
  server = http.createServer((request, response) => {
    return handler(request, response, {
      public: path.join(__dirname, '..', 'public'),
      directoryListing: false,
    })
  })
  server.keepAliveTimeout = 500
  server.listen(3000)

  // Safariのドライバ
  driver = await new Builder().forBrowser('safari').build()
  // テスト対象のJavasScript
  processingJs = await util.promisify(fs.readFile)(processingJsPath, 'utf-8')
})

after(async function() {
  // Webサーバの停止
  await driver.quit()
  server.close()
})

// テスト対象のJavaScriptを実行する
async function runProcessingJs() {
  return await driver.executeScript(async (processingJs) => {
    eval(processingJs)
    return new Promise((resolve) => {
      ExtensionPreprocessingJS.run({
        completionFunction: (runResult) => {
          resolve(runResult)
        }})
    })
  }, processingJs)
}

describe('processing', function() {
  this.timeout(5000)

  // 日本語ページのベースURLとタイトルを取得する
  it('ja', async function() {
    await driver.get('http://localhost:3000/ja')
    const result = await runProcessingJs()
    assert(result.title === '日本語のページ<アングルブラケット>')
    assert(result.baseURI === 'http://localhost:3000/ja')
  })
})

