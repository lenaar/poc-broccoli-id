# Migrate to kth-node-passport-oicd

## Modules

Uninstall CAS and Ldap

```bash
$ npm uninstall kth-node-ldap kth-node-passport-cas
```

Install kth-node-passport-oidc

```bash
$ npm install @kth/kth-node-passport-oidc
```

## Code

### serverSettings.js

Remove

```javascript
const devLdap = undefined // Do not enter LDAP_URI or LDAP_PASSWORD here, use env_vars
const devSsoBaseURL = devDefaults('https://login-r.referens.sys.kth.se')
```

```javascript
const devLdapBase = devDefaults('OU=UG,DC=ref,DC=ug,DC=kth,DC=se')
```

```javascript
const ldapOptions = {
  base: getEnv('LDAP_BASE', devLdapBase),
  filter: '(ugKthid=KTHID)',
  filterReplaceHolder: 'KTHID',
  userattrs: ['displayName', 'mail', 'ugUsername', 'memberOf', 'ugKthid'],
  groupattrs: ['cn', 'objectCategory'],
  testSearch: true, // TODO: Should this be an ENV setting?
  timeout: typeConversion(getEnv('LDAP_TIMEOUT', null)),
  reconnectTime: typeConversion(getEnv('LDAP_IDLE_RECONNECT_INTERVAL', null)),
  reconnectOnIdle: getEnv('LDAP_IDLE_RECONNECT_INTERVAL', null) !== null,
  connecttimeout: typeConversion(getEnv('LDAP_CONNECT_TIMEOUT', null)),
  searchtimeout: typeConversion(getEnv('LDAP_SEARCH_TIMEOUT', null)),
}

Object.keys(ldapOptions).forEach(key => {
  if (ldapOptions[key] === null) {
    delete ldapOptions[key]
  }
})
```

```javascript
 cas: {
    ssoBaseURL: getEnv('CAS_SSO_URI', devSsoBaseURL),
  },
  ldap: unpackLDAPConfig('LDAP_URI', getEnv('LDAP_PASSWORD'), devLdap, ldapOptions),
```

Add

```javascript
const devOidcIssuerURL = devDefaults('https://login.ref.ug.kth.se/adfs')
const devOidcConfigurationURL = devDefaults(`${devOidcIssuerURL}/.well-known/openid-configuration`)
const devOidcTokenSecret = devDefaults('tokenSecretString')
const prefixPath = devDefaults('/node') // Change this to your prefixPath!!!
const devOidcCallbackURL = devDefaults(`http://localhost:3000${prefixPath}/auth/login/callback`)
const devOidcCallbackSilentURL = devDefaults(`http://localhost:3000${prefixPath}/auth/silent/callback`)
const devOidcLogoutCallbackURL = devDefaults(`http://localhost:3000${prefixPath}/auth/logout/callback`)
```

> Note: Change the prefixPath to fit your application!

```javascript
 oidc: {
    configurationUrl: getEnv('OIDC_CONFIGURATION_URL', devDefaults(devOidcConfigurationURL)),
    clientId: getEnv('OIDC_APPLICATION_ID', null),
    clientSecret: getEnv('OIDC_CLIENT_SECRET', null),
    tokenSecret: getEnv('OIDC_TOKEN_SECRET', devDefaults(devOidcTokenSecret)),
    callbackLoginUrl: getEnv('OIDC_CALLBACK_URL', devDefaults(devOidcCallbackURL)),
    callbackSilentLoginUrl: getEnv('OIDC_CALLBACK_SILENT_URL', devDefaults(devOidcCallbackSilentURL)),
    callbackLogoutUrl: getEnv('OIDC_CALLBACK_LOGOUT_URL', devDefaults(devOidcLogoutCallbackURL)),
  },
```

### server.js

Remove

```javascript
/* ******************************
 * ******* AUTHENTICATION *******
 * ******************************
 */
const passport = require('passport')
// const ldapClient = require('./adldapClient')
const {
  authLoginHandler,
  authCheckHandler,
  logoutHandler,
  pgtCallbackHandler,
  serverLogin,
  getServerGatewayLogin,
} = require('kth-node-passport-cas').routeHandlers({
  casLoginUri: _addProxy('/login'),
  casGatewayUri: _addProxy('/loginGateway'),
  proxyPrefixPath: config.proxyPrefixPath.uri,
  server,
})
const { redirectAuthenticatedUserHandler } = require('./authentication')

