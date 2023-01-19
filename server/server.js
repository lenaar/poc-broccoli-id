/* eslint-disable import/order */

// Now read the server config etc.
const config = require('./configuration').server

/* ***********************
 * ******* LOGGING *******
 * ***********************
 */
const log = require('@kth/log')

const packageFile = require('../package.json')

const logConfiguration = {
  name: packageFile.name,
  level: config.logging.log.level,
}

log.init(logConfiguration)

const server = require('@kth/server')

require('./api')
const AppRouter = require('kth-node-express-routing').PageRouter
const { getPaths } = require('kth-node-express-routing')

if (config.appInsights && config.appInsights.instrumentationKey) {
  const appInsights = require('applicationinsights')

  appInsights
    .setup(config.appInsights.instrumentationKey)
    .setAutoDependencyCorrelation(false)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(false)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .start()
}

const _addProxy = uri => `${config.proxyPrefixPath.uri}${uri}`

// Expose the server and paths
server.locals.secret = new Map()
module.exports = server
module.exports.getPaths = () => getPaths()

/* **************************
 * ******* TEMPLATING *******
 * **************************
 */
const exphbs = require('express-handlebars')
const path = require('path')

server.set('views', path.join(__dirname, '/views'))
server.set('layouts', path.join(__dirname, '/views/layouts'))
server.set('partials', path.join(__dirname, '/views/partials'))
server.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'publicLayout',
    layoutsDir: server.settings.layouts,
    partialsDir: server.settings.partials,
  })
)
server.set('view engine', 'handlebars')
// Register handlebar helpers
require('./views/helpers')

/* ******************************
 * ******* ACCESS LOGGING *******
 * ******************************
 */
const accessLog = require('kth-node-access-log')

server.use(accessLog(config.logging.accessLog))

/* ****************************
 * ******* STATIC FILES *******
 * ****************************
 */
const browserConfig = require('./configuration').browser
const browserConfigHandler = require('kth-node-configuration').getHandler(browserConfig, getPaths())
const express = require('express')

// Removes the "X-Powered-By: Express header" that shows the underlying Express framework
server.disable('x-powered-by')

// helper
function setCustomCacheControl(res, path2) {
  if (express.static.mime.lookup(path2) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'no-cache')
  }
}

// Files/statics routes--

const staticOption = { maxAge: 365 * 24 * 3600 * 1000 } // 365 days in ms is maximum

// Expose browser configurations
server.use(_addProxy('/static/browserConfig'), browserConfigHandler)

// Files/statics routes
server.use(_addProxy('/static/kth-style'), express.static('./node_modules/kth-style/dist', staticOption))

// Map static content like images, css and js.
server.use(_addProxy('/static'), express.static('./dist', staticOption))

server.use(_addProxy('/static/icon/favicon'), express.static('./public/favicon.ico', staticOption))

// Return 404 if static file isn't found so we don't go through the rest of the pipeline
server.use(_addProxy('/static'), (req, res, next) => {
  const error = new Error('File not found: ' + req.originalUrl)
  error.status = 404
  next(error)
})

// QUESTION: Should this really be set here?
// http://expressjs.com/en/api.html#app.set
server.set('case sensitive routing', true)

/* *******************************
 * ******* REQUEST PARSING *******
 * *******************************
 */
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieParser())

/* ***********************
 * ******* SESSION *******
 * ***********************
 */
const session = require('@kth/session')

const options = config.session
options.sessionOptions.secret = config.sessionSecret
server.use(session(options))

/* ************************
 * ******* LANGUAGE *******
 * ************************
 */
const { languageHandler } = require('@kth/kth-node-web-common/lib/language')

server.use(config.proxyPrefixPath.uri, languageHandler)

/* ******************************
 ***** AUTHENTICATION - OIDC ****
 ****************************** */

const passport = require('passport')

server.use(passport.initialize())
server.use(passport.session())

passport.serializeUser((user, done) => {
  if (user) {
    done(null, user)
  } else {
    done()
  }
})

passport.deserializeUser((user, done) => {
  if (user) {
    done(null, user)
  } else {
    done()
  }
})

// const { OpenIDConnect, hasGroup } = require('@kth/kth-node-passport-oidc')

// const oidc = new OpenIDConnect(server, passport, {
//   ...config.oidc,
//   callbackLoginRoute: _addProxy('/auth/login/callback'),
//   callbackLogoutRoute: _addProxy('/auth/logout/callback'),
//   callbackSilentLoginRoute: _addProxy('/auth/silent/callback'),
//   defaultRedirect: _addProxy(''),
//   // eslint-disable-next-line no-unused-vars
//   extendUser: (user, claims) => {
//     // eslint-disable-next-line no-param-reassign
//     user.isAdmin = hasGroup(config.auth.adminGroup, user)
//   },
// })

// // eslint-disable-next-line no-unused-vars
// server.get(_addProxy('/login'), oidc.login, (req, res, next) => res.redirect(_addProxy('')))

// // eslint-disable-next-line no-unused-vars
// server.get(_addProxy('/logout'), oidc.logout)

/* ********************************
 * ******* CRAWLER REDIRECT *******
 * ********************************
 */
const excludePath = _addProxy('(?!/static).*')
const excludeExpression = new RegExp(excludePath)
server.use(
  excludeExpression,
  require('@kth/kth-node-web-common/lib/web/crawlerRedirect')({
    hostUrl: config.hostUrl,
  })
)

/* **********************************
 * ******* SYSTEM ROUTES *******
 * **********************************
 */
const { System } = require('./controllers')

// System routes
const systemRoute = AppRouter()
systemRoute.get('system.monitor', _addProxy('/_monitor'), System.monitor)
systemRoute.get('system.about', _addProxy('/_about'), System.about)
systemRoute.get('system.paths', _addProxy('/_paths'), System.paths)
systemRoute.get('system.status', _addProxy('/_status'), System.status)
systemRoute.get('system.robots', '/robots.txt', System.robotsTxt)
server.use('/', systemRoute.getRouter())

/* ******************************
 * ******* CORTINA BLOCKS *******
 * ******************************
 */
// server.use(
//   config.proxyPrefixPath.uri,
//   require('@kth/kth-node-web-common/lib/web/cortina')({
//     blockUrl: config.blockApi.blockUrl,
//     proxyPrefixPath: config.proxyPrefixPath.uri,
//     hostUrl: config.hostUrl,
//     redisConfig: config.cache.cortinaBlock.redis,
//   })
// )

/* **********************************
 * ******* APPLICATION ROUTES *******
 * **********************************
 */
const { Sample, BankId } = require('./controllers')

// App routes
const appRoute = AppRouter()
appRoute.get('node.index', _addProxy('/'), Sample.getIndex)

appRoute.get('backend.auth', _addProxy('/backend/auth/:method'), BankId.authBroccolliId)
appRoute.get('backend.collect', _addProxy('/backend/collect/:orderRef'), BankId.collectBroccolliId)
appRoute.get('backend.sign', _addProxy('/backend/sign/:method'), BankId.signBroccolliId)

server.use('/', appRoute.getRouter())

// Not found etc
server.use(System.notFound)
server.use(System.final)

// Register handlebar helpers

require('./views/helpers')
