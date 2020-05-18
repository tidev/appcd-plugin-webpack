const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')

let server
const connections = []
const app = new Koa()

async function start({ dev = app.env !== 'production', port = 3000 } = {}) {
  const configPath = require.resolve('../nuxt.config.js')
  const config = require(configPath)
  config.watch = [configPath]
  config.dev = dev
  config.server = { port }
  if (!dev) {
    config._start = true
  }
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1'
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  server = app.listen(port, host)
  server.on('connection', connection => {
    const key = connection.remoteAddress + ':' + connection.remotePort
    connections[key] = connection
    connection.on('close', () => {
      delete connections[key]
    })
  })

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

function stop() {
  server.close()
  for (const connection of connections) {
    connection.destroy()
  }
}

module.exports = {
  start,
  stop
}

if (require.main === module) {
  start()
}
