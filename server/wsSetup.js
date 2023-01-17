const WebSocket = require('ws')
const log = require('@kth/log')
const individualQRcodePipeline = require('./wsqrcode')

function setupWebSocket(server, authData = {}, orderTime) {
  // ws instance
  log.info('Start setting up a web socket on server', setupWebSocket)
  const wss = new WebSocket.WebSocketServer({ port: 8080 })
  // handle upgrade of the request
  server.on('upgrade', (request, socket, head) => {
    try {
      // authentication and some other steps will come here
      // we can choose whether to upgrade or not

      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request)
      })
    } catch (err) {
      log.errro('upgrade exception', err)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }
  })

  // what to do after a connection is established
  wss.on('connection', ctx => {
    // print number of active connections
    log.info('connected', wss.clients.size)

    // handle message events
    // receive a message and echo it back
    ctx.on('message', message => {
      const messageStr = message.toString()
      const messageBody = JSON.parse(messageStr)
      const { collectStatus } = messageBody || {}
      log.info(`Received message `, { message: message.toString() })
      ctx.send(`Message is received`)
      if (collectStatus === 'resolved') {
        log.info('Auth is collected, closing web socket on server side')
        wss.close()
      }
    })

    const interval = individualQRcodePipeline(ctx, authData, orderTime)
    log.info('started interval', interval)

    ctx.on('close', () => {
      log.info('closed', wss.clients.size)
      clearInterval(interval)
    })

    ctx.send('connection established.')
  })
}

module.exports = setupWebSocket
