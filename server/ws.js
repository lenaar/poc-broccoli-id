const WebSocket = require('ws')
const log = require('@kth/log')
const individualPipeline = require('./wsqrcode')
// accepts an http server (covered later)
function setupWebSocket(server) {
  // ws instance
  const wss = new WebSocket.Server({ noServer: true })

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
      log.info(`Received message => ${message}`)
      ctx.send(`you said ${message}`)
    })

    const interval = individualPipeline(ctx)

    // handle close event
    ctx.on('close', () => {
      log.info('closed', wss.clients.size)
      clearInterval(interval)
    })

    // sent a message that we're good to proceed
    ctx.send('connection established.')
  })
}

// const wss = new WebSocket.Server({ port: 3000 })

// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(data) {
//     wss.clients.forEach(function each(client) {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(data)
//         // console.log('data', data);
//       }
//     })
//   })
// })
module.exports = setupWebSocket
