const crypto = require('crypto')
const log = require('@kth/log')

function generateQrCode(authData, orderTime = '') {
  const { qrStartToken, qrStartSecret = '' } = authData || {}
  const qrTime = new Date()
  const qrTimeSeconds = new Date(qrTime - orderTime).getSeconds()
  const qrAuthCode = crypto.createHmac('sha256', qrStartSecret).update(qrTimeSeconds.toString()).digest('hex')
  const qrCodeStr = `bankid.${qrStartToken}.${qrTimeSeconds}.${qrAuthCode}`
  return { qrCodeStr, qrAuthCode, qrTimeSeconds }
}

function individualQRcodePipeline(ctx, authData, orderTime) {
  let idx = 0
  log.info('----->individualQRcodePipeline', { orderTime, idx })

  const intervalId = setInterval(() => {
    const { qrCodeStr } = generateQrCode(authData, orderTime)

    log.info('-----> start webscoket interval', { nextQRCodeStr: qrCodeStr, idx })
    ctx.send(JSON.stringify({ nextQRCodeStr: qrCodeStr, idx }))
    idx++
  }, 1000)
  return intervalId
}

module.exports = individualQRcodePipeline