server.use(passport.initialize())
server.use(passport.session())

const authRoute = AppRouter()
authRoute.get('cas.login', _addProxy('/login'), authLoginHandler, redirectAuthenticatedUserHandler)
authRoute.get('cas.gateway', _addProxy('/loginGateway'), authCheckHandler, redirectAuthenticatedUserHandler)
authRoute.get('cas.logout', _addProxy('/logout'), logoutHandler)
// Optional pgtCallback (use config.cas.pgtUrl?)
authRoute.get('cas.pgtCallback', _addProxy('/pgtCallback'), pgtCallbackHandler)
server.use('/', authRoute.getRouter())

// Convenience methods that should really be removed
server.login = serverLogin
server.gatewayLogin = getServerGatewayLogin
```

Replace with this

```javascript
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

const { OpenIDConnect, hasGroup } = require('@kth/kth-node-passport-oidc')

const oidc = new OpenIDConnect(server, passport, {
  ...config.oidc,
  callbackLoginRoute: _addProxy('/auth/login/callback'),
  callbackLogoutRoute: _addProxy('/auth/logout/callback'),
  callbackSilentLoginRoute: _addProxy('/auth/silent/callback'),
  defaultRedirect: _addProxy(''),
  failureRedirect: _addProxy(''),
  // eslint-disable-next-line no-unused-vars
  extendUser: (user, claims) => {
    // eslint-disable-next-line no-param-reassign
    user.isAdmin = hasGroup(config.auth.adminGroup, user)
  },
})

// eslint-disable-next-line no-unused-vars
server.get(_addProxy('/login'), oidc.login, (req, res, next) => res.redirect(_addProxy('')))

// eslint-disable-next-line no-unused-vars
server.get(_addProxy('/logout'), oidc.logout)
```

If you don´t have the `_addProxy` function:

```javascript
const _addProxy = uri => `${config.proxyPrefixPath.uri}${uri}`
```

Change of routes examples

```javascript
appRoute.get('node.index', _addProxy('/'), serverLogin, Sample.getIndex)

==>

appRoute.get('node.index', _addProxy('/'), oidc.login, Sample.getIndex)
```

```javascript
appRoute.get('node.index', _addProxy('/'), getServerGatewayLogin('/'), Sample.getIndex)

==>

appRoute.get('node.index', _addProxy('/'), oidc.silentLogin, Sample.getIndex)
```

```javascript
appRoute.get('node.index', _addProxy('/'), requireRole('isAdmin'), Sample.getIndex)

==>

appRoute.get('node.index', _addProxy('/'), oidc.requireRole('isAdmin'), Sample.getIndex)
```

Remove

```javascript
const { requireRole } = require('./authentication')
```

### authentication.js

First check in the redirectAuthenticatedUserHandler function and specifically the unpackLdapUser function.

If you have groups here, maybe "isAdmin" or "isSupport" and so on.

Copy this code.

And remove this file. Yupp, delete it!

If you copied code, go to `server.js` and the to the `extendUser` function. This is where this code belongs now, and may the existing admin role already works for you.

### adldapClient.js

Delete this file if you have it

### systemCtrl.js

Maybe you have a monitor test on ldap? Then it's time to remove it.

Remove

```javascript
const ldapClient = require('../adldapClient')
```

```javascript
// Check LDAP
const ldapHealthUtil = registry.getUtility(IHealthCheck, 'kth-node-ldap')
subSystems.push(ldapHealthUtil.status(ldapClient, config.ldap))
```

## `req.session.authUser` is now `req.user`

Go through the code and look for places where you use `req.session.authUser` and use `req.user` instead.

## Config .env

Delete all with Ldap (unless you use it for more than authentication!)

In development mode you need 2 new things in your .env file.

```bash
OIDC_APPLICATION_ID=
OIDC_CLIENT_SECRET=
```

## Referens and Production - Cellus

In your secrets file you will need:

```bash
OIDC_APPLICATION_ID=
OIDC_CLIENT_SECRET=
OIDC_TOKEN_SECRET=
OIDC_CONFIGURATION_URL=
OIDC_CALLBACK_URL=
OIDC_CALLBACK_SILENT_URL=
OIDC_CALLBACK_LOGOUT_URL=
```

Silent and logout is optional depending if you use it :-)
