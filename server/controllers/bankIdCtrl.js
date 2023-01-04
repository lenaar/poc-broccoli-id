const axios = require('axios')
const https = require('https')
const fs = require('fs')
const path = require('path')
const log = require('@kth/log')

const bankIdApiUrl = 'https://appapi2.test.bankid.com/rp/v5'

function selectFile(filename, type) {
  return fs.readFileSync(path.resolve(__dirname, '../../cert', filename), type)
}
function getCertificate() {
  const pfx = selectFile('FPTestcert4_20220818.p12') // FPTestcert2_20150818_102329.pfx
  const ca = selectFile('test.ca', 'utf-8')
  const passphrase = 'qwerty123'

  return {
    pfx,
    ca,
    passphrase,
  }
}

function getBrocolliIdAgent() {
  const certificate = getCertificate()
  return {
    httpsAgent: new https.Agent(certificate),
    headers: {
      'Content-Type': 'application/json',
    },
  }
}

async function authBroccolliId(req, res, next) {
  const { params, query } = req
  log.info(` trying to auth order `, { params, query })
  log.info(req.connection.remoteAddress)
  // data.data.orderRef
  const { data } = await axios.create(getBrocolliIdAgent()).post(
    bankIdApiUrl + '/auth',
    JSON.stringify({
      personalNumber: params.pnr, // req.query.pnr
      endUserIp: '127.0.0.1',
      // endUserIp: '10.56.40.158', // TODO: must be client ip as seen been by RP
    })
  )

  log.info('data', { data })
  log.info('auth initiated, please open bankid to authenticate ', { orderRef: data.orderRef })

  res.json({ message: 'auth initiated, please open bankid to authenticate ', orderRef: data.orderRef }) // orderRef
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
async function sleep(fn, ...args) {
  await timeout(2000)
  return await fn(...args)
}

const callCollect = async orderRef => {
  // Extract data
  const { data } = await axios.create(getBrocolliIdAgent()).post(
    bankIdApiUrl + '/collect',
    JSON.stringify({
      orderRef,
    })
  )
  // data = await data.json()
  log.info('call collected data', { data })
  if (data.hintCode) {
    if (
      data.hintCode != 'expiredTransaction' && // msg RFA8
      data.hintCode != 'certificateErr' && // msg RFA16
      data.hintCode != 'userCancel' && // msg RFA6
      data.hintCode != 'cancelled' && // msg RFA3
      data.hintCode != 'startFailed'
    ) {
      // msg RFA17
      log.info('set timeout')
      return await sleep(callCollect, orderRef)
      // log.info('after sleep', data);
    } else {
      // fail, return
      log.info('fail, return') // msg RFA22
      return data
    }
  } else {
    log.info('return data', data)
    return data
  }
}

async function collectBroccolliId(req, res, next) {
  const { params, query } = req
  log.info(` trying to collect order `, { params, query })

  const data = await callCollect(params.orderRef)
  log.info('collected', data)
  res.json({
    message: 'response collected, check for status',
    status: data.status,
    completionData: data.completionData,
  })
}

module.exports = { authBroccolliId, collectBroccolliId }
