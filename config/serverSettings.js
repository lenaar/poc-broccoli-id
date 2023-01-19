/**
 *
 *            Server specific settings
 *
 * *************************************************
 * * WARNING! Secrets should be read from env-vars *
 * *************************************************
 *
 */
const { getEnv, devDefaults, unpackRedisConfig, unpackNodeApiConfig } = require('kth-node-configuration')

// DEFAULT SETTINGS used for dev, if you want to override these for you local environment, use env-vars in .env
const devPort = devDefaults(3000)
const devSsl = devDefaults(false)
const devUrl = devDefaults('http://localhost:' + devPort)
const devNodeApi = devDefaults('http://localhost:3001/api/node?defaultTimeout=10000') // required=true&
const devSessionKey = devDefaults('node-web.sid')
const devSessionUseRedis = devDefaults(true)
const devRedis = devDefaults('redis://localhost:6379/')
const devOidcIssuerURL = devDefaults('https://login.ref.ug.kth.se/adfs')
const devOidcConfigurationURL = devDefaults(`${devOidcIssuerURL}/.well-known/openid-configuration`)
const devOidcTokenSecret = devDefaults('tokenSecretString')
const prefixPath = devDefaults('/node')
const devOidcCallbackURL = devDefaults(`http://localhost:3000${prefixPath}/auth/login/callback`)
const devOidcCallbackSilentURL = devDefaults(`http://localhost:3000${prefixPath}/auth/silent/callback`)
const devOidcLogoutCallbackURL = devDefaults(`http://localhost:3000${prefixPath}/auth/logout/callback`)
// END DEFAULT SETTINGS

// These options are fixed for this application

module.exports = {
  hostUrl: getEnv('SERVER_HOST_URL', devUrl),
  useSsl: String(getEnv('SERVER_SSL', devSsl)).toLowerCase() === 'true',
  port: getEnv('SERVER_PORT', devPort),
  ssl: {
    // In development we don't have SSL feature enabled
    pfx: getEnv('SERVER_CERT_FILE', ''),
    passphrase: getEnv('SERVER_CERT_PASSPHRASE', ''),
  },

  // API keys
  apiKey: {
    // nodeApi: getEnv('NODE_API_KEY', devDefaults('1234')),
  },

  // Authentication
  auth: {
    adminGroup: 'app.node.admin',
  },
  // oidc: {
  //   configurationUrl: getEnv('OIDC_CONFIGURATION_URL', devDefaults(devOidcConfigurationURL)),
  //   clientId: getEnv('OIDC_APPLICATION_ID', null),
  //   clientSecret: getEnv('OIDC_CLIENT_SECRET', null),
  //   tokenSecret: getEnv('OIDC_TOKEN_SECRET', devDefaults(devOidcTokenSecret)),
  //   callbackLoginUrl: getEnv('OIDC_CALLBACK_URL', devDefaults(devOidcCallbackURL)),
  //   callbackSilentLoginUrl: getEnv('OIDC_CALLBACK_SILENT_URL', devDefaults(devOidcCallbackSilentURL)),
  //   callbackLogoutUrl: getEnv('OIDC_CALLBACK_LOGOUT_URL', devDefaults(devOidcLogoutCallbackURL)),
  // },

  // Service API's
  nodeApi: {
    // nodeApi: unpackNodeApiConfig('NODE_API_URI', devNodeApi),
  },

  // Cortina
  blockApi: {
    blockUrl: getEnv('CM_HOST_URL', devDefaults('https://www-r.referens.sys.kth.se/cm/')),
  },

  // Logging
  logging: {
    log: {
      level: getEnv('LOGGING_LEVEL', 'debug'),
    },
    accessLog: {
      useAccessLog: getEnv('LOGGING_ACCESS_LOG', true),
    },
  },
  clientLogging: {
    level: 'debug',
  },
  cache: {
    cortinaBlock: {
      redis: unpackRedisConfig('REDIS_URI', devRedis),
    },
  },

  // Session
  sessionSecret: getEnv('SESSION_SECRET', devDefaults('1234567890')),
  session: {
    key: getEnv('SESSION_KEY', devSessionKey),
    useRedis: String(getEnv('SESSION_USE_REDIS', devSessionUseRedis)).toLowerCase() === 'true',
    sessionOptions: {
      // do not set session secret here!!
      cookie: {
        secure: String(getEnv('SESSION_SECURE_COOKIE', true)).toLowerCase() === 'true',
        path: getEnv('SERVICE_PUBLISH', '/node'),
      },
    },
    redisOptions: unpackRedisConfig('REDIS_URI', devRedis),
  },
  toolbar: {
    url: getEnv('TOOLBAR_URL', devDefaults('https://www-r.referens.sys.kth.se/social/toolbar/widget.js')),
  },

  externalIpAddressForBankId: getEnv('EXTERNAL_IP_ADDRESS_FOR_BANKD_ID', devDefaults('127.0.0.1')),
}
