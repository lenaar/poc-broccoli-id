const axios = require('axios')
const https = require('https')
const fs = require('fs')
const path = require('path')
const log = require('@kth/log')
const setupWebSocket = require('../wsSetup')
const server = require('../server')
const serverConfig = require('../configuration').server

const bankIdApiUrl = 'https://appapi2.test.bankid.com/rp/v5.1'
// QR CODES https://appapi2.bankid.com/rp/v5.1
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
  const { method } = params
  log.info(` trying to auth order `, { params, query })
  log.info(' connection remote addres', req.connection.remoteAddress)
  // data.data.orderRef
  const { data } = await axios.create(getBrocolliIdAgent()).post(
    bankIdApiUrl + '/auth',
    JSON.stringify({
      endUserIp: serverConfig.externalIpAddressForBankId, // TODO: must be client ip as seen been by RP
    })
  )
  const orderTime = new Date()
  const { autoStartToken, qrStartToken } = data

  if (method === 'qrcode') setupWebSocket(server, data, orderTime)

  // qrStartSecret must not be sent to the client
  // bankid is a fixed prefix.
  // qrStartToken is from the auth or sign response.
  // time is the number of seconds since the result from auth or sign was returned.
  // qrAuthCode is computed as HMACSHA256(qrStartSecret, time)
  log.info('data', { data })
  log.info('auth initiated, please open bankid to authenticate ', { orderRef: data.orderRef })

  res.json({
    autoStartToken, // to open in the same device
    message: 'auth initiated, please open bankid to authenticate ',
    orderRef: data.orderRef,
    orderTime,
    qrStartToken,
  })
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
async function sleep(fn, ...args) {
  await timeout(2000)
  return await fn(...args)
}
const TRANSACTIONS_FAILS = ['cancelled', 'certificateErr', 'expiredTransaction', 'startFailed', 'userCancel']
// 'expiredTransaction' && // msg RFA8
// 'certificateErr' && // msg RFA16
// 'userCancel' && // msg RFA6
// 'cancelled' && // msg RFA3
// 'startFailed'

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
    if (!TRANSACTIONS_FAILS.includes(data.hintCode)) {
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
