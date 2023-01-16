function individualPipeline(ctx) {
  let idx = 0
  const interval = setInterval(() => {
    ctx.send(`ping pong ${idx}`)
    idx++
  }, 5000)
  return interval
}

module.exports = individualPipeline
